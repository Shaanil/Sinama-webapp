import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovies, getImage } from "../api";
import MovieCard from "../components/MovieCard";

export default function MoviePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [trailer, setTrailer] = useState(null);

    useEffect(() => {
        fetchMovies(`/movie/${id}`).then(setMovie);
        fetchMovies(`/movie/${id}/credits`).then(data => setCast(data.cast.slice(0,8)));
        fetchMovies(`/movie/${id}/recommendations`).then(data => setRecommended(data.results.slice(0,10)));
        fetchMovies(`/movie/${id}/videos`).then(data => {
            const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if (yt) setTrailer(`https://www.youtube.com/embed/${yt.key}`);
        });
    }, [id]);

    if (!movie) return <p>Loading...</p>;

    return (
        <div style={{ color: "#fff", background: "#121212", padding: "2rem" }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom:"1rem", padding:"0.5rem 1rem", background:"#e50914", border:"none", borderRadius:"5px", color:"#fff" }}>← Back</button>

            {/* Movie Header */}
            <div style={{backgroundImage:`url(${getImage(movie.backdrop_path,'original')})`, backgroundSize:'cover', backgroundPosition:'center', padding:'2rem', borderRadius:'10px'}}>
                <div style={{background:'rgba(0,0,0,0.6)', padding:'1rem', borderRadius:'10px'}}>
                    <h1>{movie.title}</h1>
                    <p>{movie.overview}</p>
                    <p>⭐ {movie.vote_average} | {movie.release_date} | {movie.runtime} mins</p>
                    {trailer && <iframe width="100%" height="400" src={trailer} title="Trailer" frameBorder="0" allowFullScreen style={{borderRadius:'10px'}}></iframe>}
                </div>
            </div>

            {/* Cast */}
            <h2 style={{marginTop:"2rem"}}>Cast</h2>
            <div style={{display:'flex', overflowX:'auto', gap:'1rem', paddingBottom:'1rem'}}>
                {cast.map(actor => (
                    <div key={actor.id} style={{minWidth:'100px', textAlign:'center'}}>
                        <img src={getImage(actor.profile_path)} alt={actor.name} style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover'}} />
                        <p>{actor.name}</p>
                    </div>
                ))}
            </div>

            {/* Recommended */}
            <h2>Recommended</h2>
            <div style={{display:'flex', overflowX:'auto', gap:'1rem', paddingBottom:'1rem'}}>
                {recommended.map(m => <MovieCard key={m.id} movie={m} onClick={() => navigate(`/movie/${m.id}`)} />)}
            </div>
        </div>
    );
}
