import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECT_PLAYLIST } from '../mediaplayer/playlist';
import './winamp.css';

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function WinampPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const track = PROJECT_PLAYLIST[trackIndex] ?? PROJECT_PLAYLIST[0];
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const chooseNextIndex = useCallback((current: number) => {
    if (shuffle && PROJECT_PLAYLIST.length > 1) {
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * PROJECT_PLAYLIST.length);
      }
      return next;
    }
    return (current + 1) % PROJECT_PLAYLIST.length;
  }, [shuffle]);

  const next = useCallback(() => {
    setTrackIndex((current) => chooseNextIndex(current));
  }, [chooseNextIndex]);

  const previous = () => {
    setTrackIndex((current) => (current - 1 + PROJECT_PLAYLIST.length) % PROJECT_PLAYLIST.length);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const continuePlaying = isPlaying;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (continuePlaying) void audio.play().catch(() => setIsPlaying(false));
    // Source changes only when trackIndex changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
      } else {
        setTrackIndex((current) => chooseNextIndex(current));
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onMetadata);
    audio.addEventListener('durationchange', onMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onMetadata);
      audio.removeEventListener('durationchange', onMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [chooseNextIndex, repeat]);

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (value / 100) * duration;
  };

  return (
    <div className="winamp-shell">
      <section className="winamp-main" aria-label="Winamp player">
        <div className="winamp-caption">
          <span className="winamp-caption__mark" aria-hidden="true">⚡</span>
          <span>WINAMP</span>
          <span className="winamp-caption__dots">■ □ ×</span>
        </div>

        <div className="winamp-face">
          <div className="winamp-display">
            <div className="winamp-time">{formatClock(currentTime)}</div>
            <div className="winamp-status">{isPlaying ? '▶' : '■'}</div>
            <div className="winamp-track-info">
              <div className="winamp-marquee">{trackIndex + 1}. {track.artist} - {track.title}</div>
              <div className="winamp-metadata">{duration ? formatClock(duration) : track.durationLabel}  44 kHz  128 kbps  stereo</div>
            </div>
            <div className="winamp-spectrum" aria-hidden="true">
              {[42, 75, 58, 91, 63, 83, 35, 69, 88, 51, 72, 44, 80, 57, 67, 39].map((height, index) => (
                <span key={`${height}-${index}`} style={{ height: `${isPlaying ? height : 12}%` }} />
              ))}
            </div>
          </div>

          <div className="winamp-sliders">
            <label>
              <span>POS</span>
              <input type="range" min={0} max={100} step={0.1} value={progress} onChange={(event) => seek(Number(event.currentTarget.value))} aria-label="Position" />
            </label>
            <label>
              <span>VOL</span>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.currentTarget.value))} aria-label="Volume" />
            </label>
          </div>

          <div className="winamp-controls">
            <button type="button" onClick={previous} title="Previous">|◀</button>
            <button type="button" onClick={() => void play()} title="Play">▶</button>
            <button type="button" onClick={() => { audioRef.current?.pause(); setIsPlaying(false); }} title="Pause">❚❚</button>
            <button type="button" onClick={stop} title="Stop">■</button>
            <button type="button" onClick={next} title="Next">▶|</button>
            <button type="button" title="Open file" disabled>⏏</button>
          </div>

          <div className="winamp-toggles">
            <button type="button" className={shuffle ? 'is-active' : ''} onClick={() => setShuffle((value) => !value)}>SHUFFLE</button>
            <button type="button" className={repeat ? 'is-active' : ''} onClick={() => setRepeat((value) => !value)}>REPEAT</button>
            <span>EQ</span>
            <span>PL</span>
          </div>
        </div>
      </section>

      <section className="winamp-playlist" aria-label="Winamp playlist">
        <div className="winamp-caption winamp-caption--playlist">
          <span>WINAMP PLAYLIST</span>
          <span className="winamp-caption__dots">□ ×</span>
        </div>
        <div className="winamp-playlist__list">
          {PROJECT_PLAYLIST.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={index === trackIndex ? 'is-current' : ''}
              onDoubleClick={() => {
                setTrackIndex(index);
                window.setTimeout(() => void play(), 0);
              }}
              onClick={() => {
                setTrackIndex(index);
                setIsPlaying(false);
              }}
            >
              <span>{index + 1}. {item.artist} - {item.title}</span>
              <span>{item.durationLabel}</span>
            </button>
          ))}
        </div>
        <div className="winamp-playlist__footer">
          <span>ADD</span><span>REM</span><span>SEL</span><span>MISC</span><span>LIST OPTS</span>
        </div>
      </section>

      <audio ref={audioRef} src={track.src} preload="metadata" />
    </div>
  );
}
