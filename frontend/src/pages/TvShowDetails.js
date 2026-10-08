import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { hasAired } from "../utils/hasAired";
import "./MovieDetails.css";

function formatRunTime(runtime) {
    if (!runtime) return "N/A";
    return `${runtime} min`;
}

export default function TvShowDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [seasonDetails, setSeasonDetails] = useState(null);
    const [isClosingPlayer, setIsClosingPlayer] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("player-open", Boolean(videoUrl));
        return () => {
            document.body.classList.remove("player-open");
        };
    }, [videoUrl]);

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

    useEffect(() => {
        if (!show?.seasons?.length) return;

        const firstPlayableSeason = show.seasons.find((season) => season.season_number > 0) || show.seasons[0];
        if (firstPlayableSeason) {
            setSelectedSeason(firstPlayableSeason.season_number);
            setSelectedEpisode(1);
        }
    }, [show]);

    useEffect(() => {
        if (!id || selectedSeason === null) return;

        fetchMovies(`/tv/${id}/season/${selectedSeason}`).then((data) => {
            setSeasonDetails(data);
            const firstPlayableEpisode = data?.episodes?.find((episode) => hasAired(episode.air_date)) || data?.episodes?.[0];
            if (firstPlayableEpisode) {
                setSelectedEpisode(firstPlayableEpisode.episode_number);
            }
        });
    }, [id, selectedSeason]);

    const playableSeasons = show?.seasons?.filter((season) => season.season_number > 0) || [];
    const episodes = seasonDetails?.episodes || [];
    const selectedEpisodeData = episodes.find(
        (episode) => episode.episode_number === selectedEpisode,
    );
    const getTvPlayerUrl = () => `${(process.env.REACT_APP_PLAYER_BASE_URL || "https://vidsrc.sh").replace(/\/$/, "")}/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?autoplay=1&autonext=1`;
    const showFacts = show ? [
        { label: "Original Name", value: show.original_name || show.name || "N/A" },
        { label: "Status", value: show.status || "N/A" },
        { label: "Seasons", value: show.number_of_seasons || "N/A" },
        { label: "Episodes", value: show.number_of_episodes || "N/A" },
        { label: "Language", value: show.original_language?.toUpperCase() || "N/A" },
        { label: "Episode Length", value: formatRunTime(show.episode_run_time?.[0]) },
    ] : [];

    const handleWatch = () => {
        if (!show || !seasonDetails || !selectedEpisodeData) return;
        setVideoUrl(getTvPlayerUrl());
    };

    const handleClosePlayer = () => {
        setIsClosingPlayer(true);
        setTimeout(() => {
            setVideoUrl(null);
            setIsClosingPlayer(false);
        }, 400);
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
                <div className="detail-showcase">
                    <div className="detail-poster-card">
                        <img
                            src={getImage(show.poster_path, "w780")}
                            alt={show.name}
                            className="detail-poster"
                        />
                    </div>

                    <div className="detail-panel">
                        <div className="detail-panel-header">
                            <p className="section-kicker">Series Guide</p>
                            <h2>Everything you need before the next episode</h2>
                        </div>

                        <div className="fact-grid">
                            {showFacts.map((fact) => (
                                <div key={fact.label} className="fact-card">
                                    <span className="fact-label">{fact.label}</span>
                                    <strong className="fact-value">{fact.value}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="detail-columns">
                            <div className="detail-block">
                                <h3>Networks</h3>
                                <p>{show.networks?.length ? show.networks.map((network) => network.name).join(", ") : "No network information available."}</p>
                            </div>
                            <div className="detail-block">
                                <h3>Created By</h3>
                                <p>{show.created_by?.length ? show.created_by.map((creator) => creator.name).join(", ") : "No creator information available."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="season-selector">
                    <div className="selector-group">
                        <label htmlFor="season-select">Season</label>
                        <select
                            id="season-select"
                            value={selectedSeason}
                            onChange={(event) => setSelectedSeason(Number(event.target.value))}
                        >
                            {playableSeasons.map((season) => (
                                <option key={season.id} value={season.season_number}>
                                    {season.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="selector-group">
                        <label htmlFor="episode-select">Episode</label>
                        <select
                            id="episode-select"
                            value={selectedEpisode}
                            onChange={(event) => setSelectedEpisode(Number(event.target.value))}
                        >
                            {episodes.map((episode) => (
                                <option
                                    key={episode.id}
                                    value={episode.episode_number}
                                    disabled={!hasAired(episode.air_date)}
                                >
                                    {`E${episode.episode_number} • ${episode.name}${hasAired(episode.air_date) ? "" : " (Unaired)"}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedEpisodeData && (
                    <>
                        <p className="selected-episode-title">
                            {`${seasonDetails?.name || `Season ${selectedSeason}`} • E${selectedEpisodeData.episode_number} • ${selectedEpisodeData.name}`}
                        </p>
                        {selectedEpisodeData.overview && (
                            <p className="selected-episode-copy">{selectedEpisodeData.overview}</p>
                        )}
                    </>
                )}

                {videoUrl && (
                    <div className={`video-player-container ${isClosingPlayer ? "closing" : ""}`}>
                        <div className="video-player-header">
                            <div>
                                <p className="player-kicker">{videoUrl === trailer ? "Trailer" : "Series Episode"}</p>
                                <h2>{videoUrl === trailer ? show.name : `${show.name} • S${selectedSeason}E${selectedEpisode}`}</h2>
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
                            <MovieCard key={m.id} movie={m} type="tv" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
