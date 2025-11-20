import React from "react";
import { getImage } from "../api";
import "./MovieCard.css";

export default function MovieCard({ movie, onClick }) {
    return (
        <div className="movie-card" onClick={onClick}>
            <img src={getImage(movie.poster_path)} alt={movie.title} />
            <div className="overlay">
                <h3>{movie.title}</h3>
                <p>⭐ {movie.vote_average}</p>
            </div>
        </div>
    );
}
