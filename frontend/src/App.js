import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const Home = lazy(() => import("./pages/Home"));
const TvShows = lazy(() => import("./pages/TvShows"));
const Search = lazy(() => import("./pages/Search"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TvShowDetails = lazy(() => import("./pages/TvShowDetails"));

function App() {
    return (
        <div className="App">
            <ErrorBoundary>
                <Router>
                    <Navbar />
                    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/tv" element={<TvShows />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/movie/:id" element={<MovieDetails />} />
                            <Route path="/tv/:id" element={<TvShowDetails />} />
                        </Routes>
                    </Suspense>
                </Router>
            </ErrorBoundary>
            <Analytics />
            <SpeedInsights />
        </div>
    );
}

export default App;
