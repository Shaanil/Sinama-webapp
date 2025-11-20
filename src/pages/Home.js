import React from "react";
import CategoryRow from "../components/CategoryRow";

export default function Home({ onSelectMovie }) {
    return (
        <>
            <CategoryRow title="Trending" endpoint="/trending/movie/week" onSelectMovie={onSelectMovie} />
            <CategoryRow title="Popular" endpoint="/movie/popular" onSelectMovie={onSelectMovie} />
            <CategoryRow title="Top Rated" endpoint="/movie/top_rated" onSelectMovie={onSelectMovie} />
            <CategoryRow title="Upcoming" endpoint="/movie/upcoming" onSelectMovie={onSelectMovie} />
        </>
    );
}
