import React, { useState } from "react";
import MovieCard from "../components/MovieCard";

export default function Search({ onSelectMovie }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    async function search() {
        if (!query) return;
        const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_KEY}&query=${query}`
        );
        const data = await res.json();
        setResults(data.results);
    }

    return (
        <div className="search-page">
            <div className="search-bar">
                <input placeholder="Search movies..." value={query} onChange={e => setQuery(e.target.value)} />
                <button onClick={search}>Search</button>
            </div>
            <div className="row-scroll">
                {results.map(m => <MovieCard key={m.id} movie={m} onClick={() => onSelectMovie(m.id)} />)}
            </div>
        </div>
    );
}
