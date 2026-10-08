import React from "react";
import { Link } from "react-router-dom";
import { getImage } from "../api";
import "./MovieCard.css";

export default function MovieCard({ movie, type = "movie" }) {
    if (!movie?.id) return null;

    const resolvedType = movie.media_type || type;
    const title = movie.title || movie.name;
    const imagePath = resolvedType === "person" ? movie.profile_path : movie.poster_path;

    return (
        <Link to={`/${resolvedType}/${movie.id}`} className="movie-card-link">
            <div className="movie-card">
                <img src={getImage(imagePath)} alt={title} />
                <div className="overlay">
                    <h3>{title}</h3>
                    <p>{resolvedType === "person" ? "Person" : `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}`}</p>
                </div>
            </div>
        </Link>
    );
}
