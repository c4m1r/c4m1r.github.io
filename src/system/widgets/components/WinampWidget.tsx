import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../contexts/useApp';
import { winampController, type WinampState } from '../../audio/winampController';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function WinampWidget() {
  const { language } = useApp();
  const isRu = language === 'ru';
  const [state, setState] = useState<WinampState>(() => winampController.getState());

  useEffect(() => {
    return winampController.subscribe((st) => setState({ ...st }));
  }, []);

  const progressPct = useMemo(() => {
    if (!state.duration || state.duration <= 0) return 0;
    return Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100));
  }, [state.currentTime, state.duration]);

  const albumArtHue = useMemo(() => {
    let hash = 0;
    const str = state.track.artist + state.track.title;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 360;
  }, [state.track]);

  return (
    <div className="glass-widget p-3 flex flex-col justify-between w-full sm:w-[310px] min-h-[140px]">
      <div className="glass-widget__ambient" />

      {/* Header Tag */}
      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-gray-400 z-10 mb-1">
        <span className="flex items-center gap-1 text-blue-300">
          <Music size={11} className={state.isPlaying ? 'animate-pulse text-green-400' : ''} />
          {isRu ? 'СЕЙЧАС ИГРАЕТ' : 'NOW PLAYING'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => winampController.setAutoAdvance(!state.autoAdvance)}
            aria-pressed={state.autoAdvance}
            title={isRu ? 'Автоматически включать следующий трек' : 'Automatically play the next track'}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${state.autoAdvance ? 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10' : 'text-gray-400 border-white/10 hover:bg-white/10'}`}
          >
            {isRu ? `АВТО ${state.autoAdvance ? 'ВКЛ' : 'ВЫКЛ'}` : `AUTO ${state.autoAdvance ? 'ON' : 'OFF'}`}
          </button>
          <span className="text-[9px] opacity-75 font-mono">Winamp DSP</span>
        </div>
      </div>

      {/* Main Track Info */}
      <div className="flex items-center gap-3 z-10 my-1">
        {/* Album Artwork / Vinyl */}
        <div
          className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center shadow-lg border border-white/20 relative overflow-hidden transition-all duration-300 ${
            state.isPlaying ? 'ring-2 ring-blue-400/40' : ''
          }`}
          style={{
            background: `linear-gradient(135deg, hsl(${albumArtHue}, 70%, 30%), hsl(${(albumArtHue + 45) % 360}, 80%, 15%))`,
          }}
        >
          <div className="absolute inset-2 rounded-full border border-white/20 opacity-50" />
          <div className="text-xl filter drop-shadow">🎵</div>
        </div>

        {/* Track / Artist */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate leading-tight">
            {state.track.title}
          </h4>
          <p className="text-[11px] text-gray-300 truncate mt-0.5">
            {state.track.artist}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="z-10 mt-1">
        {/* Progress Slider */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            winampController.seek(clickPos * (state.duration || 180));
          }}
          className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100 group-hover:from-blue-400 group-hover:to-cyan-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => winampController.prev()}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title={isRu ? 'Предыдущий трек' : 'Previous'}
          >
            <SkipBack size={14} />
          </button>

          <button
            type="button"
            onClick={() => winampController.toggle()}
            className="w-8 h-8 rounded-full bg-white text-gray-900 hover:bg-blue-100 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            title={state.isPlaying ? (isRu ? 'Пауза' : 'Pause') : (isRu ? 'Воспроизведение' : 'Play')}
          >
            {state.isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => winampController.next()}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title={isRu ? 'Следующий трек' : 'Next'}
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
