import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [query, setQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${query}`);
            setIsSearchOpen(false); // Close on search
        } else {
            // Toggle open on empty search click (mobile)
            setIsSearchOpen(!isSearchOpen);
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
                <div className={`search-bar ${isSearchOpen ? 'open' : ''}`}>
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleSearch} aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
