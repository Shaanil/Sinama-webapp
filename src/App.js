import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TvShows from "./pages/TvShows";
import TvShowDetails from "./pages/TvShowDetails";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
    return (
        <div className="App">
            <ErrorBoundary>
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tv" element={<TvShows />} />
                        <Route path="/tv/:id" element={<TvShowDetails />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/movie/:id" element={<MovieDetails />} />
                    </Routes>
                </Router>
            </ErrorBoundary>
            <Analytics />
            <SpeedInsights />
        </div>
    );
}

export default App;
