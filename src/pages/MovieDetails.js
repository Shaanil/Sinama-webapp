import React, { useEffect, useState } from "react";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./MovieDetails.css";

export default function MovieDetails({ movieId, onBack }) {
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false); // Toggle for video player

    useEffect(() => {
        fetchMovies(`/movie/${movieId}`).then(setMovie);
        fetchMovies(`/movie/${movieId}/credits`).then(data => setCast(data.cast.slice(0, 8)));
        fetchMovies(`/movie/${movieId}/recommendations`).then(data => setRecommendations(data.results.slice(0, 10)));
        fetchMovies(`/movie/${movieId}/videos`).then(data => {
            const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if(yt) setTrailer(`https://www.youtube.com/embed/${yt.key}`);
        });
        setShowPlayer(false); // Reset player when changing movie
    }, [movieId]);

    if (!movie) return <LoadingSpinner text="Loading movie details..." />;

    return (
        <div className="movie-detail">
            {/* Backdrop and Info */}
            <div className="backdrop" style={{backgroundImage: `url(${getImage(movie.backdrop_path, 'original')})`}}>
                <div className="info-overlay">
                    <button onClick={onBack} className="back-btn">← Back</button>
                    <h1>{movie.title}</h1>
                    <p>{movie.overview}</p>
                    <p>Rating: {movie.vote_average} | Release: {movie.release_date} | Runtime: {movie.runtime} mins</p>
                    <div className="genres">{movie.genres.map(g => <span key={g.id}>{g.name}</span>)}</div>

                    {/* Trailer */}
                    {trailer && (
                        <div className="trailer-container">
                            <iframe
                                width="560"
                                height="315"
                                src={trailer}
                                title="Trailer"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>

                            {/* Watch Now button */}
                            <button className="watch-btn" onClick={() => setShowPlayer(true)}>
                                ▶ Watch Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Card (shown when "Watch Now" is clicked) */}
            {showPlayer && (
                <div className="video-player-card">
                    <h2>Now Playing: {movie.title}</h2>
                    <iframe
                        width="100%"
                        height="500px"
                        src={`https://www.vidking.net/embed/movie/${movieId}?autoPlay=true&color=ff0000`}
                        title="Watch Movie"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* Cast Row */}
            <div className="cast-row">
                <h2>Cast</h2>
                <div className="row-scroll">
                    {cast.map(actor => (
                        <div key={actor.id} className="cast-card">
                            <img src={getImage(actor.profile_path)} alt={actor.name} />
                            <p>{actor.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-row">
                <h2>Recommended</h2>
                <div className="row-scroll">
                    {recommendations.map(m => (
                        <MovieCard key={m.id} movie={m} onClick={() => onBack && onBack(m.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
