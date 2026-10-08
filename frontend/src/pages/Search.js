import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMedia } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query]);

    async function search(q) {
        setLoading(true);
        try {
            setResults(await searchMedia(q));
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="search-page">
            {query && <h2>Results for: "{query}"</h2>}

            {loading && <LoadingSpinner text="Searching..." />}

            {!loading && query && results.length === 0 && (
                <div className="no-results">
                    <p>No results found for "{query}"</p>
                </div>
            )}

            <div className="search-grid">
                {results.map(m => (
                    <MovieCard 
                        key={m.id} 
                        movie={m} 
                        type={m.media_type || 'movie'} 
                    />
                ))}
            </div>
        </div>
    );
}
