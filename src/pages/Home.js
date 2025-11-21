import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryRow from "../components/CategoryRow";
import { fetchMovies, getImage } from "../api";
import "./Home.css";

export default function Home() {
    const [heroMovie, setHeroMovie] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies("/trending/movie/week").then(data => {
            const random = data.results[Math.floor(Math.random() * data.results.length)];
            setHeroMovie(random);
        });
    }, []);

    return (
        <div className="home-page">
            {heroMovie && (
                <div
                    className="home-hero"
                    style={{ backgroundImage: `url(${getImage(heroMovie.backdrop_path, 'original')})` }}
                >
                    <div className="home-hero-overlay"></div>
                    <div className="home-hero-content">
                        <h1 className="home-hero-title">{heroMovie.title}</h1>
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
                    </div>
                </div>
            )}

            <CategoryRow title="Trending Now" endpoint="/trending/movie/week" />
            <CategoryRow title="Popular on Sinama" endpoint="/movie/popular" />
            <CategoryRow title="Top Rated" endpoint="/movie/top_rated" />
            <CategoryRow title="Upcoming Releases" endpoint="/movie/upcoming" />
        </div>
    );
}
