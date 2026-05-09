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
                        <button className="control-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>

                        <div className="volume-container">
                            <button className="control-btn" onClick={toggleMute} aria-label="Toggle Mute">
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                )}
                            </button>
                            <div className="volume-slider-wrapper">
                                <input
                                    type="range"
                                    className="volume-slider"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolume}
                                    style={{ background: `linear-gradient(to right, #e50914 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                                />
                            </div>
                        </div>

                        <div className="time-display">
                            {formatTime(currentTime)} <span className="time-divider">/</span> {formatTime(duration)}
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
                        <button className="control-btn fullscreen-btn" onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
                            {isFullscreen ? (
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
