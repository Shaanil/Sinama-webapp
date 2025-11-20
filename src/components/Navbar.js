import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ setPage, onSearch }) {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query);
            setPage("search");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1 onClick={() => setPage("home")}>Sinama</h1>
            </div>

            <div className="navbar-right">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>
            </div>
        </nav>
    );
}
