import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./MovieDetails.css";

export default function TvShowDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);


    useEffect(() => {
        fetchMovies(`/tv/${id}`).then(setShow);
        fetchMovies(`/tv/${id}/credits`).then(data => setCast(data.cast.slice(0, 8)));
        fetchMovies(`/tv/${id}/recommendations`).then(data => setRecommendations(data.results.slice(0, 10)));
        fetchMovies(`/tv/${id}/videos`).then(data => {
            const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if (yt) setTrailer(`https://www.youtube.com/embed/${yt.key}?autoplay=1`);
        });
        setVideoUrl(null);
    }, [id]);

    const handleWatch = () => {
        setVideoUrl(`https://www.vidking.net/embed/tv/${id}/1/1?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`);
    };

    if (!show) return <LoadingSpinner text="Loading show details..." />;

    return (
        <div className="movie-detail">
            {/* Hero Section */}
            <div className="hero" style={{ backgroundImage: `url(${getImage(show.backdrop_path, 'original')})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                    <h1 className="movie-title">{show.name}</h1>

                    <div className="movie-meta">
                        <span className="rating">⭐ {show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
                        <span>{show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A'}</span>
                        <span>{show.number_of_seasons} Seasons</span>
                    </div>

                    <div className="genres">
                        {show.genres.map(g => <span key={g.id}>{g.name}</span>)}
                    </div>

                    {show.tagline && <p className="tagline">"{show.tagline}"</p>}
                    <p className="overview">{show.overview}</p>

                    <div className="action-buttons">
                        <button className="watch-btn" onClick={handleWatch}>
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
                                sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                                referrerPolicy="no-referrer"
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
                            <MovieCard key={m.id} movie={m} type="tv" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
