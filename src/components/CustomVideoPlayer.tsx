"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  ShieldAlert,
} from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  title: string;
  watermarkText?: string;
}

export default function CustomVideoPlayer({
  src,
  title,
  watermarkText,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "20%" });

  // Floating watermark position shifter to prevent screen recording piracy
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70 + 15) + "%";
      const randomLeft = Math.floor(Math.random() * 70 + 15) + "%";
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Control visibility timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, duration)
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#000000",
        boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124,158,255,0.1)",
        userSelect: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        style={{
          width: "100%",
          display: "block",
          aspectRatio: "16/9",
          backgroundColor: "#050711",
          cursor: "pointer",
        }}
      />

      {/* Floating security watermark */}
      {watermarkText && (
        <div
          style={{
            position: "absolute",
            top: watermarkPos.top,
            left: watermarkPos.left,
            color: "rgba(255,255,255,0.22)",
            fontSize: "13px",
            fontWeight: 700,
            pointerEvents: "none",
            letterSpacing: "2px",
            transition: "all 3s ease",
            textShadow: "0 0 6px rgba(0,0,0,0.9)",
            zIndex: 10,
          }}
        >
          {watermarkText}
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(124,158,255,0.9)",
            border: "none",
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(124,158,255,0.6)",
            transition: "transform 0.2s, background-color 0.2s",
            zIndex: 15,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)")}
        >
          <Play size={34} fill="#0f172a" style={{ marginLeft: "4px" }} />
        </button>
      )}

      {/* Video Overlay Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 20,
        }}
      >
        <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.95rem" }}>
          {title}
        </div>
        <div
          style={{
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "100px",
            background: "rgba(34,197,94,0.2)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86efac",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
          Хамгаалагдсан контент
        </div>
      </div>

      {/* Control Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 14px",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 20,
        }}
      >
        {/* Progress Bar Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: "100%",
              height: "5px",
              borderRadius: "3px",
              accentColor: "#7c9eff",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Action Controls Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => handleSkip(-10)}
              title="10 секунд ухрах"
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RotateCcw size={17} />
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => handleSkip(10)}
              title="10 секунд урагшлах"
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FastForward size={17} />
            </button>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={toggleMute}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: "60px",
                  height: "4px",
                  accentColor: "#7c9eff",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Time Stamp */}
            <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "monospace" }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Speed selector */}
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: playbackRate === rate ? "rgba(124,158,255,0.3)" : "rgba(255,255,255,0.08)",
                    border: playbackRate === rate ? "1px solid #7c9eff" : "1px solid transparent",
                    color: playbackRate === rate ? "#7c9eff" : "#94a3b8",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
