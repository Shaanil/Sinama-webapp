import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./MovieDetails.css";

function formatDate(value) {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(value));
}

function getAge(birthday, deathday) {
    if (!birthday) return null;

    const start = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - start.getFullYear();
    const monthDelta = end.getMonth() - start.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < start.getDate())) {
        age -= 1;
    }

    return age;
}

function uniqueCredits(items) {
    const seen = new Set();

    return items.filter((item) => {
        if (!item.id || !item.media_type || seen.has(`${item.media_type}-${item.id}`)) {
            return false;
        }

        seen.add(`${item.media_type}-${item.id}`);
        return item.media_type === "movie" || item.media_type === "tv";
    });
}

export default function PersonDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [credits, setCredits] = useState({ cast: [], crew: [] });

    useEffect(() => {
        setPerson(null);
        setCredits({ cast: [], crew: [] });

        fetchMovies(`/person/${id}`).then((data) => {
            setPerson(data?.id && data?.name ? data : false);
        });
        fetchMovies(`/person/${id}/combined_credits`).then((data) => {
            setCredits({
                cast: data.cast || [],
                crew: data.crew || [],
            });
        });
    }, [id]);

    const knownFor = useMemo(() => {
        return uniqueCredits([...credits.cast, ...credits.crew])
            .filter((item) => item.poster_path)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 12);
    }, [credits]);

    const actingCredits = useMemo(() => {
        return uniqueCredits(credits.cast)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 18);
    }, [credits]);

    const crewCredits = useMemo(() => {
        return uniqueCredits(credits.crew)
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 18);
    }, [credits]);

    if (person === null) return <LoadingSpinner text="Loading person details..." />;

    if (person === false) {
        return (
            <div className="movie-detail person-detail">
                <div className="person-hero">
                    <button onClick={() => navigate(-1)} className="person-back-btn">Back</button>
                    <div className="person-empty-state">
                        <h1>No information</h1>
                        <p>No information</p>
                    </div>
                </div>
            </div>
        );
    }

    const age = getAge(person.birthday, person.deathday);
    const facts = [
        { label: "Known For", value: person.known_for_department || "N/A" },
        { label: "Born", value: formatDate(person.birthday) },
        { label: "Age", value: age ? `${age}${person.deathday ? " at death" : ""}` : "N/A" },
        { label: "Place of Birth", value: person.place_of_birth || "N/A" },
    ];

    return (
        <div className="movie-detail person-detail">
            <div className="person-hero">
                <button onClick={() => navigate(-1)} className="person-back-btn">Back</button>
                <div className="person-hero-inner">
                    <div className="person-profile-card">
                        <img src={getImage(person.profile_path, "w780")} alt={person.name} />
                    </div>

                    <div className="person-copy">
                        <p className="section-kicker person-kicker">TMDB Person</p>
                        <h1 className="movie-title">{person.name}</h1>

                        <div className="fact-grid person-facts">
                            {facts.map((fact) => (
                                <div key={fact.label} className="fact-card">
                                    <span className="fact-label">{fact.label}</span>
                                    <strong className="fact-value">{fact.value}</strong>
                                </div>
                            ))}
                        </div>

                        <p className="overview person-biography">
                            {person.biography || "No information"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-section">
                {knownFor.length > 0 && (
                    <div className="recommendations-row">
                        <h2>Known For</h2>
                        <div className="row-scroll">
                            {knownFor.map((item) => (
                                <MovieCard key={`${item.media_type}-${item.id}`} movie={item} type={item.media_type} />
                            ))}
                        </div>
                    </div>
                )}

                {actingCredits.length > 0 && (
                    <div className="recommendations-row">
                        <h2>Acting Credits</h2>
                        <div className="row-scroll">
                            {actingCredits.map((item) => (
                                <MovieCard key={`${item.media_type}-${item.id}`} movie={item} type={item.media_type} />
                            ))}
                        </div>
                    </div>
                )}

                {crewCredits.length > 0 && (
                    <div className="recommendations-row">
                        <h2>Crew Credits</h2>
                        <div className="row-scroll">
                            {crewCredits.map((item) => (
                                <MovieCard key={`${item.media_type}-${item.id}`} movie={item} type={item.media_type} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
