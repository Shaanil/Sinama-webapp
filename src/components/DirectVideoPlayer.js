import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import "./DirectVideoPlayer.css";

const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function DirectVideoPlayer({ stream, poster, title }) {
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const hlsRef = useRef(null);
    
    // Player State
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const controlsTimeoutRef = useRef(null);

    // Stream Setup State
    const [selectedQuality, setSelectedQuality] = useState(stream?.type === "file" ? stream.quality : "auto");
    const [hlsLevels, setHlsLevels] = useState([]);

    const activeUrl = useMemo(() => {
        if (!stream) return "";
        if (stream.type === "file") {
            return stream.qualities?.[selectedQuality]?.url || stream.url;
        }
        return stream.url;
    }, [selectedQuality, stream]);

    useEffect(() => {
        setSelectedQuality(stream?.type === "file" ? stream.quality : "auto");
        setHlsLevels([]);
    }, [stream]);

    // HLS Binding
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stream) return undefined;

        let hls;
        if (stream.type === "hls" && Hls.isSupported()) {
            hls = new Hls();
            hlsRef.current = hls;
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const nextLevels = (data.levels || []).map((level, index) => ({
                    index,
                    label: level.height ? `${level.height}p` : `Level ${index + 1}`,
                }));
                setHlsLevels(nextLevels);
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) setError(true);
            });
            hls.loadSource(activeUrl);
            hls.attachMedia(video);
        } else {
            hlsRef.current = null;
            video.src = activeUrl;
            video.onerror = () => setError(true);
        }

        return () => {
            if (hls) hls.destroy();
            hlsRef.current = null;
            if (video) {
                video.pause();
                video.removeAttribute("src");
                video.load();
            }
        };
    }, [activeUrl, stream]);

    // Media Controls Logic
    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const value = Number(e.target.value);
        videoRef.current.currentTime = value;
        setCurrentTime(value);
    };

    const toggleMute = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolume = (e) => {
        const value = Number(e.target.value);
        videoRef.current.volume = value;
        setVolume(value);
        if (value === 0) setIsMuted(true);
        else setIsMuted(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Auto-hide controls
    const triggerControls = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    useEffect(() => {
        document.addEventListener("mousemove", triggerControls);
        return () => document.removeEventListener("mousemove", triggerControls);
    }, [triggerControls]);

    const fileQualityOptions = stream?.type === "file" ? Object.keys(stream.qualities || {}) : [];

    const handleHlsQualityChange = (val) => {
        setSelectedQuality(val);
        if (hlsRef.current) {
            hlsRef.current.currentLevel = val === "auto" ? -1 : Number(val);
        }
    };

    return (
        <div 
            ref={wrapperRef} 
            className={`custom-video-wrapper ${showControls || !isPlaying ? "show-controls" : ""}`}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onCanPlayThrough={() => setIsLoading(false)}
                poster={poster}
                autoPlay
                playsInline
                style={{ cursor: "pointer" }}
            >
                {stream?.captions?.map((caption) => (
                    <track
                        key={`${caption.id || caption.url}-${caption.language}`}
                        kind="subtitles"
                        src={caption.url}
                        srcLang={caption.language || "en"}
                        label={caption.label || caption.language || "Subtitle"}
                    />
                ))}
            </video>

            {isLoading && !error && (
                <div className="video-loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            
            {error && (
                <div className="video-error-overlay">
                    Video format currently unsupported or stream failed.
                </div>
            )}

            <div className="video-controls">
                <div className="video-progress-container">
                    <input
                        type="range"
                        className="video-progress"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{ background: `linear-gradient(to right, #e50914 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)` }}
                    />
                </div>

                <div className="video-controls-bottom">
                    <div className="controls-left">
                        <button className="control-btn" onClick={togglePlay}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>

                        <div className="volume-container">
                            <button className="control-btn" onClick={toggleMute}>
                                {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔈" : "🔊"}
                            </button>
                            <input
                                type="range"
                                className="volume-slider"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolume}
                            />
                        </div>

                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="controls-right">
                        {/* Stream Qualities natively integrated into the control bar */}
                        {stream?.type === "file" && fileQualityOptions.length > 1 && (
                            <div className="quality-chip-group">
                                {fileQualityOptions.map((quality) => (
                                    <button
                                        key={quality}
                                        type="button"
                                        className={`quality-chip ${selectedQuality === quality ? "active" : ""}`}
                                        onClick={() => setSelectedQuality(quality)}
                                    >
                                        {quality === "4k" ? "4K" : `${quality}p`.replace("unknownp", "Auto")}
                                    </button>
                                ))}
                            </div>
                        )}

                        {stream?.type === "hls" && hlsLevels.length > 0 && (
                            <div className="quality-chip-group">
                                <button
                                    type="button"
                                    className={`quality-chip ${selectedQuality === "auto" ? "active" : ""}`}
                                    onClick={() => handleHlsQualityChange("auto")}
                                >
                                    Auto
                                </button>
                                {hlsLevels.map((level) => (
                                    <button
                                        key={level.index}
                                        type="button"
                                        className={`quality-chip ${selectedQuality === String(level.index) ? "active" : ""}`}
                                        onClick={() => handleHlsQualityChange(String(level.index))}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button className="control-btn" onClick={toggleFullscreen}>
                            {isFullscreen ? "🗗" : "⛶"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
