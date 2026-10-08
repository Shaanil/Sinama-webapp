import React from "react";
import { Link } from "react-router-dom";
import { getImage } from "../api";
import "./MovieCard.css";

export default function MovieCard({ movie, type = "movie" }) {
    return (
        <Link to={`/${type}/${movie.id}`} className="movie-card-link">
            <div className="movie-card">
                <img src={getImage(movie.poster_path)} alt={movie.title || movie.name} />
                <div className="overlay">
                    <h3>{movie.title || movie.name}</h3>
                    <p>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
                </div>
            </div>
        </Link>
    );
}
