import React, { useEffect, useState, useRef } from "react";
import { fetchMovies } from "../api";
import MovieCard from "./MovieCard";
import "./CategoryRow.css";

export default function CategoryRow({ title, endpoint, kicker, description }) {
    const [movies, setMovies] = useState([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        fetchMovies(endpoint).then(data => setMovies(data.results));
    }, [endpoint]);

    useEffect(() => {
        const row = scrollRef.current;
        if (!row) return undefined;

        const updateScrollState = () => {
            setCanScrollLeft(row.scrollLeft > 16);
            setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 16);
        };

        updateScrollState();
        row.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);

        return () => {
            row.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [movies]);

    const scroll = (direction) => {
        if (direction === "left") scrollRef.current.scrollBy({ left: -420, behavior: "smooth" });
        else scrollRef.current.scrollBy({ left: 420, behavior: "smooth" });
    };

    return (
        <div className="category-row">
            <div className="category-row-header">
                <div>
                    {kicker && <p className="category-kicker">{kicker}</p>}
                    <h2>{title}</h2>
                    {description && <p className="category-description">{description}</p>}
                </div>
                <div className="category-row-controls">
                    {canScrollLeft && (
                        <button className="scroll-btn left" onClick={() => scroll("left")} aria-label={`Scroll ${title} left`}>
                            <span aria-hidden="true">◀</span>
                            <em>Back</em>
                        </button>
                    )}
                    {canScrollRight && (
                        <button className="scroll-btn right" onClick={() => scroll("right")} aria-label={`Scroll ${title} right`}>
                            <em>More Picks</em>
                            <span aria-hidden="true">▶</span>
                        </button>
                    )}
                </div>
            </div>
            <div className="row-scroll-wrapper">
                <div className="row-scroll" ref={scrollRef}>
                    {movies.map(movie => <MovieCard key={movie.id} movie={movie} type={endpoint.includes("/tv") || endpoint.includes("tv") ? "tv" : "movie"} />)}
                </div>
            </div>
        </div>
    );
}
