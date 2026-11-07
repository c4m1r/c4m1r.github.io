import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECT_PLAYLIST } from '../mediaplayer/playlist';
import loopsIconUrl from './assets/favicon.ico';
import chpokSoundUrl from './assets/chpok.mp3';
import './loops.css';

// Default 0chan logo pattern (12 columns x 18 rows)
const PATTERN_0CHAN = {
  name: '0chan',
  x: 12,
  y: 18,
  pattern:
    '009999999900' +
    '099999999990' +
    '991111111999' +
    '991111119999' +
    '991111199199' +
    '991111199199' +
    '991111991199' +
    '991111991199' +
    '991119911199' +
    '991119911199' +
    '991199111199' +
    '991199111199' +
    '991991111199' +
    '991991111199' +
    '999911111199' +
    '999111111199' +
    '099999999990' +
    '009999999900',
};

// Im Blue pattern (12 columns x 18 rows)
const PATTERN_IM_BLUE = {
  name: 'Im Blue',
  x: 12,
  y: 18,
  pattern:
    '00cccccccc00' +
    '0cccccccccc0' +
    'cc4444444ccc' +
    'cc444444cccc' +
    'cc44444cc4cc' +
    'cc44444cc4cc' +
    'cc4444cc44cc' +
    'cc4444cc44cc' +
    'cc444cc444cc' +
    'cc444cc444cc' +
    'cc44cc4444cc' +
    'cc44cc4444cc' +
    'cc4cc44444cc' +
    'cc4cc44444cc' +
    'cccc444444cc' +
    'ccc4444444cc' +
    '0cccccccccc0' +
    '00cccccccc00',
};

// Cyber Matrix pattern
const PATTERN_CYBER = {
  name: 'Matrix',
  x: 12,
  y: 18,
  pattern:
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909' +
    '909090909090' +
    '090909090909',
};

const COLOR_NAMES = ['void', 'green', 'yellow', 'orange', 'blue', 'crimson', 'violet', 'mono'];

function getCellColorClass(code: string): string {
  const val = parseInt(code, 16);
  if (isNaN(val) || val === 0) return 'loop-cell--void';
  const isLit = val >= 8;
  const colorIndex = isLit ? val - 8 : val;
  const colorName = COLOR_NAMES[colorIndex] ?? 'mono';
  return `loop-cell--${isLit ? 'lit' : 'dim'}-${colorName}`;
}

