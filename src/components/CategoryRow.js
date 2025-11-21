import React, { useEffect, useState, useRef } from "react";
import { fetchMovies } from "../api";
import MovieCard from "./MovieCard";

export default function CategoryRow({ title, endpoint }) {
    const [movies, setMovies] = useState([]);
    const scrollRef = useRef();

    useEffect(() => {
        fetchMovies(endpoint).then(data => setMovies(data.results));
    }, [endpoint]);

    const scroll = (direction) => {
        if (direction === "left") scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
        else scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    };

    return (
        <div className="category-row">
            <h2>{title}</h2>
            <div className="row-scroll-wrapper">
                <button className="scroll-btn left" onClick={() => scroll("left")}>◀</button>
                <div className="row-scroll" ref={scrollRef}>
                    {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
                <button className="scroll-btn right" onClick={() => scroll("right")}>▶</button>
            </div>
        </div>
    );
}
