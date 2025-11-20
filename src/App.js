import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
    const [page, setPage] = useState("home");
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const openDetails = (id) => {
        setSelectedMovie(id);
        setPage("details");
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage("search");
    };

    const goBack = () => {
        setSelectedMovie(null);
        setPage("home");
    };

    return (
        <div className="App">
            <Navbar setPage={setPage} onSearch={handleSearch} />
            {page === "home" && <Home onSelectMovie={openDetails} />}
            {page === "search" && <Search onSelectMovie={openDetails} query={searchQuery} />}
            {page === "details" && <MovieDetails movieId={selectedMovie} onBack={goBack} />}
        <Analytics />
            <SpeedInsights/>
        </div>

    );
}

export default App;
