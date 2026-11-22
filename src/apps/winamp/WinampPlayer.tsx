import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PROJECT_PLAYLIST, MediaTrack } from '../mediaplayer/playlist';
import { winampController } from '../../system/audio/winampController';
import './winamp.css';

// 10 standard Winamp EQ bands in Hz
const EQ_FREQUENCIES = [70, 180, 320, 600, 1000, 3000, 6000, 12000, 14000, 16000];

const EQ_PRESETS = [
  { id: 'flat', label: 'Flat', preamp: 0, bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'rock', label: 'Rock', preamp: 0, bands: [5, 3, -2, -4, -1, 2, 4, 5, 5, 5] },
  { id: 'pop', label: 'Pop', preamp: -1, bands: [-1, 2, 4, 4, 1, -1, -1, 0, 1, 2] },
  { id: 'jazz', label: 'Jazz', preamp: 0, bands: [4, 2, 1, 2, -2, -2, 0, 1, 3, 4] },
  { id: 'classical', label: 'Classical', preamp: 0, bands: [5, 4, 3, 2, -1, -1, 0, 2, 3, 4] },
  { id: 'bass', label: 'Bass Boost', preamp: -2, bands: [8, 7, 5, 2, 0, -2, -3, -3, -2, -1] },
  { id: 'vocal', label: 'Vocal', preamp: 0, bands: [-3, -2, 0, 3, 5, 4, 2, 1, 0, -1] },
];


function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function generateAlbumArt(track: MediaTrack): { bg: string; accent: string; icon: string } {
  let hash = 0;
  const str = track.artist + track.title;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 45) % 360;
  return {
    bg: `linear-gradient(135deg, hsl(${hue}, 65%, 22%) 0%, hsl(${hue2}, 75%, 10%) 100%)`,
    accent: `hsl(${hue}, 90%, 65%)`,
    icon: ['🎵', '⚡', '🎧', '💿', '🎸', '🎹', '✨'][Math.abs(hash) % 7],
  };
}

interface WinampPlayerProps { onClose?: () => void; }

