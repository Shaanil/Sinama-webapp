const API_KEY = process.env.REACT_APP_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchMovies(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
    return res.json();
}

export function getImage(path, size = "w500") {
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
