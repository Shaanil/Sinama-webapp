const SOURCE_ORDER = [
    "ridomovies",
    "cloudnestra",
    "rgshows",
    "lookmovie",
    "vidnest",
    "fsharetv",
    "hdrezka",
    "tugaflix",
];
const SOURCE_TIMEOUT_MS = 12000;

const { buildMediaProxyUrl } = require("./mediaProxy");

let providersModulePromise;

function getProvidersModule() {
    if (!providersModulePromise) {
        providersModulePromise = import("@mzazimhenga/providers");
    }
    return providersModulePromise;
}

function normalizeFileStream(stream) {
    const qualityOrder = ["4k", "1080", "720", "480", "360", "unknown"];
    const selectedQuality = qualityOrder.find(
        (quality) => stream.qualities?.[quality]?.url,
    );

    if (!selectedQuality) {
        return null;
    }

    const streamHeaders = {
        ...(stream.preferredHeaders || {}),
        ...(stream.headers || {}),
    };

    const proxiedQualities = qualityOrder.reduce((acc, quality) => {
        const qualityStream = stream.qualities?.[quality];
        if (!qualityStream?.url) {
            return acc;
        }

        acc[quality] = {
            type: qualityStream.type,
            url: buildMediaProxyUrl(
                qualityStream.url,
                streamHeaders,
            ),
        };
        return acc;
    }, {});

    return {
        type: "file",
        url: proxiedQualities[selectedQuality].url,
        quality: selectedQuality,
        qualities: proxiedQualities,
        headers: stream.headers || {},
        preferredHeaders: stream.preferredHeaders || {},
        captions: normalizeCaptions(stream.captions, streamHeaders),
    };
}

function normalizeCaptions(captions, headers) {
    return (captions || [])
        .filter((caption) => caption?.url)
        .map((caption) => ({
            ...caption,
            url: caption.url.startsWith("/api/media-proxy")
                ? caption.url
                : buildMediaProxyUrl(caption.url, headers),
        }));
}

function normalizeStream(stream) {
    if (!stream) return null;

    const streamHeaders = {
        ...(stream.preferredHeaders || {}),
        ...(stream.headers || {}),
    };

    if (stream.type === "hls") {
        return {
            type: "hls",
            url: buildMediaProxyUrl(
                stream.playlist,
                streamHeaders,
            ),
            headers: stream.headers || {},
            preferredHeaders: stream.preferredHeaders || {},
            captions: normalizeCaptions(stream.captions, streamHeaders),
        };
    }

    if (stream.type === "file") {
        return normalizeFileStream(stream);
    }

    return null;
}

function buildMediaFromQuery(query) {
    const {
        type,
        tmdbId,
        title,
        releaseYear,
        seasonNumber,
        seasonTmdbId,
        episodeNumber,
        episodeTmdbId,
    } = query;

    if (!type || !tmdbId || !title || !releaseYear) {
        throw new Error("Missing required media fields");
    }

    if (type === "movie") {
        return {
            type: "movie",
            tmdbId: String(tmdbId),
            title: String(title),
            releaseYear: Number(releaseYear),
        };
    }

    if (type === "show") {
        if (!seasonNumber || !seasonTmdbId || !episodeNumber || !episodeTmdbId) {
            throw new Error("Missing required episode fields");
        }

        return {
            type: "show",
            tmdbId: String(tmdbId),
            title: String(title),
            releaseYear: Number(releaseYear),
            season: {
                number: Number(seasonNumber),
                tmdbId: String(seasonTmdbId),
            },
            episode: {
                number: Number(episodeNumber),
                tmdbId: String(episodeTmdbId),
            },
        };
    }

    throw new Error("Unsupported media type");
}

function formatScrapeError(error) {
    const baseMessage = error?.message || "Unknown scrape error";
    const cause = error?.cause;

    if (cause?.hostname && cause?.code) {
        return `${baseMessage} (${cause.code}: ${cause.hostname})`;
    }

    if (cause?.message) {
        return `${baseMessage} (${cause.message})`;
    }

    return baseMessage;
}

async function withTimeout(promise, timeoutMs, label) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
}

async function scrapeMedia(query) {
    const media = buildMediaFromQuery(query);
    const providersLib = await getProvidersModule();
    const providers = providersLib.makeProviders({
        fetcher: providersLib.makeStandardFetcher(fetch),
        proxiedFetcher: providersLib.makeStandardFetcher(fetch),
        target: providersLib.targets.ANY,
        consistentIpForRequests: true,
        proxyStreams: false,
    });

    const errors = [];

    for (const sourceId of SOURCE_ORDER) {
        try {
            const output = await withTimeout(
                providers.runAll({
                    media,
                    sourceOrder: [sourceId],
                }),
                SOURCE_TIMEOUT_MS,
                `${sourceId} scrape`,
            );

            const stream = normalizeStream(output?.stream);
            if (!stream) {
                errors.push({ sourceId, message: "No playable stream returned" });
                continue;
            }

            return {
                sourceId,
                stream,
            };
        } catch (error) {
            errors.push({
                sourceId,
                message: formatScrapeError(error),
            });
        }
    }

    const finalError = new Error("No playable sources found");
    finalError.details = errors;
    throw finalError;
}

module.exports = {
    scrapeMedia,
};
