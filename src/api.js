const API_KEY = process.env.REACT_APP_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchMovies(endpoint) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return { results: [], cast: [] }; // Return empty structure to prevent crashes
    }
}

export function getImage(path, size = "w500") {
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
