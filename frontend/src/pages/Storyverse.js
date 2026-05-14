import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import "./Storyverse.css"

export default function Storyverse() {
    const navigate = useNavigate()
    
    return (
        <div className="storyverse-page storyverse-construction-page">
            <Navbar />
            <main className="storyverse-construction">
                <button 
                    className="storyverse-back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h1>This is under construction</h1>
                <p>We're building something magical for you. Check back soon!</p>
            </main>
        </div>
    )
}
