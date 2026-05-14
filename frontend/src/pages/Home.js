import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryRow from "../components/CategoryRow";
import { fetchMovies, getImage } from "../api";
import "./Home.css";

const movieRows = [
    {
        title: "Trending Now",
        kicker: "Momentum",
        description: "The titles everyone is discovering right now, with the strongest energy in the feed.",
        endpoint: "/trending/movie/week",
    },
    {
        title: "Popular on Sinama",
        kicker: "Easy Picks",
        description: "Crowd-pleasing films that work when you want to land on something fast and satisfying.",
        endpoint: "/movie/popular",
    },
    {
        title: "Top Rated",
        kicker: "Critics' Favorites",
        description: "Acclaimed films with lasting pull, built for nights when you want something sharper.",
        endpoint: "/movie/top_rated",
    },
    {
        title: "Upcoming Releases",
        kicker: "Coming Soon",
        description: "Fresh arrivals and near-release titles to keep your queue ahead of the curve.",
        endpoint: "/movie/upcoming",
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

export default function Home() {
    const [heroMovie, setHeroMovie] = useState(null);
    const [heroTrailerKey, setHeroTrailerKey] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies("/trending/movie/week").then(data => {
            if (!data.results?.length) return;
            const random = data.results[Math.floor(Math.random() * data.results.length)];
            setHeroMovie(random);
        });
    }, []);

    useEffect(() => {
        if (!heroMovie?.id) {
            setHeroTrailerKey("");
            return;
        }

        fetchMovies(`/movie/${heroMovie.id}/videos`).then((data) => {
            setHeroTrailerKey(getTrailerKey(data));
        });
    }, [heroMovie?.id]);

    return (
        <div className="home-page">
            {heroMovie && (
                <div
                    className="home-hero"
                    style={{ backgroundImage: heroTrailerKey ? "none" : `url(${getImage(heroMovie.backdrop_path, 'original')})` }}
                >
                    {heroTrailerKey && (
                        <div className="home-hero-media" aria-hidden="true">
                            <iframe
                                src={getYouTubeBackgroundUrl(heroTrailerKey)}
                                title={`${heroMovie.title} background trailer`}
                                frameBorder="0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        </div>
                    )}
                    <div className="home-hero-overlay"></div>
                    <div className="home-hero-content">
                        <p className="hero-kicker">Now Curating</p>
                        <h1 className="home-hero-title">{heroMovie.title}</h1>
                        <div className="home-hero-meta">
                            <span>⭐ {heroMovie.vote_average ? heroMovie.vote_average.toFixed(1) : "N/A"}</span>
                            <span>{heroMovie.release_date ? heroMovie.release_date.split("-")[0] : "N/A"}</span>
                            <span>{heroMovie.original_language ? heroMovie.original_language.toUpperCase() : "N/A"}</span>
                        </div>
                        <p className="home-hero-overview">{heroMovie.overview}</p>
                        <div className="home-hero-btns">
                            <button
                                className="hero-btn primary"
                                onClick={() => navigate(`/movie/${heroMovie.id}`)}
                            >
                                ▶ Play
                            </button>
                            <button
                                className="hero-btn secondary"
                                onClick={() => navigate(`/movie/${heroMovie.id}`)}
                            >
                                ℹ More Info
                            </button>
                        </div>
                        <div className="home-hero-atmosphere">
                            <div className="atmosphere-pill">
                                <span>Featured Motion</span>
                                <strong>{heroTrailerKey ? "Trailer motion is playing quietly in the background." : "A strong visual pick, curated to set the tone instantly."}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-section-intro">
                <p className="section-kicker">Browse</p>
                <h2>Set the mood before you hit play</h2>
                <p>From trending premieres to comfort rewatches, every row is framed like a visual stream of moods, not a plain catalog.</p>
            </div>

            {movieRows.map((row) => (
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
