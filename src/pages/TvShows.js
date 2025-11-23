import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryRow from "../components/CategoryRow";
import { fetchMovies, getImage } from "../api";
import "./Home.css"; // Reuse Home CSS for now

export default function TvShows() {
    const [heroShow, setHeroShow] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies("/trending/tv/week").then(data => {
            const random = data.results[Math.floor(Math.random() * data.results.length)];
            setHeroShow(random);
        });
    }, []);

    return (
        <div className="home-page">
            {heroShow && (
                <div
                    className="home-hero"
                    style={{ backgroundImage: `url(${getImage(heroShow.backdrop_path, 'original')})` }}
                >
                    <div className="home-hero-overlay"></div>
                    <div className="home-hero-content">
                        <h1 className="home-hero-title">{heroShow.name}</h1>
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
                    </div>
                </div>
            )}

            <CategoryRow title="Trending TV Shows" endpoint="/trending/tv/week" />
            <CategoryRow title="Popular TV Shows" endpoint="/tv/popular" />
            <CategoryRow title="Top Rated TV Shows" endpoint="/tv/top_rated" />
            <CategoryRow title="On The Air" endpoint="/tv/on_the_air" />
        </div>
    );
}
