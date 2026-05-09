const { Readable } = require("stream");

function encodeHeaders(headers) {
    return Buffer.from(JSON.stringify(headers || {})).toString("base64url");
}

function decodeHeaders(headersParam) {
    if (!headersParam) return {};

    try {
        return JSON.parse(Buffer.from(headersParam, "base64url").toString("utf8"));
    } catch {
        return {};
    }
}

function buildMediaProxyUrl(url, headers) {
    const params = new URLSearchParams({
        url,
        headers: encodeHeaders(headers),
    });

    return `/api/media-proxy?${params.toString()}`;
}

function getForwardHeaders(reqHeaders, extraHeaders) {
    const headers = {
        ...extraHeaders,
    };

    if (reqHeaders.range) {
        headers.range = reqHeaders.range;
    }

    return headers;
}

function rewritePlaylist(text, finalUrl, headers) {
    return text
        .split("\n")
        .map((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) {
                return line;
            }

            const absoluteUrl = new URL(trimmed, finalUrl).toString();
            return buildMediaProxyUrl(absoluteUrl, headers);
        })
        .join("\n");
}

async function proxyMedia(req, res) {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        res.status(400).json({ error: "Missing url parameter" });
        return;
    }

    const upstreamHeaders = decodeHeaders(req.query.headers);
    const response = await fetch(targetUrl, {
        method: req.method,
        headers: getForwardHeaders(req.headers, upstreamHeaders),
        redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const isPlaylist =
        contentType.includes("application/vnd.apple.mpegurl") ||
        contentType.includes("application/x-mpegurl") ||
        targetUrl.includes(".m3u8");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status);

    if (isPlaylist) {
        const playlistText = await response.text();
        const rewrittenPlaylist = rewritePlaylist(playlistText, response.url, upstreamHeaders);

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(rewrittenPlaylist);
        return;
    }

    const passthroughHeaders = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "cache-control",
        "etag",
        "last-modified",
    ];

    passthroughHeaders.forEach((headerName) => {
        const headerValue = response.headers.get(headerName);
        if (headerValue) {
            res.setHeader(headerName, headerValue);
        }
    });

    if (req.method === "HEAD") {
        res.end();
        return;
    }

    if (!response.body) {
        res.end();
        return;
    }

    Readable.fromWeb(response.body).pipe(res);
}

module.exports = {
    buildMediaProxyUrl,
    proxyMedia,
};