export function WinampPlayer({ onClose }: WinampPlayerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [trackIndex, setTrackIndex] = useState(() => winampController.getState().trackIndex);
  const [isPlaying, setIsPlaying] = useState(() => winampController.getState().isPlaying);
  const [currentTime, setCurrentTime] = useState(() => winampController.getState().currentTime);
  const [duration, setDuration] = useState(() => winampController.getState().duration || 0);
  const [volume, setVolume] = useState(() => winampController.getState().volume);
  const [balance, setBalance] = useState(() => winampController.getEqualizerState().balance);
  const [shuffle, setShuffle] = useState(() => winampController.isShuffle());
  const [autoAdvance, setAutoAdvance] = useState(() => winampController.isAutoAdvance());
  const [repeat, setRepeat] = useState(() => winampController.isRepeat());
  const [timeRemainingMode, setTimeRemainingMode] = useState(false);

  // Sync with global winampController
  useEffect(() => {
    return winampController.subscribe((st) => {
      setTrackIndex(st.trackIndex);
      setIsPlaying(st.isPlaying);
      setCurrentTime(st.currentTime);
      if (st.duration > 0) setDuration(st.duration);
      setVolume(st.volume);
      setShuffle(st.shuffle);
      setAutoAdvance(st.autoAdvance);
    });
  }, [playlistRevision]);

  // Module visibility & shade states
  const [showEq, setShowEq] = useState(true);
  const [showPl, setShowPl] = useState(true);
  const [mainShade, setMainShade] = useState(false);
  const [eqShade, setEqShade] = useState(false);
  const [plShade, setPlShade] = useState(false);

  // Equalizer states
  const [eqOn, setEqOn] = useState(() => winampController.getEqualizerState().enabled);
  const [eqAuto, setEqAuto] = useState(false);
  const [preamp, setPreamp] = useState(() => winampController.getEqualizerState().preamp);
  const [eqBands, setEqBands] = useState<number[]>(() => winampController.getEqualizerState().bands);
  const [selectedEqPreset, setSelectedEqPreset] = useState('custom');

  useEffect(() => {
    const matchingPreset = EQ_PRESETS.find((preset) =>
      preset.preamp === preamp && preset.bands.every((gain, index) => gain === eqBands[index])
    );
    setSelectedEqPreset(matchingPreset?.id ?? 'custom');
  }, [eqBands, preamp]);
  const [playlistSelection, setPlaylistSelection] = useState<number[]>([]);
  const [playlistRevision, setPlaylistRevision] = useState(0);
  const playlistInputRef = useRef<HTMLInputElement | null>(null);

  // Visualizer bar heights and peak dots
  const [bars, setBars] = useState<number[]>(() => Array(19).fill(2));
  const [peaks, setPeaks] = useState<number[]>(() => Array(19).fill(2));
  const rafRef = useRef<number | null>(null);
  type PlayerWindowKey = 'main' | 'equalizer' | 'playlist';
  const [activeWindow, setActiveWindow] = useState<PlayerWindowKey>('main');
  const [windowPositions, setWindowPositions] = useState<Record<PlayerWindowKey, { x: number; y: number }>>({
    main: { x: 24, y: 48 }, equalizer: { x: 24, y: 174 }, playlist: { x: 24, y: 292 },
  });
  const dragRef = useRef<{ key: PlayerWindowKey; pointerX: number; pointerY: number; originX: number; originY: number } | null>(null);
  const startWindowDrag = (event: React.PointerEvent, key: PlayerWindowKey) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    const origin = windowPositions[key];
    setActiveWindow(key);
    dragRef.current = { key, pointerX: event.clientX, pointerY: event.clientY, originX: origin.x, originY: origin.y };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const node = document.querySelector<HTMLElement>(`.wa-${drag.key}`);
      const width = node?.offsetWidth ?? 275;
      const height = node?.offsetHeight ?? 120;
      const x = Math.max(0, Math.min(window.innerWidth - width, drag.originX + event.clientX - drag.pointerX));
      const y = Math.max(0, Math.min(window.innerHeight - height - 30, drag.originY + event.clientY - drag.pointerY));
      setWindowPositions((current) => ({ ...current, [drag.key]: { x, y } }));
    };
    const stop = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const playlist = winampController.getPlaylist();
  const track = playlist[trackIndex] ?? playlist[0] ?? PROJECT_PLAYLIST[0];
  const albumArt = useMemo(() => generateAlbumArt(track), [track]);

  // Total playlist duration calculation
  const totalPlaylistSeconds = useMemo(() => {
    return playlist.reduce((acc, t) => {
      const parts = t.durationLabel.split(':').map(Number);
      if (parts.length !== 2 || !parts.every(Number.isFinite)) return acc;
      return acc + (parts[0] * 60 + parts[1]);
    }, 0);
  }, [playlist]);

  // Web Audio setup
  const initWebAudio = useCallback(() => {
    const wa = winampController.getWebAudio();
    if (wa?.ctx) audioCtxRef.current = wa.ctx;
    if (wa?.analyser) analyserRef.current = wa.analyser;
  }, []);

  // Visualizer loop with real frequency data or dynamic simulation
  useEffect(() => {
    let active = true;
    const freqData = new Uint8Array(32);

    const updateVisualizer = () => {
      if (!active) return;
      const analyser = analyserRef.current;
      if (isPlaying) {
        if (analyser && audioCtxRef.current?.state === 'running') {
          analyser.getByteFrequencyData(freqData);
          setBars(() => {
            const nextBars = Array(19).fill(0).map((_, i) => {
              const val = freqData[i] ?? 0;
              return Math.min(100, Math.max(4, Math.round((val / 255) * 100)));
            });
            setPeaks((prevPeaks) =>
              nextBars.map((nb, i) => Math.max(nb, (prevPeaks[i] ?? 0) - 1.5))
            );
            return nextBars;
          });
        } else {
          // Synthetic dynamic spectrum based on time
          setBars((prev) => {
            const nextBars = prev.map((_, i) => {
              const spike = Math.random() < 0.25 ? Math.random() * 50 : 0;
              const base = 25 + Math.sin(Date.now() / 150 + i * 0.4) * 35;
              return Math.min(95, Math.max(6, base + spike));
            });
            setPeaks((prevPeaks) =>
              nextBars.map((nb, i) => Math.max(nb, (prevPeaks[i] ?? 0) - 1.2))
            );
            return nextBars;
          });
        }
      } else {
        // Decay to zero when paused
        setBars((prev) => prev.map((b) => Math.max(2, b * 0.85)));
        setPeaks((prev) => prev.map((p) => Math.max(2, p - 2)));
      }
      rafRef.current = requestAnimationFrame(updateVisualizer);
    };

    rafRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const play = useCallback(async () => {
    initWebAudio();
    await winampController.play();
  }, [initWebAudio]);

  const pause = useCallback(() => {
    winampController.pause();
  }, []);

  const stop = useCallback(() => {
    winampController.pause();
    winampController.seek(0);
    setCurrentTime(0);
  }, []);

  const historyRef = useRef<number[]>([]);

  const next = useCallback(() => {
    historyRef.current.push(trackIndex);
    winampController.next();
  }, [trackIndex]);

  const previous = useCallback(() => {
    if (historyRef.current.length > 0) {
      const prevIdx = historyRef.current.pop()!;
      winampController.setTrack(prevIdx);
      return;
    }
    winampController.prev();
  }, []);

  const seek = (pct: number) => {
    if (!duration) return;
    winampController.seek((pct / 100) * duration);
  };

  // Sync EQ slider changes to Web Audio filters
  const handleEqBandChange = (index: number, value: number) => {
    setSelectedEqPreset('custom');
    setEqBands((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    winampController.setEqualizerBand(index, value);
  };

  const handlePreampChange = (value: number) => {
    setSelectedEqPreset('custom');
    setPreamp(value);
    winampController.setPreamp(value);
  };

  // Sync balance
  useEffect(() => {
    winampController.setBalance(balance);
  }, [balance]);

  const displayTime = useMemo(() => {
    if (timeRemainingMode) {
      const rem = Math.max(0, duration - currentTime);
      return `-${formatTime(rem)}`;
    }
    return formatTime(currentTime);
  }, [currentTime, duration, timeRemainingMode]);

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="wa-shell" aria-label="Winamp classic player">
      {/* ============================================================ */}
      {/* 1. MAIN PLAYER WINDOW                                        */}
      {/* ============================================================ */}
      <div className={`wa-window wa-main ${mainShade ? 'wa-window--shaded' : ''}`} style={{ left: windowPositions.main.x, top: windowPositions.main.y, zIndex: activeWindow === 'main' ? 90 : 80 }} onPointerDown={() => setActiveWindow('main')}>
        {/* Title Bar */}
        <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'main')}>
          <div className="wa-titlebar__left">
            <span className="wa-titlebar__bolt">⚡</span>
            <span className="wa-titlebar__title">WINAMP</span>
          </div>
          <div className="wa-titlebar__controls">
            <button type="button" className="wa-titlebar__btn" title="Minimize">_</button>
            <button
              type="button"
              className="wa-titlebar__btn"
              title="Toggle Windowshade"
              onClick={() => setMainShade((v) => !v)}
            >
              ▲
            </button>
            <button type="button" className="wa-titlebar__btn wa-titlebar__btn--close" title="Close Winamp" onClick={onClose}>×</button>
          </div>
        </div>

        {!mainShade && (
          <div className="wa-main__body">
            {/* Top Display Area */}
            <div className="wa-display">
              {/* Left Column: Mode & Segmented Digits */}
              <div className="wa-display__left">
                <div className="wa-indicators">
                  <span className={`wa-ind-dot ${isPlaying ? 'is-lit' : ''}`}>▶</span>
                  <span className={`wa-ind-dot ${!isPlaying && currentTime > 0 ? 'is-lit' : ''}`}>❚❚</span>
                </div>
                <button
                  type="button"
                  className="wa-time-lcd"
                  onClick={() => setTimeRemainingMode((v) => !v)}
                  title="Click to toggle elapsed / remaining time"
                >
                  <span className="wa-time-lcd__digits">{displayTime}</span>
                </button>
              </div>

              {/* Center Spectrum Analyzer */}
              <div className="wa-visualizer" aria-hidden="true">
                {bars.map((barHeight, idx) => (
                  <div key={idx} className="wa-vis-col">
                    <div className="wa-vis-bar" style={{ height: `${barHeight}%` }} />
                    <div className="wa-vis-peak" style={{ bottom: `${peaks[idx]}%` }} />
                  </div>
                ))}
              </div>

              {/* Right Column: Track Marquee & Technical Info */}
              <div className="wa-display__right">
                <div className="wa-marquee-box">
                  <div className="wa-marquee-text">
                    {trackIndex + 1}. {track.artist} - {track.title} ({duration ? formatTime(duration) : track.durationLabel})
                  </div>
                </div>
                <div className="wa-tech-info">
                  <div className="wa-bitrate">
                    <span className="wa-digit-val">128</span> <span className="wa-unit">kbps</span>
                  </div>
                  <div className="wa-samplerate">
                    <span className="wa-digit-val">44</span> <span className="wa-unit">kHz</span>
                  </div>
                  <div className="wa-audio-channels">
                    <span className="wa-chan">mono</span>
                    <span className="wa-chan is-active">stereo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Controls & Sliders */}
            <div className="wa-controls-row">
              {/* Position seeker */}
              <div className="wa-slider-track wa-slider-track--pos">
                <div className="wa-slider-progress" style={{ width: `${progressPct}%` }} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progressPct}
                  onChange={(e) => seek(Number(e.currentTarget.value))}
                  className="wa-slider-input"
                  aria-label="Seek position"
                />
              </div>

              {/* Volume & Balance sliders */}
              <div className="wa-vol-bal-row">
                <div className="wa-vol-control">
                  <span className="wa-slider-label">VOL</span>
                  <div className="wa-slider-track wa-slider-track--vol">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => {
                        const nextVol = Number(e.currentTarget.value);
                        setVolume(nextVol);
                        winampController.setVolume(nextVol);
                      }}
                      className="wa-slider-input"
                      aria-label="Volume"
                    />
                  </div>
                </div>

                <div className="wa-bal-control">
                  <span className="wa-slider-label">BAL</span>
                  <div className="wa-slider-track wa-slider-track--bal">
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={balance}
                      onChange={(e) => setBalance(Number(e.currentTarget.value))}
                      className="wa-slider-input"
                      aria-label="Balance"
                    />
                  </div>
                </div>

                {/* EQ & PL Toggle Buttons */}
                <div className="wa-toggle-btns">
                  <button
                    type="button"
                    className={`wa-btn-toggle ${showEq ? 'is-active' : ''}`}
                    onClick={() => setShowEq((v) => !v)}
                    aria-pressed={showEq}
                    aria-label="Toggle equalizer"
                  >
                    <span className="wa-led-dot" />
                    EQ
                  </button>
                  <button
                    type="button"
                    className={`wa-btn-toggle ${showPl ? 'is-active' : ''}`}
                    onClick={() => setShowPl((v) => !v)}
                    aria-pressed={showPl}
                    aria-label="Toggle playlist"
                  >
                    <span className="wa-led-dot" />
                    PL
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Transport Buttons & Mini Album Art */}
            <div className="wa-transport-row">
              <div className="wa-buttons-group">
                <button type="button" className="wa-btn-transport" onClick={previous} title="Previous">
                  |◀◀
                </button>
                <button type="button" className="wa-btn-transport" onClick={() => void play()} title="Play">
                  ▶
                </button>
                <button type="button" className="wa-btn-transport" onClick={pause} title="Pause">
                  ❚❚
                </button>
                <button type="button" className="wa-btn-transport" onClick={stop} title="Stop">
                  ■
                </button>
                <button type="button" className="wa-btn-transport" onClick={next} title="Next">
                  ▶▶|
                </button>
                <button type="button" className="wa-btn-transport" onClick={() => seek(0)} title="Eject">
                  ⏏
                </button>
              </div>

              {/* Shuffle & Repeat */}
              <div className="wa-toggles-group">
                <button
                  type="button"
                  className={`wa-btn-mode ${shuffle ? 'is-active' : ''}`}
                  aria-pressed={shuffle}
                  onClick={() => {
                    const nextVal = !shuffle;
                    setShuffle(nextVal);
                    winampController.setShuffle(nextVal);
                  }}
                  title="Shuffle"
                >
                  <span className="wa-led-dot" />
                  SHUFFLE
                </button>
                <button
                  type="button"
                  className={`wa-btn-mode ${repeat ? 'is-active' : ''}`}
                  aria-pressed={repeat}
                  onClick={() => {
                    const nextVal = !repeat;
                    setRepeat(nextVal);
                    winampController.setRepeat(nextVal);
                  }}
                  title="Repeat"
                >
                  <span className="wa-led-dot" />
                  🔁
                </button>
                <button
                  type="button"
                  className={`wa-btn-mode ${autoAdvance ? 'is-active' : ''}`}
                  onClick={() => {
                    const nextVal = !autoAdvance;
                    setAutoAdvance(nextVal);
                    winampController.setAutoAdvance(nextVal);
                  }}
                  title={autoAdvance ? 'Disable automatic next track' : 'Enable automatic next track'}
                  aria-pressed={autoAdvance}
                >
                  <span className="wa-led-dot" />
                  NEXT
                </button>
              </div>

              {/* Mini Album Cover Artwork */}
              <div
                className="wa-album-preview"
                style={{ background: albumArt.bg }}
                title={`${track.artist} - ${track.title}`}
              >
                <span className="wa-album-preview__icon">{albumArt.icon}</span>
                <span className="wa-album-preview__badge" style={{ color: albumArt.accent }}>
                  {track.artist.slice(0, 3).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. WINAMP EQUALIZER WINDOW                                   */}
      {/* ============================================================ */}
      {showEq && (
        <div className={`wa-window wa-equalizer ${eqShade ? 'wa-window--shaded' : ''}`} style={{ left: windowPositions.equalizer.x, top: windowPositions.equalizer.y, zIndex: activeWindow === 'equalizer' ? 90 : 80 }} onPointerDown={() => setActiveWindow('equalizer')}>
          <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'equalizer')}>
            <span className="wa-titlebar__title">WINAMP EQUALIZER</span>
            <div className="wa-titlebar__controls">
              <button
                type="button"
                className="wa-titlebar__btn"
                onClick={() => setEqShade((v) => !v)}
                title="Toggle Windowshade"
              >
                ▲
              </button>
              <button
                type="button"
                className="wa-titlebar__btn wa-titlebar__btn--close"
                onClick={() => setShowEq(false)}
                title="Close Equalizer"
              >
                ×
              </button>
            </div>
          </div>

          {!eqShade && (
            <div className="wa-eq__body">
              {/* EQ Top Options */}
              <div className="wa-eq__header">
                <div className="wa-eq__toggles">
                  <button
                    type="button"
                    className={`wa-btn-mode ${eqOn ? 'is-active' : ''}`}
                    onClick={() => setEqOn((v) => { const next = !v; winampController.setEqualizerEnabled(next); return next; })}
                  >
                    <span className="wa-led-dot" />
                    ON
                  </button>
                  <button
                    type="button"
                    className={`wa-btn-mode ${eqAuto ? 'is-active' : ''}`}
                    onClick={() => setEqAuto((v) => !v)}
                  >
                    <span className="wa-led-dot" />
                    AUTO
                  </button>
                </div>

                {/* Spline Curve Visualizer */}
                <div className="wa-eq__spline">
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="wa-spline-svg">
                    <polyline
                      fill="none"
                      stroke="#ffff00"
                      strokeWidth="1.6"
                      points={eqBands
                        .map((b, i) => `${(i / 9) * 96 + 2},${12 - (b / 12) * 10}`)
                        .join(' ')}
                    />
                  </svg>
                </div>

                <select
                  className="wa-btn-presets"
                  aria-label="Equalizer preset"
                  value={selectedEqPreset}
                  onChange={(event) => {
                    const preset = EQ_PRESETS.find((item) => item.id === event.currentTarget.value);
                    if (!preset) return;
                    setSelectedEqPreset(preset.id);
                    setEqBands(preset.bands);
                    setPreamp(preset.preamp);
                    setEqOn(true);
                    winampController.setEqualizerEnabled(true);
                    preset.bands.forEach((gain, index) => winampController.setEqualizerBand(index, gain));
                    winampController.setPreamp(preset.preamp);
                  }}
                >
                  <option value="custom">CUSTOM</option>
                  {EQ_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                </select>
              </div>

              {/* Sliders Grid */}
              <div className="wa-eq__sliders-container">
                <div className="wa-eq__labels-left">
                  <span>+12db</span>
                  <span>0db</span>
                  <span>-12db</span>
                </div>

                {/* Preamp */}
                <div className="wa-eq__band">
                  <div className="wa-eq__fader">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={preamp}
                      onChange={(e) => handlePreampChange(Number(e.currentTarget.value))}
                      className="wa-eq__input-vert"
                    />
                  </div>
                  <span className="wa-eq__band-name">PREAMP</span>
                </div>

                <div className="wa-eq__divider" />

                {/* 10 Frequency Faders */}
                {EQ_FREQUENCIES.map((freq, i) => {
                  const label = freq >= 1000 ? `${freq / 1000}K` : `${freq}`;
                  return (
                    <div key={freq} className="wa-eq__band">
                      <div className="wa-eq__fader">
                        <input
                          type="range"
                          min={-12}
                          max={12}
                          step={0.5}
                          value={eqBands[i]}
                          onChange={(e) => handleEqBandChange(i, Number(e.currentTarget.value))}
                          className="wa-eq__input-vert"
                        />
                      </div>
                      <span className="wa-eq__band-name">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. WINAMP PLAYLIST WINDOW                                    */}
      {/* ============================================================ */}
      {showPl && (
        <div className={`wa-window wa-playlist ${plShade ? 'wa-window--shaded' : ''}`} style={{ left: windowPositions.playlist.x, top: windowPositions.playlist.y, zIndex: activeWindow === 'playlist' ? 90 : 80 }} onPointerDown={() => setActiveWindow('playlist')}>
          <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'playlist')}>
            <span className="wa-titlebar__title">WINAMP PLAYLIST</span>
            <div className="wa-titlebar__controls">
              <button
                type="button"
                className="wa-titlebar__btn"
                onClick={() => setPlShade((v) => !v)}
                title="Toggle Windowshade"
              >
                ▲
              </button>
              <button
                type="button"
                className="wa-titlebar__btn wa-titlebar__btn--close"
                onClick={() => setShowPl(false)}
                title="Close Playlist"
              >
                ×
              </button>
            </div>
          </div>

          {!plShade && (
            <div className="wa-pl__body">
              {/* Songs List */}
              <div className="wa-pl__list" role="listbox">
                {playlist.map((item, index) => {
                  const isCurrent = index === trackIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isCurrent}
                      className={`wa-pl__item ${isCurrent ? 'is-current is-selected' : ''} ${playlistSelection.includes(index) ? 'is-selected' : ''}`}
                      onClick={(event) => {
                        if (event.ctrlKey || event.metaKey) {
                          setPlaylistSelection((selected) => selected.includes(index) ? selected.filter((value) => value !== index) : [...selected, index]);
                        } else {
                          setPlaylistSelection([index]);
                          winampController.setTrack(index);
                        }
                      }}
                      onDoubleClick={() => {
                        winampController.setTrack(index);
                        void winampController.play();
                      }}
                    >
                      <span className="wa-pl__title">
                        {index + 1}. {item.artist} - {item.title}
                      </span>
                      <span className="wa-pl__dur">{item.durationLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* Playlist Bottom Bar */}
              <div className="wa-pl__footer">
                <div className="wa-pl__actions">
                  <input
                    ref={playlistInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    hidden
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files ?? []);
                      const additions = files.map((file, index) => ({
                        id: `local-${Date.now()}-${index}-${file.name}`,
                        title: file.name.replace(/\.[^.]+$/, ''),
                        artist: 'Local file',
                        durationLabel: '—',
                        src: URL.createObjectURL(file),
                      }));
                      winampController.addTracks(additions);
                      setPlaylistRevision((revision) => revision + 1);
                      event.currentTarget.value = '';
                    }}
                  />
                  <button type="button" className="wa-btn-pl" onClick={() => playlistInputRef.current?.click()}>+ ADD</button>
                  <button
                    type="button"
                    className="wa-btn-pl"
                    disabled={!playlistSelection.length || playlist.length <= playlistSelection.length}
                    onClick={() => {
                      winampController.removeTracks(playlistSelection);
                      setPlaylistSelection([]);
                      setPlaylistRevision((revision) => revision + 1);
                    }}
                  >- REM</button>
                  <button
                    type="button"
                    className="wa-btn-pl"
                    onClick={() => setPlaylistSelection(playlist.map((_, index) => index))}
                  >SEL</button>
                  <button
                    type="button"
                    className="wa-btn-pl"
                    onClick={() => setPlaylistSelection([])}
                  >MISC</button>
                </div>

                <div className="wa-pl__status">
                  <span className="wa-pl__status-text">
                    {formatTime(currentTime)} / {formatTime(totalPlaylistSeconds)}
                  </span>
                </div>

                <div className="wa-pl__mini-transport">
                  <button type="button" className="wa-btn-pl-mini" onClick={previous} title="Prev">|◀</button>
                  <button type="button" className="wa-btn-pl-mini" onClick={() => void play()} title="Play">▶</button>
                  <button type="button" className="wa-btn-pl-mini" onClick={pause} title="Pause">❚❚</button>
                  <button type="button" className="wa-btn-pl-mini" onClick={stop} title="Stop">■</button>
                  <button type="button" className="wa-btn-pl-mini" onClick={next} title="Next">▶|</button>
                </div>

                <button type="button" className="wa-btn-pl wa-btn-pl--opts">
                  LIST OPTS
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
