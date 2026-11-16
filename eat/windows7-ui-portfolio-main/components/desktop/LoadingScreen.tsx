"use client";

import { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"gate" | "booting">("gate");
  const [gateVisible, setGateVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Pre-load the audio the moment the component mounts (no play yet)
  useEffect(() => {
    audioRef.current = new Audio("/sounds/win7_startup.mp3");
    audioRef.current.volume = 0.65;
    audioRef.current.load();

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const startBoot = () => {
    // Sound plays inside a direct user-gesture callback → guaranteed to work
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Fade gate screen out, then switch to boot phase
    setGateVisible(false);
    const t1 = setTimeout(() => setPhase("booting"), 500);

    // Hand off to desktop at 7.5 s (sound is ~5 s, so logo can finish pulsing)
    const t2 = setTimeout(() => onComplete(), 7500);

    timersRef.current = [t1, t2];
  };

  /* ── Gate screen ────────────────────────────────────────── */
  if (phase === "gate") {
    return (
      <div
        onClick={startBoot}
        style={{
          position: "fixed", inset: 0,
          background: "radial-gradient(circle at center, #111 0%, #000 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 10000,
          cursor: "pointer",
          userSelect: "none",
          opacity: gateVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <div style={{ 
          display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", 
          animation: "win7-fade-in 1.4s ease forwards",
          marginBottom: "60px" 
        }}>
          {/* Elegant Typography Intro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              margin: 0,
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, sans-serif',
              fontSize: '32px',
              fontWeight: 300,
              letterSpacing: '0.05em',
              textShadow: '0 0 20px rgba(255,255,255,0.4)',
            }}>
              Gividu Elladeniya
            </h1>
            <h2 style={{
              margin: 0,
              color: '#a0c5e8',
              fontFamily: '"Segoe UI", Tahoma, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              opacity: 0.8
            }}>
              Interactive Portfolio
            </h2>
          </div>

          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '10px 0' }} />

          <p style={{
            color: "#fff",
            fontFamily: "'Segoe UI', Tahoma, sans-serif",
            fontSize: "14px",
            letterSpacing: "0.1em",
            textShadow: "0 0 10px rgba(255,255,255,0.5)",
            margin: 0,
            opacity: 0.7,
            animation: "win7-pulse 2.5s infinite alternate ease-in-out",
            animationDelay: "0.5s"
          }}>
            Click anywhere to start
          </p>
        </div>

        {/* Footer / Copyright Notice */}
        <div style={{
          position: "absolute", bottom: "30px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
          fontSize: "11px",
          textAlign: "center",
          maxWidth: "600px",
          animation: "win7-fade-in 2s ease forwards",
          animationDelay: "1s",
          opacity: 0 // handled by animation
        }}>
          <p style={{ margin: 0 }}>
            Designed & Built by Gividu Elladeniya as an interactive portfolio.
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
            This is a fan-made, open-source project and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation.<br/>
            Windows and the Windows logo are registered trademarks of Microsoft Corporation.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes win7-pulse {
            0% { transform: scale(0.98); opacity: 0.85; filter: brightness(0.9); }
            100% { transform: scale(1.02); opacity: 1; filter: brightness(1.2); }
          }
        `}} />
      </div>
    );
  }

  /* ── Boot animation screen ──────────────────────────────── */
  return (
    <div className="boot-screen">
      <div className="orb-stage">
        <div className="boot-ball boot-red"></div>
        <div className="boot-ball boot-blue"></div>
        <div className="boot-ball boot-green"></div>
        <div className="boot-ball boot-yellow"></div>
      </div>
      <h2 className="boot-text">Starting Windows</h2>
    </div>
  );
}
