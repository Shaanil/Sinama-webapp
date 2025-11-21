import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${query}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>Sinama</h1>
                </Link>
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
