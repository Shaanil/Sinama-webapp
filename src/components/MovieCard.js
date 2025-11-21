import React from "react";
import { Link } from "react-router-dom";
import { getImage } from "../api";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
    return (
        <Link to={`/movie/${movie.id}`} className="movie-card-link">
            <div className="movie-card">
                <img src={getImage(movie.poster_path)} alt={movie.title} />
                <div className="overlay">
                    <h3>{movie.title}</h3>
                    <p>⭐ {movie.vote_average}</p>
                </div>
            </div>
        </Link>
    );
}
