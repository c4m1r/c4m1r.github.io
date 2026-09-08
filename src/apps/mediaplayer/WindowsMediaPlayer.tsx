import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECT_PLAYLIST } from './playlist';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function WindowsMediaPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTrack = PROJECT_PLAYLIST[currentIndex] ?? PROJECT_PLAYLIST[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
      setErrorMessage(null);
    } catch {
      setIsPlaying(false);
      setErrorMessage('Playback could not be started. Click Play again to allow audio.');
    }
  }, []);

  const selectTrack = useCallback((index: number, autoplay = false) => {
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage(null);
    if (!autoplay) setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % PROJECT_PLAYLIST.length);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + PROJECT_PLAYLIST.length) % PROJECT_PLAYLIST.length);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (wasPlaying) {
      void audio.play().then(() => {
        setErrorMessage(null);
      }).catch(() => {
        setIsPlaying(false);
        setErrorMessage('Playback could not continue automatically. Press Play.');
      });
    }
    // currentIndex is the actual media-source change trigger. isPlaying is read
    // intentionally so a Next/Previous action continues an active session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => {
      setCurrentIndex((index) => (index + 1) % PROJECT_PLAYLIST.length);
    };
    const onError = () => {
      setIsPlaying(false);
      setErrorMessage(`Unable to play ${currentTrack.artist} - ${currentTrack.title}.`);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrack.artist, currentTrack.title]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void playCurrent();
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = (value / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#dfe7f6] font-tahoma text-xs text-[#15396b]">
      <header className="flex items-center justify-between border-b border-[#0b2146] bg-gradient-to-r from-[#0b2d66] to-[#15498d] px-4 py-3 text-white">
        <div className="flex min-w-0 flex-col">
          <span className="text-lg font-semibold tracking-wide">Windows Media Player</span>
          <span className="truncate text-[11px] text-[#bcd1f2]">
            Now Playing: {currentTrack.artist} - {currentTrack.title}
          </span>
        </div>
        <div className="hidden items-center gap-2 text-[11px] sm:flex">
          <span className="text-[#bcd1f2]">Library:</span>
          <span className="border border-white/20 bg-[#0b2d66] px-2 py-1">Local Music</span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:flex-row">
        <section className="flex w-full flex-shrink-0 flex-col gap-3 md:w-60">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border border-[#0b2146] bg-[#020817] shadow-inner md:aspect-square">
            <div className="absolute inset-0 opacity-70" aria-hidden="true">
              <div className="h-full w-full bg-[radial-gradient(circle_at_center,#235b9f_0%,#07172f_48%,#01040a_100%)]" />
            </div>
            <div className="relative flex h-24 items-end gap-1" aria-hidden="true">
              {[35, 62, 48, 78, 54, 86, 45, 70, 38, 58, 82, 51].map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-2 bg-gradient-to-t from-[#2d77d0] to-[#b8e4ff]"
                  style={{ height: `${isPlaying ? height : Math.max(12, height / 3)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/80 bg-white/65 px-3 py-2 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0b2d66]">{currentTrack.title}</h2>
            <p className="text-[11px] text-[#305ca8]">{currentTrack.artist}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-[#4e7fd4]">Project music library</p>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="border border-[#c5d4f2] bg-white px-3 py-2 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-[#0b2d66]">
              <span>Now Playing</span>
              <span>{formatTime(currentTime)} / {duration ? formatTime(duration) : currentTrack.durationLabel}</span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(event) => handleSeek(Number(event.currentTarget.value))}
              className="mb-3 w-full"
              aria-label="Seek"
            />

            <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] text-[#0b2d66]">
              <button type="button" onClick={handlePrevious} className="border border-[#0b2d66] bg-white px-3 py-1 hover:bg-[#dfe7f6]" aria-label="Previous track">⏮</button>
              <button type="button" onClick={handlePlayPause} className="min-w-14 border border-[#0b2d66] bg-[#0b2d66] px-4 py-2 text-white shadow hover:bg-[#15498d]" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button type="button" onClick={handleNext} className="border border-[#0b2d66] bg-white px-3 py-1 hover:bg-[#dfe7f6]" aria-label="Next track">⏭</button>
              <label className="ml-2 flex items-center gap-2 text-[10px]">
                Volume
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.currentTarget.value))}
                  aria-label="Volume"
                />
              </label>
            </div>

            {errorMessage && (
              <div className="mt-2 border border-[#d98b8b] bg-[#fff1f1] px-2 py-1 text-[10px] text-[#8b1d1d]" role="status">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#c5d4f2] bg-white shadow-inner">
            <header className="border-b border-[#c5d4f2] bg-[#eef3fb] px-3 py-2 text-[11px] uppercase tracking-wide text-[#0b2d66]">
              Playlist - {PROJECT_PLAYLIST.length} tracks
            </header>
            <ul className="min-h-0 flex-1 overflow-auto divide-y divide-[#e6ecf7]">
              {PROJECT_PLAYLIST.map((track, index) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-[#0b2d66] to-[#15498d] text-white'
                        : 'hover:bg-[#eef3fb]'
                    }`}
                    onDoubleClick={() => {
                      selectTrack(index, true);
                      window.setTimeout(() => void playCurrent(), 0);
                    }}
                    onClick={() => selectTrack(index)}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold">{index + 1}. {track.title}</span>
                      <span className="truncate text-[10px] opacity-80">{track.artist}</span>
                    </span>
                    <span className="ml-3 text-[10px] opacity-75">{track.durationLabel}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-between border-t border-[#0b2146] bg-[#0b2d66] px-4 py-2 text-[10px] text-white">
        <span>Local project media - no network fallback</span>
        <span>{PROJECT_PLAYLIST.length} / {PROJECT_PLAYLIST.length}</span>
      </footer>

      <audio ref={audioRef} src={currentTrack.src} preload="metadata" />
    </div>
  );
}
