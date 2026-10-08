import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./MovieDetails.css";

function formatMoney(value) {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [credits, setCredits] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [isClosingPlayer, setIsClosingPlayer] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("player-open", Boolean(videoUrl));
        return () => {
            document.body.classList.remove("player-open");
        };
    }, [videoUrl]);

    useEffect(() => {
        fetchMovies(`/movie/${id}`).then(setMovie);
        fetchMovies(`/movie/${id}/credits`).then(data => {
            setCredits(data);
            setCast(data.cast.slice(0, 8));
        });
        fetchMovies(`/movie/${id}/recommendations`).then(data => setRecommendations(data.results.slice(0, 10)));
        fetchMovies(`/movie/${id}/videos`).then(data => {
            const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if (yt) setTrailer(`https://www.youtube.com/embed/${yt.key}?autoplay=1`);
        });
        setVideoUrl(null);
    }, [id]);

    const getMoviePlayerUrl = () => `${(process.env.REACT_APP_PLAYER_BASE_URL || "https://vidsrc.sh").replace(/\/$/, "")}/embed/movie/${id}?autoplay=1`;
    const director = credits?.crew?.find((person) => person.job === "Director");
    const writers = credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || [];
    const movieHighlights = movie ? [
        { label: "TMDB Score", value: movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : "N/A" },
        { label: "Votes", value: movie.vote_count ? movie.vote_count.toLocaleString() : "N/A" },
        { label: "Release Date", value: movie.release_date || "N/A" },
        { label: "Runtime", value: movie.runtime ? `${movie.runtime} min` : "N/A" },
    ] : [];
    const movieFacts = movie ? [
        { label: "Original Title", value: movie.original_title || movie.title || "N/A" },
        { label: "Status", value: movie.status || "N/A" },
        { label: "Language", value: movie.original_language?.toUpperCase() || "N/A" },
        { label: "Budget", value: formatMoney(movie.budget) },
        { label: "Revenue", value: formatMoney(movie.revenue) },
        { label: "Popularity", value: movie.popularity ? movie.popularity.toFixed(0) : "N/A" },
    ] : [];

    const handleWatchNow = () => {
        if (!movie) return;
        setVideoUrl(getMoviePlayerUrl());
    };

    const handleClosePlayer = () => {
        setIsClosingPlayer(true);
        setTimeout(() => {
            setVideoUrl(null);
            setIsClosingPlayer(false);
        }, 400); // Wait for CSS animation to finish
    };

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

                    <div className="hero-stat-strip">
                        {movieHighlights.map((item) => (
                            <div key={item.label} className="hero-stat-card">
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="genres">
                        {movie.genres.map(g => <span key={g.id}>{g.name}</span>)}
                    </div>

                    {movie.tagline && <p className="tagline">"{movie.tagline}"</p>}
                    <p className="overview">{movie.overview}</p>

                    <div className="action-buttons">
                        <button className="watch-btn" onClick={handleWatchNow}>
                            ▶ Watch Now
                        </button>
                        {trailer && (
                            <button className="trailer-btn" onClick={() => setVideoUrl(trailer)}>
                                🎬 Watch Trailer
                            </button>
                        )}
                        <button className="storyverse-btn" onClick={() => navigate(`/movie/${id}/storyverse`)}>
                            📖 Storyverse
                        </button>
                    </div>
                </div>
            </div>

            <div className="content-section">
                <div className="detail-showcase">
                    <div className="detail-poster-card">
                        <img
                            src={getImage(movie.poster_path, "w780")}
                            alt={movie.title}
                            className="detail-poster"
                        />
                    </div>

                    <div className="detail-panel">
                        <div className="detail-panel-header">
                            <p className="section-kicker">About This Film</p>
                            <h2>More to know before you press play</h2>
                        </div>

                        <div className="fact-grid">
                            {movieFacts.map((fact) => (
                                <div key={fact.label} className="fact-card">
                                    <span className="fact-label">{fact.label}</span>
                                    <strong className="fact-value">{fact.value}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="detail-columns">
                            <div className="detail-block">
                                <h3>Studios</h3>
                                <p>{movie.production_companies?.length ? movie.production_companies.map((company) => company.name).join(", ") : "No studio information available."}</p>
                            </div>
                            <div className="detail-block">
                                <h3>Spoken Languages</h3>
                                <p>{movie.spoken_languages?.length ? movie.spoken_languages.map((language) => language.english_name).join(", ") : "No language information available."}</p>
                            </div>
                            <div className="detail-block">
                                <h3>Director</h3>
                                <p>{director?.name || "No director information available."}</p>
                            </div>
                            <div className="detail-block">
                                <h3>Writers</h3>
                                <p>{writers.length ? [...new Set(writers.map((writer) => writer.name))].join(", ") : "No writer information available."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {videoUrl && (
                    <div className={`video-player-container ${isClosingPlayer ? "closing" : ""}`}>
                        <div className="video-player-header">
                            <div>
                                <p className="player-kicker">{videoUrl === trailer ? "Trailer" : "Feature Film"}</p>
                                <h2>{movie.title}</h2>
                            </div>
                            <button className="close-player" onClick={handleClosePlayer}>Close Player</button>
                        </div>
                        <div className="video-player-wrapper">
                            <iframe
                                src={videoUrl}
                                title="Video Player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                <div className="cast-row">
                    <h2>Cast</h2>
                    <div className="row-scroll">
                        {cast.map(actor => (
                            <Link key={actor.id} to={`/person/${actor.id}`} className="cast-card">
                                <img src={getImage(actor.profile_path)} alt={actor.name} />
                                <p>{actor.name}</p>
                                {actor.character && <span>{actor.character}</span>}
                            </Link>
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
