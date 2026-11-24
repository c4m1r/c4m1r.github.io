import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { PROJECT_PLAYLIST, MediaTrack } from '../mediaplayer/playlist';
import { winampController, type WinampEqualizerPreset } from '../../system/audio/winampController';
import { createWinampEqf, parseWinampEqf } from '../../system/audio/winampEqf';
import { createM3uPlaylist, parseM3uPlaylist } from '../../system/audio/winampM3u';
import { extractWinampSkinSprites } from '../../system/audio/winampSkinAtlas';
import { parseWinampSkinArchive } from '../../system/audio/winampSkin';
import { clearActiveWinampSkin, getActiveWinampSkin, saveActiveWinampSkin } from '../../system/audio/winampSkinLibrary';
import {
  createWinampLocalAudioId,
  deleteWinampLocalAudioFiles,
  getWinampLocalAudioFiles,
  saveWinampLocalAudioFiles,
  updateWinampLocalAudioMetadata,
} from '../../system/audio/winampLocalLibrary';
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


type FourthVisualizerMode =
  | 'Spectrum' | 'Oscilloscope' | 'Peak meter'
  | 'Alchemy' | 'Bars and Waves' | 'Battery'
  | 'Ambience' | 'Particle' | 'Plenoptic' | 'Spikes' | 'Musical Colors'
  | 'AVS' | 'MilkDrop';

const fourthVisualizerPresets: Partial<Record<FourthVisualizerMode, readonly string[]>> = {
  AVS: ['Scope', 'Feedback Tunnel', 'Rotating Geometry', 'Kaleidoscope'],
  MilkDrop: ['Geiss Flow', 'Fractal Flame', 'Waveform Tunnel', 'Psychedelic Swirl'],
};

