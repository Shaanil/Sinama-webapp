import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryRow from "../components/CategoryRow";
import { fetchMovies, getImage } from "../api";
import "./Home.css"; // Reuse Home CSS for now

const tvRows = [
    {
        title: "Trending TV Shows",
        kicker: "Now Rising",
        description: "The shows pulling attention this week, ideal when you want to catch the current wave.",
        endpoint: "/trending/tv/week",
    },
    {
        title: "Popular TV Shows",
        kicker: "Lean Back",
        description: "Reliable crowd favorites built for easy starts and long viewing sessions.",
        endpoint: "/tv/popular",
    },
    {
        title: "Top Rated TV Shows",
        kicker: "Prestige",
        description: "High-caliber series with stronger arcs, deeper worlds, and better payoff.",
        endpoint: "/tv/top_rated",
    },
    {
        title: "On The Air",
        kicker: "Fresh Episodes",
        description: "Current runs and weekly releases when you want something alive and ongoing.",
        endpoint: "/tv/on_the_air",
    },
];

function getTrailerKey(data) {
    return data?.results?.find((video) => (
        video.site === "YouTube" && ["Trailer", "Teaser"].includes(video.type)
    ))?.key || "";
}

function getYouTubeBackgroundUrl(key) {
    return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&modestbranding=1&rel=0&playsinline=1`;
}

export default function TvShows() {
    const [heroShow, setHeroShow] = useState(null);
    const [heroTrailerKey, setHeroTrailerKey] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies("/trending/tv/week").then(data => {
            if (!data.results?.length) return;
            const random = data.results[Math.floor(Math.random() * data.results.length)];
            setHeroShow(random);
        });
    }, []);

    useEffect(() => {
        if (!heroShow?.id) {
            setHeroTrailerKey("");
            return;
        }

        fetchMovies(`/tv/${heroShow.id}/videos`).then((data) => {
            setHeroTrailerKey(getTrailerKey(data));
        });
    }, [heroShow?.id]);

    return (
        <div className="home-page">
            {heroShow && (
                <div
                    className="home-hero"
                    style={{ backgroundImage: heroTrailerKey ? "none" : `url(${getImage(heroShow.backdrop_path, 'original')})` }}
                >
                    {heroTrailerKey && (
                        <div className="home-hero-media" aria-hidden="true">
                            <iframe
                                src={getYouTubeBackgroundUrl(heroTrailerKey)}
                                title={`${heroShow.name} background trailer`}
                                frameBorder="0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        </div>
                    )}
                    <div className="home-hero-overlay"></div>
                    <div className="home-hero-content">
                        <p className="hero-kicker">Series Spotlight</p>
                        <h1 className="home-hero-title">{heroShow.name}</h1>
                        <div className="home-hero-meta">
                            <span>⭐ {heroShow.vote_average ? heroShow.vote_average.toFixed(1) : "N/A"}</span>
                            <span>{heroShow.first_air_date ? heroShow.first_air_date.split("-")[0] : "N/A"}</span>
                            <span>{heroShow.original_language ? heroShow.original_language.toUpperCase() : "N/A"}</span>
                        </div>
                        <p className="home-hero-overview">{heroShow.overview}</p>
                        <div className="home-hero-btns">
                            <button
                                className="hero-btn primary"
                                onClick={() => navigate(`/tv/${heroShow.id}`)}
                            >
                                ▶ Play
                            </button>
                            <button
                                className="hero-btn secondary"
                                onClick={() => navigate(`/tv/${heroShow.id}`)}
                            >
                                ℹ More Info
                            </button>
                        </div>
                        <div className="home-hero-atmosphere">
                            <div className="atmosphere-pill">
                                <span>Series Motion</span>
                                <strong>{heroTrailerKey ? "Muted motion is running behind the artwork for a livelier entry." : "Episode arcs, long-form hooks, and lean-back discovery."}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-section-intro">
                <p className="section-kicker">Watchlist Energy</p>
                <h2>Choose a show and settle into the run</h2>
                <p>Discover buzzy weekly releases, prestige series, and easy marathon picks in a flow that feels alive instead of static.</p>
            </div>

            {tvRows.map((row) => (
                <CategoryRow
                    key={row.title}
                    title={row.title}
                    kicker={row.kicker}
                    description={row.description}
                    endpoint={row.endpoint}
                />
            ))}
        </div>
    );
}
