import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./MovieDetails.css";

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        fetchMovies(`/movie/${id}`).then(setMovie);
        fetchMovies(`/movie/${id}/credits`).then(data => setCast(data.cast.slice(0, 8)));
        fetchMovies(`/movie/${id}/recommendations`).then(data => setRecommendations(data.results.slice(0, 10)));
        fetchMovies(`/movie/${id}/videos`).then(data => {
            const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if (yt) setTrailer(`https://www.youtube.com/embed/${yt.key}?autoplay=1`);
        });
        setVideoUrl(null);
    }, [id]);

    if (!movie) return <LoadingSpinner text="Loading movie details..." />;

    return (
        <div className="movie-detail">
            {/* Hero Section */}
            <div className="hero" style={{ backgroundImage: `url(${getImage(movie.backdrop_path, 'original')})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                    <h1 className="movie-title">{movie.title}</h1>

                    <div className="movie-meta">
                        <span className="rating">⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        <span>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                        <span>{movie.runtime} min</span>
                    </div>

                    <div className="genres">
                        {movie.genres.map(g => <span key={g.id}>{g.name}</span>)}
                    </div>

                    {movie.tagline && <p className="tagline">"{movie.tagline}"</p>}
                    <p className="overview">{movie.overview}</p>

                    <div className="action-buttons">
                        <button className="watch-btn" onClick={() => setVideoUrl(`https://www.vidking.net/embed/movie/${id}?autoPlay=true&color=ff0000`)}>
                            ▶ Watch Now
                        </button>
                        {trailer && (
                            <button className="trailer-btn" onClick={() => setVideoUrl(trailer)}>
                                🎬 Watch Trailer
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="content-section">
                {videoUrl && (
                    <div className="video-player-container">
                        <div className="video-player-wrapper">
                            <iframe
                                src={videoUrl}
                                title="Video Player"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <button className="close-player" onClick={() => setVideoUrl(null)}>Close Player</button>
                    </div>
                )}

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

                <div className="recommendations-row">
                    <h2>Recommended</h2>
                    <div className="row-scroll">
                        {recommendations.map(m => (
                            <MovieCard key={m.id} movie={m} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