function renderFourthVisualizer(mode: FourthVisualizerMode, bars: number[], peaks: number[], waveform: number[], presetIndex = 0) {

  const wavePoints = waveform.map((sample, index) => `${(index / Math.max(1, waveform.length - 1)) * 100},${100 - sample}`).join(' ');
  const radialPoints = bars.map((value, index) => {
    const angle = (index / bars.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 18 + value * 0.32;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(' ');
  const hue = (index: number) => (index * 19 + 105) % 360;
  if (mode === 'Oscilloscope') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="wa-viz-grid" d="M0 25H100 M0 50H100 M0 75H100 M25 0V100 M50 0V100 M75 0V100" /><polyline className="wa-viz-wave" points={wavePoints} /></svg>;
  if (mode === 'Spectrum' || mode === 'Peak meter') return <div className={`wa-video__bars ${mode === 'Peak meter' ? 'wa-video__bars--peaks' : ''}`}>{bars.map((value, index) => <span key={index} style={{height:`${Math.max(2, mode === 'Peak meter' ? peaks[index] : value)}%`}} />)}</div>;
  if (mode === 'Bars and Waves') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="wa-viz-wave" d={bars.map((v,i)=>`M${(i/bars.length)*100} 50v${-Math.max(3,v*.42)} M${(i/bars.length)*100} 50v${Math.max(3,v*.42)}`).join(' ')} /><polyline className="wa-viz-wave wa-viz-wave--secondary" points={wavePoints} /></svg>;
  if (mode === 'Battery') return <div className="wa-viz-battery">{bars.slice(0,12).map((v,i)=><span key={i} className={v>45?'is-charged':''} style={{height:`${Math.max(8,v)}%`}} />)}</div>;
  if (mode === 'Ambience') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="wa-ambience"><stop offset="0%" stopColor="#b7ffdc" stopOpacity=".9"/><stop offset="100%" stopColor="#1b62a5" stopOpacity="0"/></radialGradient></defs><circle cx="50" cy="50" r={24+Math.max(...bars)*.34} fill="url(#wa-ambience)" /><polyline className="wa-viz-wave wa-viz-wave--soft" points={wavePoints} /></svg>;
  if (mode === 'Particle') return <svg viewBox="0 0 100 100" aria-hidden="true">{bars.map((v,i)=><circle key={i} cx={(i*37+13)%100} cy={(i*23+waveform[i%waveform.length])%100} r={1.2+v/18} fill={`hsl(${hue(i)} 95% 65%)`} opacity=".8" />)}</svg>;
  if (mode === 'Plenoptic') return <svg viewBox="0 0 100 100" aria-hidden="true">{[0,1,2,3,4].map((i)=><circle key={i} cx="50" cy="50" r={12+i*8+bars[i*3]*.12} fill="none" stroke={`hsl(${185+i*24} 90% 65%)`} strokeWidth="1.2" opacity={.8-i*.1} />)}<polyline className="wa-viz-wave" points={wavePoints} /></svg>;
  if (mode === 'Spikes') return <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={radialPoints} fill="rgba(255,170,40,.18)" stroke="#ffb52e" strokeWidth="1.2" /><circle cx="50" cy="50" r="10" fill="#ff6b25" opacity=".55" /></svg>;
  if (mode === 'Musical Colors') return <div className="wa-viz-colors">{bars.map((v,i)=><span key={i} style={{height:`${Math.max(3,v)}%`,background:`hsl(${hue(i)} 95% 55%)`}} />)}</div>;
  if (mode === 'Alchemy') return <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={radialPoints} fill="rgba(25,210,255,.12)" stroke="#20dcff" strokeWidth="1.4" /><polygon points={bars.map((v,i)=>{const a=(i/bars.length)*Math.PI*2;const r=15+v*.2;return `${50+Math.cos(a)*r},${50+Math.sin(a)*r}`;}).join(' ')} fill="none" stroke="#ff4dd2" strokeWidth="1" /><circle cx="50" cy="50" r="5" fill="#fff" /></svg>;
  if (mode === 'AVS') return <svg className={`wa-viz-preset wa-viz-preset--${presetIndex % 4}`} viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(50 50)"><polyline className="wa-viz-wave" points={waveform.map((v,i)=>{const a=(i/(waveform.length-1))*Math.PI*2;const r=12+v*.34;return `${Math.cos(a)*r},${Math.sin(a)*r}`;}).join(' ')} /><polyline className="wa-viz-wave wa-viz-wave--secondary" points={waveform.map((v,i)=>{const a=(i/(waveform.length-1))*Math.PI*2;const r=10+v*.28;return `${Math.cos(-a)*r},${Math.sin(-a)*r}`;}).join(' ')} /></g></svg>;
  return <svg className={`wa-viz-preset wa-viz-preset--${presetIndex % 4}`} viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="wa-milkdrop"><stop stopColor="#fff" /><stop offset=".35" stopColor="#4be8ff" /><stop offset="1" stopColor="#18216c" stopOpacity="0" /></radialGradient></defs><circle cx="50" cy="50" r={15+Math.max(...bars)*.35} fill="url(#wa-milkdrop)" opacity=".8" /><polygon points={radialPoints} fill="none" stroke="#ff69d4" strokeWidth="1.1" /><polyline className="wa-viz-wave" points={wavePoints} /></svg>;
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

  const [playlistSelection, setPlaylistSelection] = useState<number[]>([]);
  const [showPlaylistDurations, setShowPlaylistDurations] = useState(true);
  const [followPlaylistPlayback, setFollowPlaylistPlayback] = useState(true);
  const [draggedPlaylistIndex, setDraggedPlaylistIndex] = useState<number | null>(null);
  const [playlistRevision, setPlaylistRevision] = useState(0);
  const playlistInputRef = useRef<HTMLInputElement | null>(null);
  const m3uInputRef = useRef<HTMLInputElement | null>(null);
  const skinInputRef = useRef<HTMLInputElement | null>(null);
  const [skinVisuals, setSkinVisuals] = useState<{ name: string; mainUrl: string; titlebarUrl: string; sprites: Record<string, string> } | null>(null);
  const [skinStatus, setSkinStatus] = useState('');
  const [skinAppearance, setSkinAppearance] = useState<'dev-alpha' | 'webamp-classic' | 'wsz'>(() => {
    try {
      // v3 distinguishes an intentional current selection from the old v2
      // Dev Alpha default, which otherwise silently bypassed Classic startup.
      const current = window.localStorage.getItem('winamp:skin-appearance:v3');
      if (current === 'dev-alpha' || current === 'webamp-classic' || current === 'wsz') return current;
      const legacy = window.localStorage.getItem('winamp:skin-appearance:v2');
      if (legacy === 'wsz' || window.localStorage.getItem('winamp:skin-appearance:v1') === 'wsz') return 'wsz';
      return 'webamp-classic';
    } catch {
      return 'webamp-classic';
    }
  });
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);
  const [m3uStatus, setM3uStatus] = useState('');
  const [localLibraryStatus, setLocalLibraryStatus] = useState('');

  const applySkinFile = useCallback(async (file: Blob, fileName: string, persist: boolean) => {
    const archive = await parseWinampSkinArchive(file, fileName);
    const spriteBlobs = await extractWinampSkinSprites(archive, ['equalizer', 'equalizerTitlebarActive', 'equalizerTitlebarInactive', 'equalizerPreset', 'equalizerPresetPressed', 'equalizerOff', 'equalizerOffPressed', 'equalizerOn', 'equalizerAuto', 'equalizerAutoPressed', 'equalizerAutoOn', 'equalizerClose', 'equalizerClosePressed', 'equalizerToggle', 'equalizerVisualizerBackground', 'equalizerSliderThumb', 'equalizerSliderThumbPressed', 'equalizerPreampBand', 'equalizerBand0', 'equalizerBand1', 'equalizerBand2', 'equalizerBand3', 'equalizerBand4', 'equalizerBand5', 'equalizerBand6', 'equalizerBand7', 'equalizerBand8', 'equalizerBand9', 'main', 'titlebarActive', 'previousPressed', 'play', 'playPressed', 'pause', 'pausePressed', 'stop', 'stopPressed', 'next', 'nextPressed', 'eject', 'ejectPressed', 'positionTrack', 'positionThumb', 'positionThumbPressed', 'volumeTrack', 'volumeThumb', 'volumeThumbPressed', 'balanceTrack', 'balanceThumb', 'balanceThumbPressed', 'playIndicator', 'pauseIndicator', 'stopIndicator', 'repeat', 'repeatPressed', 'repeatActive', 'shuffle', 'shufflePressed', 'shuffleActive', 'equalizerToggleOff', 'equalizerToggleOn', 'playlistToggleOff', 'playlistToggleOn']);
    const numericSpriteBlobs = await extractWinampSkinSprites(archive, ['digit0', 'digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6', 'digit7', 'digit8', 'digit9', 'timeMinus']).catch(() => new Map());
    const sprites = Object.fromEntries([...spriteBlobs, ...numericSpriteBlobs].map(([id, blob]) => [id, URL.createObjectURL(blob)]));
    const nextVisuals = { name: fileName, mainUrl: sprites.main, titlebarUrl: sprites.titlebarActive, sprites };
    setSkinVisuals(nextVisuals);
    if (persist) {
      try {
        await saveActiveWinampSkin(fileName, file);
        setSkinStatus(`Applied and saved skin: ${fileName}`);
      } catch {
        setSkinStatus(`Applied ${fileName}; browser storage is unavailable, so it will not survive reload`);
      }
    } else {
      setSkinStatus(`Restored skin: ${fileName}`);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getActiveWinampSkin().then((saved) => {
      if (active && saved) void applySkinFile(saved.blob, saved.name, false).catch((error) => {
        if (active) setSkinStatus(error instanceof Error ? error.message : 'Unable to restore saved skin');
      });
    }).catch((error) => {
      if (active) setSkinStatus(error instanceof Error ? error.message : 'Skin storage unavailable');
    });
    return () => { active = false; };
  }, [applySkinFile]);

  useEffect(() => () => {
    if (skinVisuals) {
      Object.values(skinVisuals.sprites).forEach((url) => URL.revokeObjectURL(url));
    }
  }, [skinVisuals]);

  // Restore persisted local files as fresh object URLs in the shared controller queue.
  useEffect(() => {
    let active = true;
    void getWinampLocalAudioFiles().then((records) => {
      if (!active) return;
      const existingTrackIds = new Set(winampController.getPlaylist().map((track) => track.id));
      const restored = records
        .filter(({ id }) => !existingTrackIds.has(id))
        .map(({ blob, ...track }) => ({
          ...track,
          src: URL.createObjectURL(blob),
        }));
      if (restored.length) {
        winampController.addTracks(restored);
        setLocalLibraryStatus(`Restored ${restored.length} saved local track${restored.length === 1 ? '' : 's'}`);
      }
    }).catch((error) => {
      if (active) setLocalLibraryStatus(error instanceof Error ? error.message : 'Local audio library unavailable');
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync with global winampController
  useEffect(() => {
    const unsubscribe = winampController.subscribe((st) => {
      setTrackIndex(st.trackIndex);
      setIsPlaying(st.isPlaying);
      setCurrentTime(st.currentTime);
      if (st.duration > 0) setDuration(st.duration);
      setVolume(st.volume);
      setShuffle(st.shuffle);
      setAutoAdvance(st.autoAdvance);
    });
    const refreshPlaylist = () => setPlaylistRevision((revision) => revision + 1);
    window.addEventListener('winamp:playlist-changed', refreshPlaylist);
    return () => {
      unsubscribe();
      window.removeEventListener('winamp:playlist-changed', refreshPlaylist);
    };
  }, []);

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
  const [customEqPresets, setCustomEqPresets] = useState<WinampEqualizerPreset[]>(() => winampController.getCustomEqualizerPresets());
  const [newEqPresetName, setNewEqPresetName] = useState('');
  const eqfInputRef = useRef<HTMLInputElement | null>(null);
  const [eqfStatus, setEqfStatus] = useState('');
  const allEqPresets: WinampEqualizerPreset[] = [...EQ_PRESETS, ...customEqPresets];

  useEffect(() => {
    const matchesCurrent = (preset: WinampEqualizerPreset) =>
      preset.preamp === preamp && preset.bands.every((gain, index) => gain === eqBands[index]);
    const matchingPreset = allEqPresets.find((preset) => preset.id === selectedEqPreset && matchesCurrent(preset))
      ?? allEqPresets.find(matchesCurrent);
    setSelectedEqPreset(matchingPreset?.id ?? 'custom');
  }, [eqBands, preamp, customEqPresets, selectedEqPreset]);

  const applyEqPreset = (preset: WinampEqualizerPreset) => {
    setSelectedEqPreset(preset.id);
    setEqBands([...preset.bands]);
    setPreamp(preset.preamp);
    setEqOn(true);
    winampController.setEqualizerEnabled(true);
    preset.bands.forEach((gain, index) => winampController.setEqualizerBand(index, gain));
    winampController.setPreamp(preset.preamp);
  };

  const saveEqPreset = () => {
    const next = winampController.saveCustomEqualizerPreset(newEqPresetName);
    if (!newEqPresetName.trim()) return;
    setCustomEqPresets(next);
    const saved = next.find((preset) => preset.label.toLowerCase() === newEqPresetName.trim().slice(0, 32).toLowerCase());
    if (saved) setSelectedEqPreset(saved.id);
    setNewEqPresetName('');
  };

  const deleteEqPreset = () => {
    if (!selectedEqPreset.startsWith('custom-')) return;
    setCustomEqPresets(winampController.deleteCustomEqualizerPreset(selectedEqPreset));
    setSelectedEqPreset('custom');
  };

  const importEqfFile = async (file?: File) => {
    if (!file) return;
    try {
      const imported = parseWinampEqf(await file.arrayBuffer());
      if (!imported.length) {
        setEqfStatus('No presets found');
        return;
      }
      const next = winampController.importCustomEqualizerPresets(imported.map((preset) => ({ label: preset.name, preamp: preset.preamp, bands: preset.bands })));
      setCustomEqPresets(next);
      setEqfStatus(`Imported ${imported.length} preset${imported.length === 1 ? '' : 's'}`);
    } catch (error) {
      setEqfStatus(error instanceof Error ? error.message : 'Unable to read EQF file');
    }
  };

  const downloadEqf = (presets: Array<{ name: string; preamp: number; bands: number[] }>, filename: string) => {
    const buffer = createWinampEqf(presets);
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportEqfFile = () => {
    const selected = allEqPresets.find((preset) => preset.id === selectedEqPreset);
    const label = selected?.label ?? 'My Winamp EQ';
    downloadEqf([{ name: label, preamp, bands: [...eqBands] }], `${label.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'winamp-eq'}.eqf`);
    setEqfStatus('Current preset exported');
  };

  const exportEqfLibrary = () => {
    const presets = allEqPresets.map((preset) => ({
      name: preset.label,
      preamp: preset.preamp,
      bands: [...preset.bands],
    }));
    downloadEqf(presets, 'winamp.q1');
    setEqfStatus(`Exported ${presets.length} presets to winamp.q1`);
  };


  const importM3uFile = async (file?: File) => {
    if (!file) return;
    setLocalLibraryStatus('');
    try {
      const parsed = parseM3uPlaylist(await file.text());
      if (!parsed.tracks.length) {
        setM3uStatus(parsed.skippedEntries ? `No playable URLs; skipped ${parsed.skippedEntries} local/relative entries` : 'Playlist is empty');
        return;
      }
      winampController.addTracks(parsed.tracks);
      setM3uStatus(`Added ${parsed.tracks.length} tracks${parsed.skippedEntries ? `; skipped ${parsed.skippedEntries} local/relative entries` : ''}`);
    } catch (error) {
      setM3uStatus(error instanceof Error ? error.message : 'Unable to read M3U playlist');
    }
  };

  const exportM3uFile = () => {
    const result = createM3uPlaylist(winampController.getPlaylist());
    if (result.content === '#EXTM3U\n') {
      setM3uStatus('No web-address tracks to export; local files need a portable path');
      return;
    }
    const url = URL.createObjectURL(new Blob([result.content], { type: 'audio/x-mpegurl;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'winamp-playlist.m3u';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setM3uStatus(`Exported playlist${result.skippedEntries ? `; skipped ${result.skippedEntries} local/unsupported tracks` : ''}`);
  };

  const addLocalAudioFiles = async (files: File[]) => {
    setM3uStatus('');
    const audioFiles = files.filter((file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm)$/i.test(file.name));
    if (!audioFiles.length) {
      setLocalLibraryStatus('No supported audio files selected');
      return;
    }

    let additions: MediaTrack[] = [];
    try {
      const saved = await saveWinampLocalAudioFiles(audioFiles);
      additions = saved.map(({ blob, id, title, artist, durationLabel }) => ({
        id,
        title,
        artist,
        durationLabel,
        src: URL.createObjectURL(blob),
      }));
      setLocalLibraryStatus(`Added and saved ${additions.length} local track${additions.length === 1 ? '' : 's'}`);
    } catch (error) {
      additions = audioFiles.map((file) => ({
        id: createWinampLocalAudioId(),
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local file',
        durationLabel: '—',
        src: URL.createObjectURL(file),
      }));
      setLocalLibraryStatus(error instanceof Error
        ? `Added for this session only: ${error.message}`
        : 'Added for this session only; persistent storage failed');
    }

    if (!additions.length) return;
    winampController.addTracks(additions);
    additions.forEach((track) => {
      const metadataAudio = new Audio();
      metadataAudio.preload = 'metadata';
      metadataAudio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(metadataAudio.duration) && metadataAudio.duration > 0) {
          const durationLabel = formatTime(metadataAudio.duration);
          winampController.updateTrackMetadata(track.id, { durationLabel });
          if (track.id.startsWith('local-')) {
            void updateWinampLocalAudioMetadata(track.id, { durationLabel }).catch(() => undefined);
          }
        }
        metadataAudio.removeAttribute('src');
        metadataAudio.load();
      }, { once: true });
      metadataAudio.addEventListener('error', () => {
        metadataAudio.removeAttribute('src');
        metadataAudio.load();
      }, { once: true });
      metadataAudio.src = track.src;
    });
  };

  // Visualizer bar heights and peak dots
  const [bars, setBars] = useState<number[]>(() => Array(19).fill(2));
  const [peaks, setPeaks] = useState<number[]>(() => Array(19).fill(2));
  const [waveform, setWaveform] = useState<number[]>(() => Array(19).fill(50));
  const [mainVisualizerMode, setMainVisualizerMode] = useState<0 | 1 | 2>(0);
  const mainVisualizerModeNames = ['Spectrum', 'Oscilloscope', 'Peak meter'] as const;
  const fourthVisualizerGroups = [
    { label: 'Winamp Classic', modes: ['Spectrum', 'Oscilloscope', 'Peak meter'] },
    { label: 'Windows Media Player', modes: ['Alchemy', 'Bars and Waves', 'Battery'] },
    { label: 'WMP Legacy', modes: ['Ambience', 'Particle', 'Plenoptic', 'Spikes', 'Musical Colors'] },
    { label: 'Winamp AVS-inspired', modes: ['AVS'] },
    { label: 'Winamp MilkDrop-inspired', modes: ['MilkDrop'] },
  ] as const;
  const fourthVisualizerModes = fourthVisualizerGroups.flatMap((group) => group.modes) as FourthVisualizerMode[];
  const [fourthVisualizerMode, setFourthVisualizerMode] = useState<FourthVisualizerMode>('Spectrum');
  const [fourthVisualizerPresetIndex, setFourthVisualizerPresetIndex] = useState(0);
  const [visualizerAutoCycle, setVisualizerAutoCycle] = useState(false);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!visualizerAutoCycle || !showVideo || videoShade || videoMode !== 'visualizer') return;
    const cycle = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setFourthVisualizerMode((mode) => {
        const index = fourthVisualizerModes.indexOf(mode);
        return fourthVisualizerModes[(index + 1) % fourthVisualizerModes.length];
      });
      setFourthVisualizerPresetIndex(0);
    }, 15000);
    return () => window.clearInterval(cycle);
  }, [visualizerAutoCycle, showVideo, videoShade, videoMode]);
  type PlayerWindowKey = 'main' | 'equalizer' | 'playlist' | 'video';
  const [activeWindow, setActiveWindow] = useState<PlayerWindowKey>('main');
  const [detachedWindows, setDetachedWindows] = useState<PlayerWindowKey[]>([]);
  const [videoMode, setVideoMode] = useState<'visualizer' | 'video'>('visualizer');
  const [showVideo, setShowVideo] = useState(true);
  const [videoShade, setVideoShade] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const setVideoWindowVisible = (visible: boolean) => {
    if (visible === showVideo) return;
    if (!detachedWindows.includes('video')) {
      const offset = visible ? 275 : -275;
      setWindowPositions((current) => ({
        ...current,
        main: { ...current.main, y: current.main.y + offset },
        equalizer: { ...current.equalizer, y: current.equalizer.y + offset },
        playlist: { ...current.playlist, y: current.playlist.y + offset },
        video: visible
          ? { x: current.main.x, y: current.main.y }
          : current.video,
      }));
    }
    setShowVideo(visible);
  };
  const videoUrlRef = useRef('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current); }, []);
  // Build the Classic windows as one vertical stack using the same responsive
  // video size as the stylesheet. This prevents a gap above Main on very narrow
  // screens where the square visualization must shrink below 275px.
  const getClassicWindowPositions = () => {
    const viewportWidth = typeof window === 'undefined' ? 375 : window.innerWidth;
    const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight;
    const videoSize = Math.min(275, Math.max(0, viewportWidth - 8));
    const stackHeight = videoSize + 116 + 104 + 232;
    const x = Math.max(4, Math.round((viewportWidth - 275) / 2));
    const stackTop = Math.max(8, Math.round((viewportHeight - stackHeight) / 2));
    const mainTop = stackTop + videoSize;
    return {
      main: { x, y: mainTop },
      equalizer: { x, y: mainTop + 116 },
      playlist: { x, y: mainTop + 220 },
      video: { x, y: stackTop },
    };
  };
  const [windowPositions, setWindowPositions] = useState<Record<PlayerWindowKey, { x: number; y: number }>>(() => (
    skinAppearance === 'webamp-classic'
      ? getClassicWindowPositions()
      : {
          main: { x: 24, y: 48 },
          equalizer: { x: 24, y: 164 },
          playlist: { x: 24, y: 280 },
          video: { x: 24, y: 0 },
        }
  ));
  const [playlistSize, setPlaylistSize] = useState({ width: 269, height: 232 });
  const playlistResizeRef = useRef<{ pointerId: number; pointerX: number; pointerY: number; width: number; height: number } | null>(null);
  const dragRef = useRef<{
    anchorKey: PlayerWindowKey;
    members: Array<{ key: PlayerWindowKey; originX: number; originY: number; width: number; height: number }>;
    pointerX: number;
    pointerY: number;
  } | null>(null);
  const startWindowDrag = (event: React.PointerEvent, key: PlayerWindowKey) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    const keys: PlayerWindowKey[] = ['main', ...(showEq ? ['equalizer' as const] : []), ...(showPl ? ['playlist' as const] : []), ...(showVideo ? ['video' as const] : [])];
    const rects = Object.fromEntries(keys.map((windowKey) => {
      const node = document.querySelector<HTMLElement>(`.wa-${windowKey}`);
      const position = windowPositions[windowKey];
      return [windowKey, {
        left: position.x, top: position.y,
        right: position.x + (node?.offsetWidth ?? (windowKey === 'video' ? 320 : 275)),
        bottom: position.y + (node?.offsetHeight ?? (windowKey === 'main' ? 116 : windowKey === 'equalizer' ? 104 : windowKey === 'video' ? 240 : 232)),
        width: node?.offsetWidth ?? (windowKey === 'video' ? 320 : 275),
        height: node?.offsetHeight ?? (windowKey === 'main' ? 116 : windowKey === 'equalizer' ? 104 : windowKey === 'video' ? 240 : 232),
      }];
    })) as Record<PlayerWindowKey, { left: number; top: number; right: number; bottom: number; width: number; height: number }>;
    const connected = new Set<PlayerWindowKey>([key]);
    const canJoin = (candidate: PlayerWindowKey) => !detachedWindows.includes(candidate) && !detachedWindows.includes(key);
    let changed = true;
    while (changed) {
      changed = false;
      for (const candidate of keys) {
        if (connected.has(candidate) || !canJoin(candidate)) continue;
        const a = rects[candidate];
        for (const member of connected) {
          const b = rects[member];
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          const touchesVertically = overlapX >= 32 && (Math.abs(a.top - b.bottom) <= 8 || Math.abs(b.top - a.bottom) <= 8);
          const touchesHorizontally = overlapY >= 24 && (Math.abs(a.left - b.right) <= 8 || Math.abs(b.left - a.right) <= 8);
          if (touchesVertically || touchesHorizontally) {
            connected.add(candidate);
            changed = true;
            break;
          }
        }
      }
    }
    setActiveWindow(key);
    dragRef.current = {
      anchorKey: key,
      pointerX: event.clientX,
      pointerY: event.clientY,
      members: [...connected].map((member) => ({
        key: member, originX: windowPositions[member].x, originY: windowPositions[member].y,
        width: rects[member].width, height: rects[member].height,
      })),
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const deltaX = event.clientX - drag.pointerX;
      const deltaY = event.clientY - drag.pointerY;
      const minX = Math.max(...drag.members.map((member) => -member.originX));
      const maxX = Math.min(...drag.members.map((member) => window.innerWidth - member.width - member.originX));
      const minY = Math.max(...drag.members.map((member) => -member.originY));
      const maxY = Math.min(...drag.members.map((member) => window.innerHeight - member.height - 30 - member.originY));
      // If a connected group is larger than the viewport, keep the grabbed
      // window in bounds rather than applying an inverted clamp to the group.
      const anchor = drag.members.find((member) => member.key === drag.anchorKey)!;
      const anchorMinX = -anchor.originX;
      const anchorMaxX = window.innerWidth - anchor.width - anchor.originX;
      const anchorMinY = -anchor.originY;
      const anchorMaxY = window.innerHeight - anchor.height - 30 - anchor.originY;
      const clampDelta = (value: number, min: number, max: number) =>
        min <= max ? Math.max(min, Math.min(max, value)) : Math.max(max, Math.min(min, value));
      const dx = clampDelta(deltaX, minX <= maxX ? minX : anchorMinX, minX <= maxX ? maxX : anchorMaxX);
      const dy = clampDelta(deltaY, minY <= maxY ? minY : anchorMinY, minY <= maxY ? maxY : anchorMaxY);
      setWindowPositions((current) => {
        const next = { ...current };
        drag.members.forEach((member) => {
          next[member.key] = { x: member.originX + dx, y: member.originY + dy };
        });
        return next;
      });
    };
    const stop = () => {
      const drag = dragRef.current;
      if (!drag) return;
      const moving = new Set(drag.members.map((member) => member.key));
      if (!detachedWindows.includes(drag.anchorKey)) {
        const anchorNode = document.querySelector<HTMLElement>(`.wa-${drag.anchorKey}`);
        const anchorRect = anchorNode?.getBoundingClientRect();
        if (anchorRect) {
          let snapX = 0;
          let snapY = 0;
          let bestX = 13;
          let bestY = 13;
          const candidates: PlayerWindowKey[] = ['main', ...(showEq ? ['equalizer' as const] : []), ...(showPl ? ['playlist' as const] : []), ...(showVideo ? ['video' as const] : [])];
          for (const candidate of candidates) {
            if (moving.has(candidate) || detachedWindows.includes(candidate)) continue;
            const node = document.querySelector<HTMLElement>(`.wa-${candidate}`);
            const rect = node?.getBoundingClientRect();
            if (!rect) continue;
            const overlapX = Math.min(anchorRect.right, rect.right) - Math.max(anchorRect.left, rect.left);
            const overlapY = Math.min(anchorRect.bottom, rect.bottom) - Math.max(anchorRect.top, rect.top);
            if (overlapX >= 32) {
              const topGap = rect.bottom - anchorRect.top;
              const bottomGap = rect.top - anchorRect.bottom;
              if (Math.abs(topGap) <= bestY) { bestY = Math.abs(topGap); snapY = topGap; }
              if (Math.abs(bottomGap) <= bestY) { bestY = Math.abs(bottomGap); snapY = bottomGap; }
            }
            if (overlapY >= 24) {
              const leftGap = rect.right - anchorRect.left;
              const rightGap = rect.left - anchorRect.right;
              if (Math.abs(leftGap) <= bestX) { bestX = Math.abs(leftGap); snapX = leftGap; }
              if (Math.abs(rightGap) <= bestX) { bestX = Math.abs(rightGap); snapX = rightGap; }
            }
          }
          if (bestX <= 12 || bestY <= 12) {
            setWindowPositions((current) => {
              const updated = { ...current };
              drag.members.forEach((member) => {
                updated[member.key] = { x: current[member.key].x + (bestX <= 12 ? snapX : 0), y: current[member.key].y + (bestY <= 12 ? snapY : 0) };
              });
              return updated;
            });
          }
        }
      }
      dragRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [detachedWindows, showEq, showPl, showVideo]);


  const startPlaylistResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (skinAppearance !== 'webamp-classic' || plShade) return;
    event.preventDefault();
    event.stopPropagation();
    playlistResizeRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX, pointerY: event.clientY,
      width: document.querySelector<HTMLElement>('.wa-playlist')?.offsetWidth ?? playlistSize.width,
      height: document.querySelector<HTMLElement>('.wa-playlist')?.offsetHeight ?? playlistSize.height,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const resize = playlistResizeRef.current;
      if (!resize || event.pointerId !== resize.pointerId) return;
      const left = windowPositions.playlist.x;
      const top = windowPositions.playlist.y;
      const maxWidth = Math.max(275, Math.min(550, window.innerWidth - left - 8));
      const maxHeight = Math.max(232, Math.min(464, window.innerHeight - top - 8));
      setPlaylistSize({
        width: Math.max(275, Math.min(maxWidth, resize.width + event.clientX - resize.pointerX)),
        height: Math.max(232, Math.min(maxHeight, resize.height + event.clientY - resize.pointerY)),
      });
    };
    const stop = (event: PointerEvent) => {
      if (playlistResizeRef.current?.pointerId === event.pointerId) playlistResizeRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [windowPositions.playlist.x, windowPositions.playlist.y]);

  useEffect(() => {
    const clampSize = () => {
      const maxWidth = Math.max(275, Math.min(550, window.innerWidth - windowPositions.playlist.x - 8));
      const maxHeight = Math.max(232, Math.min(464, window.innerHeight - windowPositions.playlist.y - 8));
      setPlaylistSize((current) => ({
        width: Math.min(current.width, maxWidth),
        height: Math.min(current.height, maxHeight),
      }));
    };
    window.addEventListener('resize', clampSize);
    return () => window.removeEventListener('resize', clampSize);
  }, [windowPositions.playlist.x, windowPositions.playlist.y]);

  const playlist = useMemo(() => winampController.getPlaylist(), [playlistRevision]);
  const track = playlist[trackIndex] ?? playlist[0] ?? PROJECT_PLAYLIST[0];

  useEffect(() => {
    if (!followPlaylistPlayback || !showPl) return;
    document.querySelector<HTMLElement>('.wa-playlist .wa-pl__item.is-current')?.scrollIntoView({ block: 'nearest' });
  }, [trackIndex, followPlaylistPlayback, showPl]);
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
    const timeData = new Uint8Array(64);

    const updateVisualizer = () => {
      if (!active) return;
      const analyser = analyserRef.current;
      if (isPlaying) {
        if (analyser && audioCtxRef.current?.state === 'running') {
          analyser.getByteFrequencyData(freqData);
          analyser.getByteTimeDomainData(timeData);
          setWaveform(Array.from({ length: 19 }, (_, i) => {
            const sample = timeData[Math.round(i * (timeData.length - 1) / 18)] ?? 128;
            return 50 + (sample - 128) / 2.56;
          }));
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
          // Synthetic spectrum and waveform keep the display alive without an active analyser.
          setWaveform(Array.from({ length: 19 }, (_, i) => 50 + Math.sin(Date.now() / 95 + i * 0.72) * 34));
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

  // Webamp-compatible transport shortcuts. Editable controls keep their native keyboard behavior.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;

      const key = event.key.toLowerCase();
      let handled = true;

      switch (key) {
        case 'z':
          previous();
          break;
        case 'x':
          void play();
          break;
        case 'c':
          pause();
          break;
        case 'v':
          stop();
          break;
        case 'b':
          next();
          break;
        case 'r': {
          const nextValue = !winampController.isRepeat();
          setRepeat(nextValue);
          winampController.setRepeat(nextValue);
          break;
        }
        case 's': {
          const nextValue = !winampController.isShuffle();
          setShuffle(nextValue);
          winampController.setShuffle(nextValue);
          break;
        }
        case 'l':
          playlistInputRef.current?.click();
          break;
        case 'arrowleft':
          winampController.seek(Math.max(0, currentTime - 5));
          break;
        case 'arrowright':
          winampController.seek(Math.min(duration || currentTime + 5, currentTime + 5));
          break;
        case 'arrowup': {
          const nextValue = Math.min(1, volume + 0.05);
          setVolume(nextValue);
          winampController.setVolume(nextValue);
          break;
        }
        case 'arrowdown': {
          const nextValue = Math.max(0, volume - 0.05);
          setVolume(nextValue);
          winampController.setVolume(nextValue);
          break;
        }
        default:
          handled = false;
      }

      if (handled) event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previous, play, pause, stop, next, currentTime, duration, volume]);

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
  const activeSkin = skinAppearance === 'wsz' ? skinVisuals : null;

  useEffect(() => {
    try {
      window.localStorage.setItem('winamp:skin-appearance:v3', skinAppearance);
    } catch {
      // Keep the selected renderer for this session when storage is unavailable.
    }
  }, [skinAppearance]);

  return (
    <div className={`wa-shell ${skinAppearance === 'webamp-classic' ? 'wa-shell--webamp-classic' : ''}`} aria-label="Winamp classic player">
      <input
        ref={skinInputRef}
        type="file"
        accept=".wsz,application/octet-stream,application/zip"
        hidden
        aria-label="Import Winamp skin"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void applySkinFile(file, file.name, true).catch((error) => {
            setSkinStatus(error instanceof Error ? error.message : 'Unable to import Winamp skin');
          });
          event.currentTarget.value = '';
        }}
      />
      <input
        ref={playlistInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.flac,.opus,.webm"
        multiple
        hidden
        aria-label="Add local audio files"
        onChange={(event) => {
          void addLocalAudioFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = '';
        }}
      />
      {/* ============================================================ */}
      {/* 1. MAIN PLAYER WINDOW                                        */}
      {/* ============================================================ */}
      <div className={`wa-window wa-main ${mainShade ? 'wa-window--shaded' : ''}`} style={{ left: windowPositions.main.x, top: windowPositions.main.y, zIndex: activeWindow === 'main' ? 90 : 80 }} onPointerDown={() => setActiveWindow('main')}>
        {/* Title Bar */}
        <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'main')} style={activeSkin ? { backgroundImage: `url("${activeSkin.titlebarUrl}")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '275px 13px' } : undefined}>
          <div className="wa-titlebar__left">
            <span className="wa-titlebar__bolt">⚡</span>
            <span className="wa-titlebar__title">WINAMP</span>
          </div>
          <div className="wa-titlebar__controls">
            <button type="button" className="wa-titlebar__btn" title={detachedWindows.includes('main') ? 'Attach to window group' : 'Detach this window'} aria-label={detachedWindows.includes('main') ? 'Attach Main' : 'Detach Main'} onClick={() => setDetachedWindows((items) => items.includes('main') ? items.filter((item) => item !== 'main') : [...items, 'main'])}>{detachedWindows.includes('main') ? '↗' : '⛓'}</button>
            <button type="button" className="wa-titlebar__btn" title="Minimize to Windowshade" aria-label="Minimize Main to Windowshade" onClick={() => setMainShade(true)}>_</button>
            <button
              type="button"
              className="wa-titlebar__btn"
              title="Toggle Windowshade"
              onClick={() => setMainShade((v) => !v)}
            >
              ▲
            </button>
            <button type="button" className="wa-titlebar__btn wa-titlebar__btn--window-toggle" title="Open Video / Visualization" aria-label="Open Video / Visualization" onClick={() => setVideoWindowVisible(!showVideo)}>VIS</button>
            <button type="button" className="wa-titlebar__btn wa-titlebar__btn--settings" title="Player settings" aria-label="Player settings" aria-expanded={playerSettingsOpen} onClick={() => setPlayerSettingsOpen((open) => !open)}>⚙</button>
            <button type="button" className="wa-titlebar__btn wa-titlebar__btn--close" title="Close Winamp" onClick={onClose}>×</button>
          </div>
        </div>

        {playerSettingsOpen && (
          <div className="wa-player-settings-panel" onPointerDown={(event) => event.stopPropagation()}>
            <div className="wa-player-settings-panel__header">
              <strong>PLAYER SETTINGS</strong>
              <button type="button" onClick={() => setPlayerSettingsOpen(false)} aria-label="Close player settings">×</button>
            </div>
            <label className="wa-player-settings__row">
              <span>Appearance renderer</span>
              <select value={skinAppearance} onChange={(event) => {
                const nextAppearance = event.currentTarget.value as 'dev-alpha' | 'webamp-classic' | 'wsz';
                setSkinAppearance(nextAppearance);
                if (nextAppearance === 'webamp-classic') {
                  setWindowPositions(getClassicWindowPositions());
                }
              }}>
                <option value="dev-alpha">Dev Alpha</option>
                <option value="webamp-classic">Classic Winamp (Webamp Classic)</option>
                <option value="wsz" disabled={!skinVisuals}>Imported .wsz skin{skinVisuals ? ` — ${skinVisuals.name}` : ' (not loaded)'}</option>
              </select>
            </label>
            <p>Appearance only: Dev Alpha, Webamp Classic and imported .wsz skins share the existing player controls and state.</p>
          </div>
        )}

        {!mainShade && (
          <div className="wa-main__body" style={activeSkin ? { backgroundImage: `url("${activeSkin.mainUrl}")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '275px 116px' } : undefined}>
            {/* Top Display Area */}
            <div className="wa-display">
              {/* Left Column: Mode & Segmented Digits */}
              <div className="wa-display__left">
                <div className="wa-indicators">
                  {activeSkin
                    ? <img src={activeSkin.sprites[isPlaying ? 'playIndicator' : currentTime > 0 ? 'pauseIndicator' : 'stopIndicator']} alt="" draggable={false} />
                    : <>
                        <span className={`wa-ind-dot ${isPlaying ? 'is-lit' : ''}`}>▶</span>
                        <span className={`wa-ind-dot ${!isPlaying && currentTime > 0 ? 'is-lit' : ''}`}>❚❚</span>
                      </>}
                </div>
                <button
                  type="button"
                  className="wa-time-lcd"
                  onClick={() => setTimeRemainingMode((v) => !v)}
                  title="Click to toggle elapsed / remaining time"
                >
                  <span className={"wa-time-lcd__digits" + (activeSkin?.sprites.digit0 ? " wa-time-lcd__digits--skin" : "")}>
                    {activeSkin?.sprites.digit0
                      ? Array.from(displayTime).map((character, index) => {
                          if (character === ':') return <span className="wa-time-lcd__colon" key={index}>:</span>;
                          const glyph = character === '-' ? activeSkin.sprites.timeMinus : activeSkin.sprites[`digit${character}`];
                          return glyph
                            ? <img key={index} src={glyph} alt="" draggable={false} />
                            : <span key={index}>{character}</span>;
                        })
                      : displayTime}
                  </span>
                </button>
              </div>

              {/* Click the LED analyzer to cycle its classic display modes. */}
              <button
                type="button"
                className={`wa-visualizer wa-visualizer--mode-${mainVisualizerMode}`}
                onClick={() => setMainVisualizerMode((mode) => ((mode + 1) % 3) as 0 | 1 | 2)}
                aria-label={`Visualizer mode: ${mainVisualizerModeNames[mainVisualizerMode]}. Click to switch mode`}
                title={`${mainVisualizerModeNames[mainVisualizerMode]} — click to change`}
                aria-live="off"
              >
                {mainVisualizerMode === 1 ? (
                  <svg className="wa-visualizer-wave" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={waveform.map((sample, index) => `${(index / 18) * 100},${50 - sample}`).join(' ')} />
                  </svg>
                ) : bars.map((barHeight, idx) => (
                  <div key={idx} className={`wa-vis-col ${mainVisualizerMode === 2 ? 'wa-vis-col--peak' : ''}`}>
                    <div className="wa-vis-bar" style={{ height: `${mainVisualizerMode === 2 ? Math.max(3, peaks[idx]) : barHeight}%` }} />
                    {mainVisualizerMode === 0 && <div className="wa-vis-peak" style={{ bottom: `${peaks[idx]}%` }} />}
                  </div>
                ))}
              </button>

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
              <div
                className={"wa-slider-track wa-slider-track--pos" + (activeSkin ? " wa-slider-track--skinned" : "")}
                style={activeSkin ? ({
                  backgroundImage: `url("${activeSkin.sprites.positionTrack}")`,
                  "--wa-skin-range-thumb": `url("${activeSkin.sprites.positionThumb}")`,
                  "--wa-skin-range-thumb-pressed": `url("${activeSkin.sprites.positionThumbPressed}")`,
                } as CSSProperties) : undefined}
              >
                {!activeSkin && <div className="wa-slider-progress" style={{ width: `${progressPct}%` }} />}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progressPct}
                  onChange={(e) => seek(Number(e.currentTarget.value))}
                  className={"wa-slider-input" + (activeSkin ? " wa-skin-range--position" : "")}
                  aria-label="Seek position"
                />
              </div>

              {/* Volume & Balance sliders */}
              <div className="wa-vol-bal-row">
                <div className="wa-vol-control">
                  <span className="wa-slider-label">VOL</span>
                  <div
                    className={"wa-slider-track wa-slider-track--vol" + (activeSkin ? " wa-slider-track--skinned" : "")}
                    style={activeSkin ? ({
                      backgroundImage: `url("${activeSkin.sprites.volumeTrack}")`,
                      backgroundPosition: "0 -" + (Math.round((1 - volume) * 27) * 15) + "px",
                      "--wa-skin-range-thumb": `url("${activeSkin.sprites.volumeThumb}")`,
                      "--wa-skin-range-thumb-pressed": `url("${activeSkin.sprites.volumeThumbPressed}")`,
                    } as CSSProperties) : undefined}
                  >
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
                      className={"wa-slider-input" + (activeSkin ? " wa-skin-range--volume" : "")}
                      aria-label="Volume"
                    />
                  </div>
                </div>

                <div className="wa-bal-control">
                  <span className="wa-slider-label">BAL</span>
                  <div
                    className={"wa-slider-track wa-slider-track--bal" + (activeSkin ? " wa-slider-track--skinned" : "")}
                    style={activeSkin ? ({
                      backgroundImage: `url("${activeSkin.sprites.balanceTrack}")`,
                      backgroundPosition: "0 -" + (Math.round((1 - ((balance + 1) / 2)) * 27) * 15) + "px",
                      "--wa-skin-range-thumb": `url("${activeSkin.sprites.balanceThumb}")`,
                      "--wa-skin-range-thumb-pressed": `url("${activeSkin.sprites.balanceThumbPressed}")`,
                    } as CSSProperties) : undefined}
                  >
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={balance}
                      onChange={(e) => setBalance(Number(e.currentTarget.value))}
                      className={"wa-slider-input" + (activeSkin ? " wa-skin-range--balance" : "")}
                      aria-label="Balance"
                    />
                  </div>
                </div>

                {/* EQ & PL Toggle Buttons */}
                <div className="wa-toggle-btns">
                  <button
                    type="button"
                    className={`wa-btn-toggle ${showEq ? 'is-active' : ''} ${activeSkin ? 'wa-btn-toggle--skinned' : ''}`}
                    onClick={() => setShowEq((v) => !v)}
                    aria-pressed={showEq}
                    aria-label="Toggle equalizer"
                  >
                    {activeSkin ? <img src={activeSkin.sprites[showEq ? 'equalizerToggleOn' : 'equalizerToggleOff']} alt="" draggable={false} /> : <><span className="wa-led-dot" />EQ</>}
                  </button>
                  <button
                    type="button"
                    className={`wa-btn-toggle ${showPl ? 'is-active' : ''} ${activeSkin ? 'wa-btn-toggle--skinned' : ''}`}
                    onClick={() => setShowPl((v) => !v)}
                    aria-pressed={showPl}
                    aria-label="Toggle playlist"
                  >
                    {activeSkin ? <img src={activeSkin.sprites[showPl ? 'playlistToggleOn' : 'playlistToggleOff']} alt="" draggable={false} /> : <><span className="wa-led-dot" />PL</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Transport Buttons & Mini Album Art */}
            <div className="wa-transport-row">
              <div className="wa-buttons-group">
                <button type="button" className="wa-btn-transport" onClick={previous} title="Previous (Z)" aria-keyshortcuts="Z">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.previous} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.previousPressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--previous" aria-hidden="true">|◀◀</span>}
                </button>
                <button type="button" className="wa-btn-transport" onClick={() => void play()} title="Play (X)" aria-keyshortcuts="X">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.play} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.playPressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--play" aria-hidden="true">▶</span>}
                </button>
                <button type="button" className="wa-btn-transport" onClick={pause} title="Pause (C)" aria-keyshortcuts="C">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.pause} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.pausePressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--pause" aria-hidden="true">Ⅱ</span>}
                </button>
                <button type="button" className="wa-btn-transport" onClick={stop} title="Stop (V)" aria-keyshortcuts="V">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.stop} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.stopPressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--stop" aria-hidden="true">■</span>}
                </button>
                <button type="button" className="wa-btn-transport" onClick={next} title="Next (B)" aria-keyshortcuts="B">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.next} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.nextPressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--next" aria-hidden="true">▶▶|</span>}
                </button>
                <button type="button" className="wa-btn-transport" onClick={() => seek(0)} title="Eject">
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites.eject} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.ejectPressed} alt="" draggable={false} /></> : <span className="wa-transport-glyph wa-transport-glyph--eject" aria-hidden="true">⏏</span>}
                </button>
              </div>

              {/* Shuffle & Repeat */}
              <div className="wa-toggles-group">
                <button
                  type="button"
                  className={`wa-btn-mode ${shuffle ? 'is-active' : ''} ${activeSkin ? 'wa-btn-mode--skinned' : ''}`}
                  aria-pressed={shuffle}
                  onClick={() => {
                    const nextVal = !shuffle;
                    setShuffle(nextVal);
                    winampController.setShuffle(nextVal);
                  }}
                  title="Shuffle (S)" aria-keyshortcuts="S"
                >
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites[shuffle ? 'shuffleActive' : 'shuffle']} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.shufflePressed} alt="" draggable={false} /></> : <><span className="wa-led-dot" /><span className="wa-mode-glyph" aria-hidden="true">⤨</span><span className="wa-mode-label">SHUFFLE</span></>}
                </button>
                <button
                  type="button"
                  className={`wa-btn-mode ${repeat ? 'is-active' : ''} ${activeSkin ? 'wa-btn-mode--skinned' : ''}`}
                  aria-pressed={repeat}
                  onClick={() => {
                    const nextVal = !repeat;
                    setRepeat(nextVal);
                    winampController.setRepeat(nextVal);
                  }}
                  title="Repeat (R)" aria-keyshortcuts="R"
                >
                  {activeSkin ? <><img className="wa-skin-sprite-default" src={activeSkin.sprites[repeat ? 'repeatActive' : 'repeat']} alt="" draggable={false} /><img className="wa-skin-sprite-pressed" src={activeSkin.sprites.repeatPressed} alt="" draggable={false} /></> : <><span className="wa-led-dot" /><span className="wa-mode-glyph" aria-hidden="true">↻</span><span className="wa-mode-label">REPEAT</span></>}
                </button>
                {skinAppearance !== 'webamp-classic' && (<button
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
                </button>)}
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
          <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'equalizer')} style={activeSkin ? { backgroundImage: `url("${activeSkin.sprites.equalizerTitlebarActive}")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '275px 14px', height: 14, minHeight: 14, boxSizing: 'border-box' } : undefined}>
            <span className="wa-titlebar__title">WINAMP EQUALIZER</span>
            <div className="wa-titlebar__controls">
              <button type="button" className="wa-titlebar__btn" title={detachedWindows.includes('equalizer') ? 'Attach to window group' : 'Detach this window'} aria-label={detachedWindows.includes('equalizer') ? 'Attach Equalizer' : 'Detach Equalizer'} onClick={() => setDetachedWindows((items) => items.includes('equalizer') ? items.filter((item) => item !== 'equalizer') : [...items, 'equalizer'])}>{detachedWindows.includes('equalizer') ? '↗' : '⛓'}</button>
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
            <div className="wa-eq__body" style={activeSkin ? { backgroundImage: `url("${activeSkin.sprites.equalizer}")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '275px 116px' } : undefined}>
              {/* EQ Top Options */}
              <div className="wa-eq__header">
                <div className="wa-eq__toggles">
                  <button
                    type="button"
                    className={`wa-btn-mode ${eqOn ? 'is-active' : ''} ${activeSkin ? 'wa-eq-btn--skinned' : ''}`}
                    onClick={() => setEqOn((v) => { const next = !v; winampController.setEqualizerEnabled(next); return next; })}
                  >
                    {activeSkin ? <img src={activeSkin.sprites[eqOn ? 'equalizerOn' : 'equalizerOff']} alt="" draggable={false} /> : <><span className="wa-led-dot" />ON</>}
                  </button>
                  <button
                    type="button"
                    className={`wa-btn-mode ${eqAuto ? 'is-active' : ''} ${activeSkin ? 'wa-eq-btn--skinned' : ''}`}
                    onClick={() => setEqAuto((v) => !v)}
                  >
                    {activeSkin ? <img src={activeSkin.sprites[eqAuto ? 'equalizerAutoOn' : 'equalizerAuto']} alt="" draggable={false} /> : <><span className="wa-led-dot" />AUTO</>}
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
                {skinAppearance === 'webamp-classic' && (
                  <>
                  <details name="wa-classic-menu" className="wa-classic-menu wa-classic-menu--eq" onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.open = false; }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
                    <summary className="wa-btn-presets">PRESETS</summary>
                    <div className="wa-classic-menu__panel wa-classic-menu__panel--eq">
                      <label className="wa-classic-menu__label">CURRENT PRESET
                        <select className="wa-btn-presets" aria-label="Equalizer preset" value={selectedEqPreset} onChange={(event) => {
                          const preset = allEqPresets.find((item) => item.id === event.currentTarget.value);
                          if (preset) applyEqPreset(preset);
                        }}>
                          <option value="custom">CUSTOM</option>
                          <optgroup label="Built-in">{EQ_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</optgroup>
                          {customEqPresets.length > 0 && <optgroup label="My presets">{customEqPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</optgroup>}
                        </select>
                      </label>
                      <input className="wa-btn-presets" aria-label="New equalizer preset name" placeholder="Preset name" maxLength={32} value={newEqPresetName} onChange={(event) => setNewEqPresetName(event.currentTarget.value)} />
                      <div className="wa-classic-menu__actions">
                        <button type="button" className="wa-btn-mode" onClick={saveEqPreset} disabled={!newEqPresetName.trim()}>SAVE</button>
                        <button type="button" className="wa-btn-mode" onClick={deleteEqPreset} disabled={!selectedEqPreset.startsWith('custom-')}>DEL</button>
                        <button type="button" className="wa-btn-mode" onClick={() => eqfInputRef.current?.click()}>EQF IN</button>
                        <button type="button" className="wa-btn-mode" onClick={exportEqfFile}>EQF OUT</button>
                      </div>
                    </div>
                  </details>
                  <button type="button" className="wa-btn-mode wa-eq__q1-export" onClick={exportEqfLibrary} title="Export all equalizer presets as a Q1 library">Q1 OUT</button>
                  </>
                )}
              </div>

              {/* Equalizer preset controls and faders */}
              <div
                className="wa-eq__preset-tools"
                role="group"
                aria-label="Equalizer preset management"
                style={{ display: 'flex', alignItems: 'center', gap: skinAppearance === 'webamp-classic' ? 2 : 4, marginTop: skinAppearance === 'webamp-classic' ? 0 : 4, minWidth: 0, flexWrap: skinAppearance === 'webamp-classic' ? 'nowrap' : 'wrap' }}
              >
                {skinAppearance !== 'webamp-classic' && (
                  <select
                  className="wa-btn-presets"
                  aria-label="Equalizer preset"
                  value={selectedEqPreset}
                  style={{ flex: '0 0 88px', minWidth: 0 }}
                  onChange={(event) => {
                    const preset = allEqPresets.find((item) => item.id === event.currentTarget.value);
                    if (preset) applyEqPreset(preset);
                  }}
                >
                  <option value="custom">CUSTOM</option>
                  <optgroup label="Built-in">
                    {EQ_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                  </optgroup>
                  {customEqPresets.length > 0 && (
                    <optgroup label="My presets">
                      {customEqPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                    </optgroup>
                  )}
                  </select>
                )}
                <input
                  className="wa-btn-presets"
                  aria-label="New equalizer preset name"
                  placeholder="Preset name"
                  maxLength={32}
                  value={newEqPresetName}
                  style={{ flex: '1 1 auto', width: 0, minWidth: 0 }}
                  onChange={(event) => setNewEqPresetName(event.currentTarget.value)}
                />
                <button type="button" className="wa-btn-mode" onClick={saveEqPreset} disabled={!newEqPresetName.trim()} title="Save current equalizer as a preset">SAVE</button>
                <button type="button" className="wa-btn-mode" onClick={deleteEqPreset} disabled={!selectedEqPreset.startsWith('custom-')} title="Delete selected custom preset">DEL</button>
                <input
                  ref={eqfInputRef}
                  type="file"
                  accept=".eqf,.q1,application/octet-stream"
                  aria-label="Import Winamp EQF file"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    void importEqfFile(event.currentTarget.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
                <button type="button" className="wa-btn-mode" onClick={() => eqfInputRef.current?.click()} title="Import Winamp EQF library">EQF IN</button>
                <button type="button" className="wa-btn-mode" onClick={exportEqfFile} title="Export selected equalizer as Winamp EQF">EQF OUT</button>
              </div>
              {eqfStatus && <span className="wa-eq__status" role="status" aria-live="polite">{eqfStatus}</span>}

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
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
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
                          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
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
        <div className={`wa-window wa-playlist ${plShade ? 'wa-window--shaded' : ''}`} style={{ left: windowPositions.playlist.x, top: windowPositions.playlist.y, zIndex: activeWindow === 'playlist' ? 90 : 80, ...(skinAppearance === 'webamp-classic' ? { width: playlistSize.width, height: playlistSize.height } : {}) }} onPointerDown={() => setActiveWindow('playlist')}>
          <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'playlist')}>
            <span className="wa-titlebar__title">WINAMP PLAYLIST</span>
            <div className="wa-titlebar__controls">
              <button type="button" className="wa-titlebar__btn" title={detachedWindows.includes('playlist') ? 'Attach to window group' : 'Detach this window'} aria-label={detachedWindows.includes('playlist') ? 'Attach Playlist' : 'Detach Playlist'} onClick={() => setDetachedWindows((items) => items.includes('playlist') ? items.filter((item) => item !== 'playlist') : [...items, 'playlist'])}>{detachedWindows.includes('playlist') ? '↗' : '⛓'}</button>
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
              <div
                className="wa-pl__list"
                role="listbox"
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes('Files')) {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'copy';
                  }
                }}
                onDrop={(event) => {
                  if (!event.dataTransfer.files.length) return;
                  event.preventDefault();
                  event.stopPropagation();
                  addLocalAudioFiles(Array.from(event.dataTransfer.files));
                }}
              >
                {playlist.map((item, index) => {
                  const isCurrent = index === trackIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isCurrent}
                      className={`wa-pl__item ${isCurrent ? 'is-current is-selected' : ''} ${playlistSelection.includes(index) ? 'is-selected' : ''}`}
                      draggable
                      onDragStart={() => setDraggedPlaylistIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedPlaylistIndex === null) return;
                        winampController.moveTrack(draggedPlaylistIndex, index);
                        setDraggedPlaylistIndex(null);
                        setPlaylistSelection([]);
                      }}
                      onDragEnd={() => setDraggedPlaylistIndex(null)}
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
                      {showPlaylistDurations && <span className="wa-pl__dur">{item.durationLabel}</span>}
                    </div>
                  );
                })}
              </div>

              {skinAppearance === 'webamp-classic' ? (
              <>
              {/* Playlist Bottom Bar */}
              {(m3uStatus || localLibraryStatus || skinStatus) && (
                <div className="wa-pl__import-status" role="status" aria-live="polite">
                  {m3uStatus || localLibraryStatus || skinStatus}
                </div>
              )}
              <div className="wa-pl__footer wa-pl__footer--classic">
                <input ref={m3uInputRef} type="file" accept=".m3u,.m3u8,audio/x-mpegurl,audio/mpegurl" hidden onChange={(event) => { void importM3uFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
                <div className="wa-pl__actions">
                  <button type="button" className="wa-btn-pl" onClick={() => playlistInputRef.current?.click()} title="Add local audio (L)" aria-keyshortcuts="L">ADD</button>
                  <button type="button" className="wa-btn-pl" disabled={!playlistSelection.length || playlist.length <= playlistSelection.length} onClick={() => {
                    const removedIds = playlistSelection.map((index) => playlist[index]?.id).filter((id): id is string => Boolean(id));
                    winampController.removeTracks(playlistSelection);
                    void deleteWinampLocalAudioFiles(removedIds).catch((error) => setLocalLibraryStatus(error instanceof Error ? error.message : 'Unable to remove saved local audio'));
                    setPlaylistSelection([]);
                  }}>REM</button>
                  <button type="button" className="wa-btn-pl" onClick={() => setPlaylistSelection(playlist.map((_, index) => index))}>SEL</button>
                  <details name="wa-classic-menu" className="wa-classic-menu wa-classic-menu--pl" onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.open = false; }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
                    <summary className="wa-btn-pl">MISC</summary>
                    <div className="wa-classic-menu__panel wa-classic-menu__panel--pl">
                      <button type="button" className="wa-btn-pl" onClick={() => setPlaylistSelection([])}>Clear selection</button>
                      <button type="button" className="wa-btn-pl" onClick={() => setPlayerSettingsOpen(true)}>Player settings…</button>
                      <button type="button" className="wa-btn-pl" onClick={() => m3uInputRef.current?.click()}>Import M3U</button>
                      <button type="button" className="wa-btn-pl" onClick={exportM3uFile}>Export M3U</button>
                      <button type="button" className="wa-btn-pl" onClick={() => skinInputRef.current?.click()}>Import .wsz skin</button>
                      {skinVisuals && <button type="button" className="wa-btn-pl" onClick={() => { void clearActiveWinampSkin().then(() => { setSkinVisuals(null); setSkinStatus('Built-in Winamp appearance restored'); }).catch(() => { setSkinVisuals(null); setSkinStatus('Built-in appearance restored for this session; saved skin could not be cleared'); }); }}>Reset skin</button>}
                    </div>
                  </details>
                  <details name="wa-classic-menu" className="wa-classic-menu wa-classic-menu--list" onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.open = false; }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
                    <summary className="wa-btn-pl wa-btn-pl--opts">LIST OPT</summary>
                    <div className="wa-classic-menu__panel wa-classic-menu__panel--list">
                      <div className="wa-classic-menu__info">PLAYLIST OPTIONS</div>
                      <button type="button" className="wa-btn-pl" aria-pressed={showPlaylistDurations} onClick={() => setShowPlaylistDurations((value) => !value)}>Track durations: {showPlaylistDurations ? 'ON' : 'OFF'}</button>
                      <button type="button" className="wa-btn-pl" aria-pressed={followPlaylistPlayback} onClick={() => setFollowPlaylistPlayback((value) => !value)}>Playback follow: {followPlaylistPlayback ? 'ON' : 'OFF'}</button>
                    </div>
                  </details>
                </div>
                <div className="wa-pl__status">
                  <span>{formatTime(currentTime)} / {formatTime(totalPlaylistSeconds)}</span>
                  {(m3uStatus || localLibraryStatus || skinStatus) && <span className="wa-pl__status-text" role="status" aria-live="polite" title={m3uStatus || localLibraryStatus || skinStatus}>•</span>}
                </div>
              </div>
              </>
              ) : (
              <>
              {/* Legacy footer retained for Dev Alpha and imported skins. */}
              {(m3uStatus || localLibraryStatus) && (
                <div className="wa-pl__import-status" role="status" aria-live="polite">
                  {m3uStatus || localLibraryStatus}
                </div>
              )}
              <div className="wa-pl__footer">
                <div className="wa-pl__actions">
                  <button type="button" className="wa-btn-pl" onClick={() => playlistInputRef.current?.click()} title="Add local audio (L)" aria-keyshortcuts="L">+ ADD</button>
                  <button
                    type="button"
                    className="wa-btn-pl"
                    disabled={!playlistSelection.length || playlist.length <= playlistSelection.length}
                    onClick={() => {
                      const removedIds = playlistSelection.map((index) => playlist[index]?.id).filter((id): id is string => Boolean(id));
                      winampController.removeTracks(playlistSelection);
                      void deleteWinampLocalAudioFiles(removedIds).catch((error) => {
                        setLocalLibraryStatus(error instanceof Error ? error.message : 'Unable to remove saved local audio');
                      });
                      setPlaylistSelection([]);
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
                  >CLR SEL</button>
                </div>

                <div className="wa-pl__footer-tools">
                  <input
                    ref={m3uInputRef}
                    type="file"
                    accept=".m3u,.m3u8,audio/x-mpegurl,audio/mpegurl"
                    hidden
                    onChange={(event) => {
                      void importM3uFile(event.currentTarget.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                  <div className="wa-pl__actions">
                    <button type="button" className="wa-btn-pl" onClick={() => m3uInputRef.current?.click()} title="Import an M3U playlist">M3U IN</button>
                    <button type="button" className="wa-btn-pl" onClick={exportM3uFile} title="Export web-address tracks as an M3U playlist">M3U OUT</button>
                    <button type="button" className="wa-btn-pl" onClick={() => skinInputRef.current?.click()} title="Import a classic Winamp .wsz skin">SKIN IN</button>
                    {skinVisuals && <button type="button" className="wa-btn-pl" onClick={() => {
                      void clearActiveWinampSkin().then(() => {
                        setSkinVisuals(null);
                        setSkinStatus('Built-in Winamp appearance restored');
                      }).catch((error) => {
                        setSkinVisuals(null);
                        setSkinStatus(`Built-in appearance restored for this session; saved skin could not be cleared: ${error instanceof Error ? error.message : 'storage unavailable'}`);
                      });
                    }} title="Remove the imported skin">RESET</button>}
                    <button type="button" className="wa-btn-pl wa-btn-pl--opts" title="Playlist options">
                      LIST OPT
                    </button>
                  </div>
                  <div className="wa-pl__status">
                    {skinStatus && <span className="wa-pl__status-text" role="status" aria-live="polite">{skinStatus}</span>}
                    <span className="wa-pl__status-text">
                      {formatTime(currentTime)} / {formatTime(totalPlaylistSeconds)}
                    </span>
                  </div>


                </div>
              </div>
              </>
              )}
            </div>
          )}
          {skinAppearance === 'webamp-classic' && !plShade && (
            <div
              className="wa-playlist__resize-handle"
              role="separator"
              aria-label="Resize Playlist window"
              title="Drag to resize Playlist width and height"
              onPointerDown={startPlaylistResize}
            />
          )}
        </div>
      )}

      {/* 4. VIDEO / VISUALIZATION WINDOW */}
      {showVideo && <div
        className={`wa-window wa-video ${videoMode === 'video' ? 'wa-video--video' : 'wa-video--visualizer'} ${videoShade ? 'wa-window--shaded' : ''}`}
        style={{ left: windowPositions.video.x, top: windowPositions.video.y, zIndex: activeWindow === 'video' ? 90 : 80 }}
        onPointerDown={() => setActiveWindow('video')}
      >
        <div className="wa-titlebar" onPointerDown={(event) => startWindowDrag(event, 'video')}>
          <span className="wa-titlebar__title">WINAMP {videoMode === 'video' ? 'VIDEO' : 'VISUALIZATION'}</span>
          <div className="wa-titlebar__controls">
            <button type="button" className="wa-titlebar__btn" title={detachedWindows.includes('video') ? 'Attach to window group' : 'Detach this window'} aria-label={detachedWindows.includes('video') ? 'Attach window' : 'Detach window'} onClick={() => setDetachedWindows((items) => items.includes('video') ? items.filter((item) => item !== 'video') : [...items, 'video'])}>{detachedWindows.includes('video') ? '↗' : '⛓'}</button>
            <button type="button" className="wa-titlebar__btn" title="Toggle Windowshade" onClick={() => setVideoShade((value) => !value)}>▲</button>
            <button type="button" className="wa-titlebar__btn wa-titlebar__btn--close" title="Close video / visualization" onClick={() => setVideoWindowVisible(false)}>×</button>
          </div>
        </div>
        {!videoShade && <>
        <div className="wa-video__toolbar">
          <button type="button" className={videoMode === 'visualizer' ? 'is-active' : ''} onClick={() => setVideoMode('visualizer')}>VISUALIZATION</button>
          <button type="button" className={videoMode === 'video' ? 'is-active' : ''} onClick={() => setVideoMode('video')}>VIDEO</button>
          {videoMode === 'visualizer' && <select className="wa-video__mode-select" aria-label="Visualization family and mode" value={fourthVisualizerMode} onChange={(event) => setFourthVisualizerMode(event.target.value as FourthVisualizerMode)}>
            {fourthVisualizerGroups.map((group) => <optgroup key={group.label} label={group.label}>
              {group.modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </optgroup>)}
          </select>}
          {videoMode === 'visualizer' && fourthVisualizerPresets[fourthVisualizerMode] && <button type="button" className="wa-video__preset" title="Next named preset" onClick={() => setFourthVisualizerPresetIndex((index) => (index + 1) % fourthVisualizerPresets[fourthVisualizerMode]!.length)}>PSET</button>}
          {videoMode === 'visualizer' && <button type="button" className="wa-video__random" title="Random mode in current family" onClick={() => {
            const group = fourthVisualizerGroups.find((item) => (item.modes as readonly string[]).includes(fourthVisualizerMode));
            const groupModes = group?.modes as readonly FourthVisualizerMode[] | undefined;
            const choices = groupModes && groupModes.length > 1
              ? groupModes.filter((mode) => mode !== fourthVisualizerMode)
              : fourthVisualizerModes.filter((mode) => mode !== fourthVisualizerMode);
            if (choices.length) setFourthVisualizerMode(choices[Math.floor(Math.random() * choices.length)]);
          }}>RND</button>}
          {videoMode === 'visualizer' && <button type="button" className={`wa-video__auto${visualizerAutoCycle ? ' is-active' : ''}`} aria-pressed={visualizerAutoCycle} title={visualizerAutoCycle ? 'Turn automatic mode cycling off' : 'Automatically change mode every 15 seconds'} onClick={() => setVisualizerAutoCycle((value) => !value)}>AUTO</button>}
          <span className="wa-video__filename">{videoFileName || 'No video loaded'}</span>
        </div>
        {videoMode === 'visualizer' ? (
          <div className={`wa-video__visualizer wa-video__visualizer--${fourthVisualizerMode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} role="img" aria-label={fourthVisualizerMode}>
            <div className="wa-video__visualizer-label">{fourthVisualizerMode.toUpperCase()}{fourthVisualizerPresets[fourthVisualizerMode] ? ' · ' + fourthVisualizerPresets[fourthVisualizerMode]![fourthVisualizerPresetIndex % fourthVisualizerPresets[fourthVisualizerMode]!.length].toUpperCase() : ''}</div>
            {renderFourthVisualizer(fourthVisualizerMode, bars, peaks, waveform, fourthVisualizerPresetIndex)}
            <button type="button" className="wa-video__mode" title={`Next visualization: ${fourthVisualizerModes[(fourthVisualizerModes.indexOf(fourthVisualizerMode) + 1) % fourthVisualizerModes.length]}`} onClick={() => setFourthVisualizerMode((mode) => fourthVisualizerModes[(fourthVisualizerModes.indexOf(mode) + 1) % fourthVisualizerModes.length])}>MODE</button>
          </div>
        ) : (
          <div className="wa-video__screen">
            <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                const nextUrl = URL.createObjectURL(file);
                if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
                videoUrlRef.current = nextUrl;
                setVideoUrl(nextUrl);
                setVideoFileName(file.name);
              }
              event.currentTarget.value = '';
            }} />
            {videoUrl ? <video src={videoUrl} controls playsInline /> : <div className="wa-video__empty">OPEN A VIDEO FILE</div>}
            <button type="button" className="wa-video__open" onClick={() => videoInputRef.current?.click()}>OPEN VIDEO</button>
          </div>
        )}
        </>}
      </div>}
    </div>
  );
}
