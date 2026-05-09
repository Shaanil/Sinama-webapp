const API_KEY = process.env.REACT_APP_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23222222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial,sans-serif' font-size='28'%3ENo Image%3C/text%3E%3C/svg%3E";

function buildTmdbUrl(endpoint, params = {}) {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${BASE_URL}${normalizedEndpoint}`);

    if (!API_KEY) {
        throw new Error("Missing REACT_APP_TMDB_KEY");
    }

    url.searchParams.set("api_key", API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }
        url.searchParams.set(key, String(value));
    });

    return url.toString();
}

export async function fetchTmdb(endpoint, params = {}) {
    const res = await fetch(buildTmdbUrl(endpoint, params));
    if (!res.ok) {
        throw new Error(`TMDB API Error: ${res.status}`);
    }
    return res.json();
}

export async function fetchMovies(endpoint, params = {}) {
    try {
        return await fetchTmdb(endpoint, params);
    } catch (error) {
        console.error("Failed to fetch TMDB data:", error);
        return { results: [], cast: [], genres: [], seasons: [], episodes: [] };
    }
}

export async function searchMedia(query) {
    if (!query.trim()) return [];

    const data = await fetchTmdb("/search/multi", { query });
    return (data.results || []).filter(
        (item) => item.media_type === "movie" || item.media_type === "tv",
    );
}

export function getImage(path, size = "w500") {
    if (!path) return FALLBACK_IMAGE;
    return `${IMAGE_BASE_URL}/${size}${path}`;
}
