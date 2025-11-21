import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
        if (query) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query]);

    async function search(q) {
        setLoading(true);
        try {
            const res = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_KEY}&query=${q}`
            );
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            setSearchParams({ q: inputValue });
        }
    };

    return (
        <div className="search-page">
            <div className="search-bar">
                <input
                    placeholder="Search movies..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <button onClick={() => inputValue.trim() && setSearchParams({ q: inputValue })}>Search</button>
            </div>

            {loading && <LoadingSpinner text="Searching..." />}

            {!loading && query && results.length === 0 && (
                <div className="no-results">
                    <p>No results found for "{query}"</p>
                </div>
            )}

            <div className="row-scroll">
                {results.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
        </div>
    );
}