export function LoopsApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePattern, setActivePattern] = useState(PATTERN_0CHAN);
  const [cells, setCells] = useState<string[]>(() => PATTERN_0CHAN.pattern.split(''));
  const [flashingIndices, setFlashingIndices] = useState<Set<number>>(() => new Set());

  const currentTrack = PROJECT_PLAYLIST[trackIndex] ?? PROJECT_PLAYLIST[0];

  const initWebAudio = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('Web Audio init skipped:', e);
    }
  }, []);

  const playChpok = useCallback(() => {
    try {
      const snd = new Audio(chpokSoundUrl);
      snd.volume = 0.35;
      void snd.play().catch(() => undefined);
    } catch {
      // Audio playback might be prevented by browser policy
    }
  }, []);

  const togglePlay = useCallback(async () => {
    initWebAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  }, [initWebAudio, isPlaying]);

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % PROJECT_PLAYLIST.length);
  }, []);

  const prevTrack = useCallback(() => {
    setTrackIndex((prev) => (prev - 1 + PROJECT_PLAYLIST.length) % PROJECT_PLAYLIST.length);
  }, []);

  const randomTrack = useCallback(() => {
    setTrackIndex(Math.floor(Math.random() * PROJECT_PLAYLIST.length));
  }, []);

  // When pattern changes
  const applyPattern = (p: typeof PATTERN_0CHAN) => {
    setActivePattern(p);
    setCells(p.pattern.split(''));
  };

  // Click on cell flashes it and plays chpok
  const handleCellClick = (index: number) => {
    playChpok();
    setFlashingIndices((prev) => new Set([...prev, index]));
    setTimeout(() => {
      setFlashingIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 280);
  };

  // Real-time Visualizer & Waveform loop
  useEffect(() => {
    let animId: number;
    const timeDomain = new Uint8Array(128);
    const freqDomain = new Uint8Array(128);

    const render = () => {
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (isPlaying && analyser) {
        analyser.getByteTimeDomainData(timeDomain);
        analyser.getByteFrequencyData(freqDomain);

        // Flash cells based on peak audio beats
        let maxEnergy = 0;
        for (let i = 0; i < freqDomain.length; i++) {
          if (freqDomain[i] > maxEnergy) maxEnergy = freqDomain[i];
        }

        if (maxEnergy > 160) {
          const count = Math.min(6, Math.floor((maxEnergy - 160) / 16));
          const flashed = new Set<number>();
          for (let c = 0; c < count; c++) {
            const randIdx = Math.floor(Math.random() * cells.length);
            if (cells[randIdx] !== '0') {
              flashed.add(randIdx);
            }
          }
          if (flashed.size > 0) {
            setFlashingIndices(flashed);
            setTimeout(() => setFlashingIndices(new Set()), 120);
          }
        }
      }

      // Draw Waveform on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#59c44d';

        if (isPlaying && analyser) {
          const sliceWidth = canvas.width / timeDomain.length;
          let x = 0;
          ctx.beginPath();
          ctx.strokeStyle = '#59c44d';
          ctx.lineWidth = 2;
          for (let i = 0; i < timeDomain.length; i++) {
            const v = timeDomain[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        } else {
          // Idle flat line
          ctx.strokeStyle = '#223820';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cells.length, isPlaying]);

  // Audio track switch effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const continuePlaying = isPlaying;
    audio.load();
    if (continuePlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  return (
    <div className="loop-app-container">
      {/* Header */}
      <div className="loop-header">
        <div className="loop-logo-badge">
          <img src={loopsIconUrl} alt="Loops" />
          <span>LOOPS</span>
        </div>

        <div className="loop-track-card">
          <span className="loop-track-title">
            {trackIndex + 1}. {currentTrack.artist} - {currentTrack.title}
          </span>
          <span className="loop-track-status">
            {isPlaying ? '● PLAYING' : '■ PAUSED'}
          </span>
        </div>
      </div>

      {/* Nullgrid of dancing squares */}
      <div className="loop-grid-wrapper">
        <div
          className="loop-nullgrid"
          style={{
            gridTemplateColumns: `repeat(${activePattern.x}, 18px)`,
            gridTemplateRows: `repeat(${activePattern.y}, 18px)`,
          }}
        >
          {cells.map((code, idx) => {
            const colorClass = getCellColorClass(code);
            const isFlashing = flashingIndices.has(idx);
            return (
              <div
                key={idx}
                className={`loop-cell ${colorClass} ${isFlashing ? 'is-flashing' : ''}`}
                onClick={() => handleCellClick(idx)}
                title={`Cell #${idx}`}
              />
            );
          })}
        </div>

        {/* Real-time Oscilloscope Waveform Canvas */}
        <canvas ref={canvasRef} className="loop-waveform-canvas" width={520} height={48} />
      </div>

      {/* Toolbar & Controls */}
      <div className="loop-toolbar">
        <div className="loop-buttons-row">
          <button type="button" className="loop-btn" onClick={prevTrack} title="Previous Loop">
            |◀
          </button>
          <button
            type="button"
            className="loop-btn loop-btn--primary"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
          </button>
          <button type="button" className="loop-btn" onClick={nextTrack} title="Next Loop">
            ▶|
          </button>
          <button type="button" className="loop-btn" onClick={randomTrack} title="Random Loop">
            🎲 RANDOM
          </button>
        </div>

        <div className="loop-presets-row">
          <span style={{ color: '#888', marginRight: '4px' }}>Pattern:</span>
          <button
            type="button"
            className={`loop-preset-btn ${activePattern.name === '0chan' ? 'is-active' : ''}`}
            onClick={() => applyPattern(PATTERN_0CHAN)}
          >
            0chan Zero
          </button>
          <button
            type="button"
            className={`loop-preset-btn ${activePattern.name === 'Im Blue' ? 'is-active' : ''}`}
            onClick={() => applyPattern(PATTERN_IM_BLUE)}
          >
            Im Blue
          </button>
          <button
            type="button"
            className={`loop-preset-btn ${activePattern.name === 'Matrix' ? 'is-active' : ''}`}
            onClick={() => applyPattern(PATTERN_CYBER)}
          >
            Matrix
          </button>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        loop
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />
    </div>
  );
}
