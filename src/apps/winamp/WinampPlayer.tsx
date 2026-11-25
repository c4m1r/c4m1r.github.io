import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { PROJECT_PLAYLIST, MediaTrack } from '../mediaplayer/playlist';
import { winampController, type WinampEqualizerPreset } from '../../system/audio/winampController';
import { createWinampEqf, parseWinampEqf } from '../../system/audio/winampEqf';
import { createM3uPlaylist, parseM3uPlaylist } from '../../system/audio/winampM3u';
import { extractWinampSkinSprites } from '../../system/audio/winampSkinAtlas';
import { parseWinampSkinArchive } from '../../system/audio/winampSkin';
import { readEmbeddedAudioMetadata } from '../../system/audio/winampMetadata';
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
  const safeBars = Array.from({ length: 19 }, (_, index) => Math.max(0, Math.min(100, bars[index] ?? 0)));
  const averageLevel = safeBars.reduce((sum, value) => sum + value, 0) / safeBars.length;
  const alchemyLayers = [0, 1, 2].map((layer) => {
    const points = safeBars.map((_, index) => {
      const angle = (index / safeBars.length) * Math.PI * 2 - Math.PI / 2 + layer * 0.11;
      const sample = safeBars[(index + layer * 3) % safeBars.length];
      const radius = 13 + sample * (0.25 + layer * 0.035) + Math.sin(index * 1.7 + layer) * 4;
      return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const;
    });
    return points.map(([x, y], index) => {
      const next = points[(index + 1) % points.length];
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} L${next[0].toFixed(2)},${next[1].toFixed(2)}`;
    }).join(' ') + ' Z';
  });
  const plenopticDepths = [0, 1, 2, 3, 4, 5].map((depth) => {
    const scale = 1 - depth * 0.145;
    const pulse = safeBars[(depth * 3) % safeBars.length] * 0.055;
    return { scale: Math.max(0.2, scale - pulse * 0.012), rotation: depth * 7 + averageLevel * 0.08, opacity: 0.9 - depth * 0.11 };
  });
  if (mode === 'Oscilloscope') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="wa-viz-grid" d="M0 25H100 M0 50H100 M0 75H100 M25 0V100 M50 0V100 M75 0V100" /><polyline className="wa-viz-wave" points={wavePoints} /></svg>;
  if (mode === 'Spectrum' || mode === 'Peak meter') return <div className={`wa-video__bars ${mode === 'Peak meter' ? 'wa-video__bars--peaks' : ''}`}>{bars.map((value, index) => <span key={index} style={{height:`${Math.max(2, mode === 'Peak meter' ? peaks[index] : value)}%`}} />)}</div>;
  if (mode === 'Bars and Waves') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="wa-viz-wave" d={bars.map((v,i)=>`M${(i/bars.length)*100} 50v${-Math.max(3,v*.42)} M${(i/bars.length)*100} 50v${Math.max(3,v*.42)}`).join(' ')} /><polyline className="wa-viz-wave wa-viz-wave--secondary" points={wavePoints} /></svg>;
  if (mode === 'Battery') return <div className="wa-viz-battery">{bars.slice(0,12).map((v,i)=><span key={i} className={v>45?'is-charged':''} style={{height:`${Math.max(8,v)}%`}} />)}</div>;
  if (mode === 'Ambience') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id="wa-ambience-a"><stop stopColor="#c5ffe2" stopOpacity=".92"/><stop offset=".42" stopColor="#48d9c0" stopOpacity=".34"/><stop offset="1" stopColor="#1b62a5" stopOpacity="0"/></radialGradient>
      <radialGradient id="wa-ambience-b"><stop stopColor="#b0c8ff" stopOpacity=".78"/><stop offset=".48" stopColor="#7864dc" stopOpacity=".3"/><stop offset="1" stopColor="#34216e" stopOpacity="0"/></radialGradient>
      <radialGradient id="wa-ambience-c"><stop stopColor="#fff0b0" stopOpacity=".6"/><stop offset="1" stopColor="#ff8c48" stopOpacity="0"/></radialGradient>
    </defs>
    <g className="wa-ambience-fields">
      <ellipse cx={34 + safeBars[2] * .12} cy={39 + safeBars[7] * .1} rx={25 + safeBars[1] * .22} ry={19 + safeBars[5] * .16} fill="url(#wa-ambience-a)" />
      <ellipse cx={67 - safeBars[12] * .1} cy={57 - safeBars[15] * .08} rx={24 + safeBars[10] * .2} ry={21 + safeBars[14] * .15} fill="url(#wa-ambience-b)" />
      <ellipse cx="50" cy={28 + averageLevel * .12} rx={17 + averageLevel * .12} ry="13" fill="url(#wa-ambience-c)" />
    </g>
    <path d={waveform.map((v,i)=>{const x=5+i/Math.max(1,waveform.length-1)*90;const y=50+(v-50)*.48;return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')} fill="none" stroke="#d2fff2" strokeWidth="1.1" opacity=".72" />
    <polyline className="wa-viz-wave wa-viz-wave--soft" points={wavePoints} />
  </svg>;
  if (mode === 'Particle') return <svg className="wa-viz-particles" viewBox="0 0 100 100" aria-hidden="true">
    <g className="wa-particle-orbits">
      {[0,1,2].map((ring)=><ellipse key={ring} cx="50" cy="50" rx={18+ring*11+averageLevel*.08} ry={7+ring*5+averageLevel*.045} transform={`rotate(${ring*57+averageLevel*.12} 50 50)`} fill="none" stroke={`hsl(${190+ring*34} 90% 68%)`} strokeWidth=".35" opacity=".32" />)}
    </g>
    {safeBars.map((v,i)=>{
      const angle=(i/safeBars.length)*Math.PI*2;
      const orbit=18+(i%3)*10+v*.12;
      const x=50+Math.cos(angle)*orbit;
      const y=50+Math.sin(angle)*orbit;
      const drift=(waveform[i%waveform.length]-50)*.12;
      return <g key={i}>
        <line x1="50" y1="50" x2={x} y2={y} stroke={`hsl(${hue(i)} 90% 65%)`} strokeWidth=".28" opacity=".28" />
        <circle cx={x+drift} cy={y-drift*.7} r={.7+v/24} fill={`hsl(${hue(i)} 95% 68%)`} opacity=".9" />
        <circle cx={x-drift*.5} cy={y+drift} r=".65" fill="#eaffff" opacity=".65" />
      </g>;
    })}
    <circle cx="50" cy="50" r={2+averageLevel*.035} fill="#eaffff" opacity=".8" />
  </svg>;
  if (mode === 'Plenoptic') return <svg className="wa-viz-plenoptic" viewBox="0 0 100 100" aria-hidden="true">
    <defs><radialGradient id="wa-plenoptic-glow"><stop stopColor="#b9faff" stopOpacity=".9" /><stop offset=".28" stopColor="#438bff" stopOpacity=".28" /><stop offset="1" stopColor="#06101f" stopOpacity="0" /></radialGradient></defs>
    <circle cx="50" cy="50" r="47" fill="url(#wa-plenoptic-glow)" />
    <g className="wa-plenoptic-tunnel">{plenopticDepths.map((depth, index) => <g key={index} transform={`rotate(${depth.rotation} 50 50) translate(${50 * (1-depth.scale)} ${50 * (1-depth.scale)}) scale(${depth.scale}) translate(-50 -50)`} opacity={depth.opacity}>
      <polygon points="50,4 96,50 50,96 4,50" fill={index % 2 ? 'rgba(53,206,255,.035)' : 'rgba(186,95,255,.045)'} stroke={`hsl(${190 + index * 23} 95% 68%)`} strokeWidth=".9" />
      <path d="M50 4L50 96 M4 50H96 M17 17L83 83 M83 17L17 83" stroke={`hsl(${190 + index * 23} 90% 65%)`} strokeWidth=".35" opacity=".55" />
    </g>)}</g>
    {safeBars.map((value, index) => { const angle = index / safeBars.length * Math.PI * 2; const radius = 12 + value * .22; return <line key={index} x1="50" y1="50" x2={50 + Math.cos(angle) * radius} y2={50 + Math.sin(angle) * radius} stroke={`hsl(${185 + index * 8} 100% 72%)`} strokeWidth=".8" opacity=".8" />; })}
    <circle cx="50" cy="50" r={3 + averageLevel * .035} fill="#e8ffff" className="wa-plenoptic-core" />
    <polyline className="wa-viz-wave wa-viz-wave--secondary" points={wavePoints} />
  </svg>;
  if (mode === 'Spikes') return <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={radialPoints} fill="rgba(255,170,40,.18)" stroke="#ffb52e" strokeWidth="1.2" /><circle cx="50" cy="50" r="10" fill="#ff6b25" opacity=".55" /></svg>;
  if (mode === 'Musical Colors') return <div className="wa-viz-colors">{bars.map((v,i)=><span key={i} style={{height:`${Math.max(3,v)}%`,background:`hsl(${hue(i)} 95% 55%)`}} />)}</div>;
  if (mode === 'Alchemy') return <svg className="wa-viz-alchemy" viewBox="0 0 100 100" aria-hidden="true">
    <defs><radialGradient id="wa-alchemy-core"><stop stopColor="#fff" /><stop offset=".18" stopColor="#8ffaff" stopOpacity=".9" /><stop offset="1" stopColor="#0878c9" stopOpacity="0" /></radialGradient><linearGradient id="wa-alchemy-ribbon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#44f5ff" /><stop offset=".5" stopColor="#a65cff" /><stop offset="1" stopColor="#ff5bc8" /></linearGradient></defs>
    <g className="wa-alchemy-orbits">{[0,1,2].map((ring) => <ellipse key={ring} cx="50" cy="50" rx={18 + ring * 8 + averageLevel * .12} ry={8 + ring * 4 + averageLevel * .07} transform={`rotate(${ring * 58 + averageLevel * .12} 50 50)`} fill="none" stroke={ring === 1 ? '#ff70d8' : '#4deeff'} strokeWidth=".65" opacity={.48 - ring * .08} />)}</g>
    {alchemyLayers.map((path, index) => <path key={index} d={path} fill={index === 1 ? 'rgba(255,83,205,.075)' : 'rgba(35,218,255,.055)'} stroke={index === 1 ? '#ff66d5' : 'url(#wa-alchemy-ribbon)'} strokeWidth={index === 0 ? 1.5 : .85} opacity={.95 - index * .18} />)}
    <path d={waveform.map((value,index)=>{const x=8+index/Math.max(1,waveform.length-1)*84;const y=50+(value-50)*.34;return `${index?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')} fill="none" stroke="#e6ffff" strokeWidth=".9" opacity=".75" />
    <circle cx="50" cy="50" r={8 + averageLevel * .11} fill="url(#wa-alchemy-core)" opacity=".9" />
    {safeBars.map((value,index)=>{const angle=index/safeBars.length*Math.PI*2;const inner=10;const outer=inner+value*.18;return <line key={index} x1={50+Math.cos(angle)*inner} y1={50+Math.sin(angle)*inner} x2={50+Math.cos(angle)*outer} y2={50+Math.sin(angle)*outer} stroke={`hsl(${180+index*9} 100% 72%)`} strokeWidth=".75" opacity=".85" />;})}
  </svg>;
  if (mode === 'AVS') {
    const radialWave = waveform.map((v,i)=>{
      const angle=(i/Math.max(1,waveform.length))*Math.PI*2;
      const radius=13+v*.34;
      return `${50+Math.cos(angle)*radius},${50+Math.sin(angle)*radius}`;
    }).join(' ');
    const mirroredWave = waveform.map((v,i)=>{
      const angle=(i/Math.max(1,waveform.length))*Math.PI*2;
      const radius=10+v*.28;
      return `${50+Math.cos(-angle)*radius},${50+Math.sin(-angle)*radius}`;
    }).join(' ');
    return <svg className={`wa-viz-preset wa-viz-preset--${presetIndex % 4}`} viewBox="0 0 100 100" aria-hidden="true">
      {presetIndex % 4 === 0 && <g><circle cx="50" cy="50" r="34" fill="none" stroke="#285b86" strokeWidth=".5" strokeDasharray="2 2"/><polyline className="wa-viz-wave" points={radialWave}/><polyline className="wa-viz-wave wa-viz-wave--secondary" points={mirroredWave}/></g>}
      {presetIndex % 4 === 1 && <g>{[0,1,2,3,4].map((ring)=><circle key={ring} cx="50" cy="50" r={8+ring*8+averageLevel*.08} fill="none" stroke={`hsl(${190+ring*29} 95% 65%)`} strokeWidth={1.2-ring*.12} opacity={.75-ring*.1}/>)}<polyline className="wa-viz-wave" points={radialWave}/></g>}
      {presetIndex % 4 === 2 && <g>{[0,1,2,3].map((shape)=><polygon key={shape} points={safeBars.map((v,i)=>{const a=i/safeBars.length*Math.PI*2+shape*Math.PI/8;const r=12+v*(.2+shape*.025);return `${50+Math.cos(a)*r},${50+Math.sin(a)*r}`;}).join(' ')} fill="none" stroke={`hsl(${185+shape*48} 100% 68%)`} strokeWidth=".8" opacity={.85-shape*.13}/> )}</g>}
      {presetIndex % 4 === 3 && <g>{[0,1,2,3,4,5,6,7].map((facet)=><path key={facet} d={`M50 50 L${50+Math.cos(facet*Math.PI/4)*(18+averageLevel*.16)} ${50+Math.sin(facet*Math.PI/4)*(18+averageLevel*.16)} L${50+Math.cos((facet+1)*Math.PI/4)*(18+averageLevel*.16)} ${50+Math.sin((facet+1)*Math.PI/4)*(18+averageLevel*.16)} Z`} fill={`hsl(${facet*45+190} 90% 55% / .12)`} stroke={`hsl(${facet*45+190} 95% 68%)`} strokeWidth=".6"/>)}<polyline className="wa-viz-wave wa-viz-wave--secondary" points={radialWave}/></g>}
    </svg>;
  }
  return <svg className={`wa-viz-preset wa-viz-preset--${presetIndex % 4}`} viewBox="0 0 100 100" aria-hidden="true">
    <defs><radialGradient id="wa-milkdrop"><stop stopColor="#fff" /><stop offset=".35" stopColor="#4be8ff" /><stop offset="1" stopColor="#18216c" stopOpacity="0" /></radialGradient></defs>
    {presetIndex % 4 === 0 && <g><circle className="wa-milkdrop-pulse" cx="50" cy="50" r={15+averageLevel*.3} fill="url(#wa-milkdrop)" opacity=".8"/><polyline className="wa-viz-wave" points={radialPoints}/><polyline className="wa-viz-wave wa-viz-wave--secondary" points={wavePoints}/></g>}
    {presetIndex % 4 === 1 && <g>{[0,1,2,3,4].map((flame)=><path key={flame} d={waveform.map((v,i)=>{const x=8+i/Math.max(1,waveform.length-1)*84;const y=50+(v-50)*(.22+flame*.055)+Math.sin(i*.18+flame)*((safeBars[flame*3]||0)*.08+2);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')} fill="none" stroke={`hsl(${flame*47+175} 100% 68%)`} strokeWidth={1.5-flame*.18} opacity={.85-flame*.1}/>)}</g>}
    {presetIndex % 4 === 2 && <g>{[0,1,2,3,4,5].map((depth)=><polygon key={depth} points={safeBars.map((v,i)=>{const a=i/safeBars.length*Math.PI*2;const r=(12+v*.22)*(1-depth*.105);return `${50+Math.cos(a+depth*.08)*r},${50+Math.sin(a+depth*.08)*r}`;}).join(' ')} fill="none" stroke={`hsl(${185+depth*26} 95% 68%)`} strokeWidth=".8" opacity={.9-depth*.12}/>)}<circle className="wa-milkdrop-pulse" cx="50" cy="50" r={5+averageLevel*.08} fill="url(#wa-milkdrop)"/></g>}
    {presetIndex % 4 === 3 && <g><polygon points={radialPoints} fill="rgba(255,70,210,.08)" stroke="#ff69d4" strokeWidth="1.1"/>{[0,1,2,3].map((echo)=><polyline key={echo} points={waveform.map((v,i)=>{const x=50+(i/Math.max(1,waveform.length-1)-.5)*(72-echo*10);const y=50+(v-50)*(.28+echo*.045);return `${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')} fill="none" stroke={`hsl(${185+echo*39} 100% 68%)`} strokeWidth=".85" opacity={.8-echo*.14}/>)}</g>}
  </svg>;
}

interface WinampPlayerProps { onClose?: () => void; }


type WinampVisualizerFrame = { bars: number[]; peaks: number[]; waveform: number[] };
const EMPTY_VISUALIZER_FRAME: WinampVisualizerFrame = {
  bars: Array(19).fill(2),
  peaks: Array(19).fill(2),
  waveform: Array(19).fill(50),
};
let visualizerFrame = EMPTY_VISUALIZER_FRAME;
const visualizerFrameSubscribers = new Set<() => void>();
let visualizerFrameRaf: number | null = null;
let visualizerFrameLastAt = 0;
let visualizerAudioContext: AudioContext | null = null;
let visualizerAnalyser: AnalyserNode | null = null;
let unsubscribeVisualizerController: (() => void) | null = null;

function refreshWinampVisualizerAudioGraph(): void {
  const graph = winampController.getWebAudio();
  visualizerAudioContext = graph.ctx;
  visualizerAnalyser = graph.analyser;
}

function getWinampVisualizerFrame(): WinampVisualizerFrame {
  return visualizerFrame;
}

function subscribeWinampVisualizerFrame(listener: () => void): () => void {
  visualizerFrameSubscribers.add(listener);
  if (visualizerFrameRaf === null && typeof window !== 'undefined') {
    unsubscribeVisualizerController = winampController.subscribe((state) => {
      if (state.isPlaying) refreshWinampVisualizerAudioGraph();
    });
    const frequencyData = new Uint8Array(32);
    const timeData = new Uint8Array(64);
    const tick = (timestamp: number) => {
      if (!visualizerFrameSubscribers.size) {
        visualizerFrameRaf = null;
        return;
      }
      if (timestamp - visualizerFrameLastAt >= 1000 / 60) {
        visualizerFrameLastAt = timestamp;
        const ctx = visualizerAudioContext;
        const analyser = visualizerAnalyser;
        const isPlayingNow = winampController.getState().isPlaying;
        let bars: number[];
        let waveform: number[];
        if (isPlayingNow && analyser && ctx?.state === 'running') {
          analyser.getByteFrequencyData(frequencyData);
          analyser.getByteTimeDomainData(timeData);
          bars = Array.from(frequencyData.subarray(0, 19), (value) => Math.min(100, Math.max(4, Math.round((value / 255) * 100))));
          waveform = Array.from({ length: 19 }, (_, index) => {
            const sample = timeData[Math.round(index * (timeData.length - 1) / 18)] ?? 128;
            return 50 + (sample - 128) / 2.56;
          });
        } else {
          bars = visualizerFrame.bars.map((bar) => Math.max(2, bar * 0.85));
          waveform = Array(19).fill(50);
        }
        const peaks = bars.map((bar, index) => Math.max(bar, (visualizerFrame.peaks[index] ?? 0) - 1.5));
        visualizerFrame = { bars, peaks, waveform };
        visualizerFrameSubscribers.forEach((subscriber) => subscriber());
      }
      visualizerFrameRaf = requestAnimationFrame(tick);
    };
    visualizerFrameRaf = requestAnimationFrame(tick);
  }
  return () => {
    visualizerFrameSubscribers.delete(listener);
    if (!visualizerFrameSubscribers.size && visualizerFrameRaf !== null) {
      cancelAnimationFrame(visualizerFrameRaf);
      visualizerFrameRaf = null;
      visualizerFrameLastAt = 0;
      visualizerFrame = EMPTY_VISUALIZER_FRAME;
      unsubscribeVisualizerController?.();
      unsubscribeVisualizerController = null;
      visualizerAudioContext = null;
      visualizerAnalyser = null;
    }
  };
}

function WinampMainVisualizer({
  mode,
  modeName,
  visualizerColors,
  onCycle,
}: {
  mode: 0 | 1 | 2;
  modeName: string;
  visualizerColors?: string[];
  onCycle: () => void;
}) {
  const { bars, peaks, waveform } = useSyncExternalStore(subscribeWinampVisualizerFrame, getWinampVisualizerFrame, getWinampVisualizerFrame);
  const style = visualizerColors ? ({
    '--wa-skin-viz-low': visualizerColors[2] ?? '#ef3110',
    '--wa-skin-viz-mid': visualizerColors[10] ?? '#bdde29',
    '--wa-skin-viz-high': visualizerColors[17] ?? '#189408',
    '--wa-skin-viz-peak': visualizerColors[18] ?? '#ffffff',
  } as CSSProperties) : undefined;
  return (
    <button
      type="button"
      className={`wa-visualizer wa-visualizer--mode-${mode}${visualizerColors ? ' wa-visualizer--skin' : ''}`}
      style={style}
      onClick={onCycle}
      aria-label={`Visualizer mode: ${modeName}. Click to switch mode`}
      title={`${modeName} — click to change`}
      aria-live="off"
    >
      {mode === 1 ? (
        <svg className="wa-visualizer-wave" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={waveform.map((sample, index) => `${(index / 18) * 100},${50 - sample}`).join(' ')} />
        </svg>
      ) : bars.map((barHeight, index) => (
        <div key={index} className={`wa-vis-col ${mode === 2 ? 'wa-vis-col--peak' : ''}`}>
          <div className="wa-vis-bar" style={{ height: `${mode === 2 ? Math.max(3, peaks[index]) : barHeight}%` }} />
          {mode === 0 && <div className="wa-vis-peak" style={{ bottom: `${peaks[index]}%` }} />}
        </div>
      ))}
    </button>
  );
}

function WinampFourthVisualizer({
  mode,
  presetIndex,
  onCycle,
}: {
  mode: FourthVisualizerMode;
  presetIndex: number;
  onCycle: () => void;
}) {
  const { bars, peaks, waveform } = useSyncExternalStore(subscribeWinampVisualizerFrame, getWinampVisualizerFrame, getWinampVisualizerFrame);
  const presets = fourthVisualizerPresets[mode];
  return (
    <div className={`wa-video__visualizer wa-video__visualizer--${mode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} role="img" aria-label={mode}>
      <div className="wa-video__visualizer-label">{mode.toUpperCase()}{presets ? ' · ' + presets[presetIndex % presets.length].toUpperCase() : ''}</div>
      {renderFourthVisualizer(mode, bars, peaks, waveform, presetIndex)}
      <button type="button" className="wa-video__mode" title="Next visualization mode" onClick={onCycle}>MODE</button>
    </div>
  );
}

export function WinampPlayer({ onClose }: WinampPlayerProps) {

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
  const [skinVisuals, setSkinVisuals] = useState<{
    name: string;
    mainUrl: string;
    titlebarUrl: string;
    sprites: Record<string, string>;
    playlistStyle: { normal: string; current: string; normalbg: string; selectedbg: string; mbfg: string; mbbg: string; font: string };
    visualizerColors: string[];
  } | null>(null);
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
    const nextVisuals = {
      name: fileName,
      mainUrl: sprites.main,
      titlebarUrl: sprites.titlebarActive ?? sprites.main,
      sprites,
      playlistStyle: archive.playlistStyle,
      visualizerColors: archive.visualizerColors,
    };
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
      setDuration(st.duration);
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

  const exportHtmlPlaylist = () => {
    const tracks = winampController.getPlaylist();
    const htmlEntities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    };
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => htmlEntities[character] ?? character);
    const rows: string[] = [];
    let skippedEntries = 0;
    tracks.forEach((track, index) => {
      let source: URL;
      try { source = new URL(track.src); } catch { skippedEntries += 1; return; }
      if (source.protocol !== 'http:' && source.protocol !== 'https:') {
        skippedEntries += 1;
        return;
      }
      rows.push(`<tr><td>${index + 1}</td><td><a href="${escapeHtml(source.href)}">${escapeHtml(track.title)}</a></td><td>${escapeHtml(track.artist)}</td><td>${escapeHtml(track.durationLabel)}</td></tr>`);
    });
    if (!rows.length) {
      setM3uStatus('No portable web-address tracks to export as HTML');
      return;
    }
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Winamp Playlist</title>
<style>body{font:14px/1.5 Arial,sans-serif;background:#15191d;color:#e8edf2;margin:2rem}h1{font-size:1.25rem}table{border-collapse:collapse;width:100%;max-width:960px}th,td{text-align:left;padding:.55rem .7rem;border-bottom:1px solid #39424b}th{color:#9ecbff}a{color:#70baff;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Winamp Playlist</h1><table><thead><tr><th>#</th><th>Title</th><th>Artist</th><th>Duration</th></tr></thead><tbody>${rows.join('')}</tbody></table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'winamp-playlist.html';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setM3uStatus(`Exported HTML playlist${skippedEntries ? `; skipped ${skippedEntries} local/unsupported tracks` : ''}`);
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
      additions = saved.map(({ blob, id, title, artist, album, trackNumber, durationLabel }) => ({
        id,
        title,
        artist,
        ...(album ? { album } : {}),
        ...(trackNumber ? { trackNumber } : {}),
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
    additions.forEach((track, index) => {
      const sourceFile = audioFiles[index];
      if (sourceFile) {
        void readEmbeddedAudioMetadata(sourceFile).then((metadata) => {
          const hasTags = Boolean(metadata.title || metadata.artist || metadata.album || metadata.trackNumber);
          if (!hasTags) return;
          winampController.updateTrackMetadata(track.id, metadata);
          if (track.id.startsWith('local-')) {
            void updateWinampLocalAudioMetadata(track.id, metadata).catch(() => undefined);
          }
        }).catch(() => undefined);
      }
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
  type PlayerWindowKey = 'main' | 'equalizer' | 'playlist' | 'video';
  const [activeWindow, setActiveWindow] = useState<PlayerWindowKey>('main');
  const [detachedWindows, setDetachedWindows] = useState<PlayerWindowKey[]>([]);
  const [videoMode, setVideoMode] = useState<'visualizer' | 'video'>('visualizer');
  const [showVideo, setShowVideo] = useState(true);
  const [videoShade, setVideoShade] = useState(false);
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
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const videoWindowRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const fullscreenHideTimerRef = useRef<number | null>(null);
  const lastTouchTapRef = useRef(0);
  const fullscreenPanelHoverRef = useRef(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const setVideoWindowVisible = (visible: boolean) => {
    if (visible === showVideo) return;
    if (!visible && isVideoFullscreen) {
      if (document.fullscreenElement === videoWindowRef.current && document.exitFullscreen) void document.exitFullscreen().catch(() => undefined);
      setIsVideoFullscreen(false);
    }
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

  // Initialise the one shared controller graph on user playback. The two
  // visualizer surfaces subscribe to a small external frame store, so 60 FPS
  // updates never re-render the large Winamp window manager / playlist tree.
  const initWebAudio = useCallback(() => {
    refreshWinampVisualizerAudioGraph();
  }, []);

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

  // Expose the existing controller to OS media keys / lock-screen controls.
  // This is a bridge to the same playback engine, not a second media pipeline.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const currentTrack = winampController.getState().track;
    if (typeof MediaMetadata !== 'undefined') {
      session.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Winamp Classic',
      });
    }
    session.playbackState = isPlaying ? 'playing' : 'paused';
    try {
      if (duration > 0 && Number.isFinite(currentTime)) {
        session.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.max(0, Math.min(duration, currentTime)),
        });
      } else {
        session.setPositionState();
      }
    } catch {
      // Position state is optional and may be rejected by older browser implementations.
    }
  }, [trackIndex, track.title, track.artist, track.album, isPlaying, currentTime, duration]);

  useEffect(() => () => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    } catch {
      // The browser may already have released its media session.
    }
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => { void winampController.play(); }],
      ['pause', () => winampController.pause()],
      ['stop', () => { winampController.pause(); winampController.seek(0); }],
      ['previoustrack', previous],
      ['nexttrack', next],
      ['seekbackward', (details) => {
        const state = winampController.getState();
        winampController.seek(state.currentTime - (details.seekOffset ?? 5));
      }],
      ['seekforward', (details) => {
        const state = winampController.getState();
        winampController.seek(state.currentTime + (details.seekOffset ?? 5));
      }],
      ['seekto', (details) => {
        if (typeof details.seekTime === 'number') winampController.seek(details.seekTime);
      }],
    ];
    handlers.forEach(([action, handler]) => {
      try { session.setActionHandler(action, handler); } catch { /* Unsupported action in this browser. */ }
    });
    return () => {
      handlers.forEach(([action]) => {
        try { session.setActionHandler(action, null); } catch { /* Ignore unsupported cleanup. */ }
      });
    };
  }, [previous, next]);

  const clearFullscreenHideTimer = useCallback(() => {
    if (fullscreenHideTimerRef.current !== null) {
      window.clearTimeout(fullscreenHideTimerRef.current);
      fullscreenHideTimerRef.current = null;
    }
  }, []);

  const scheduleFullscreenControlsHide = useCallback(() => {
    clearFullscreenHideTimer();
    if (fullscreenPanelHoverRef.current) return;
    fullscreenHideTimerRef.current = window.setTimeout(() => {
      setShowFullscreenControls(false);
      fullscreenHideTimerRef.current = null;
    }, 3000);
  }, [clearFullscreenHideTimer]);

  const revealFullscreenControls = useCallback(() => {
    setShowFullscreenControls(true);
    clearFullscreenHideTimer();
    if (!fullscreenPanelHoverRef.current) scheduleFullscreenControlsHide();
  }, [clearFullscreenHideTimer, scheduleFullscreenControlsHide]);

  const enterVideoFullscreen = useCallback(() => {
    const element = videoWindowRef.current;
    if (!element) return;
    setActiveWindow('video');
    setShowFullscreenControls(true);
    clearFullscreenHideTimer();
    if (element.requestFullscreen) {
      void element.requestFullscreen().then(() => {
        setIsVideoFullscreen(true);
        revealFullscreenControls();
      }).catch(() => {
        setIsVideoFullscreen(true);
        revealFullscreenControls();
      });
    } else {
      setIsVideoFullscreen(true);
      revealFullscreenControls();
    }
  }, [clearFullscreenHideTimer, revealFullscreenControls]);

  const exitVideoFullscreen = useCallback(() => {
    clearFullscreenHideTimer();
    if (document.fullscreenElement === videoWindowRef.current && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => setIsVideoFullscreen(false));
    } else {
      setIsVideoFullscreen(false);
    }
    fullscreenPanelHoverRef.current = false;
    setShowFullscreenControls(true);
  }, [clearFullscreenHideTimer]);

  const seekFullscreenMedia = useCallback((delta: number) => {
    if (videoMode === 'video' && videoElementRef.current) {
      const media = videoElementRef.current;
      const end = Number.isFinite(media.duration) ? media.duration : Math.max(0, media.currentTime + delta);
      media.currentTime = Math.max(0, Math.min(end, media.currentTime + delta));
      return;
    }
    const state = winampController.getState();
    const end = state.duration || state.currentTime + delta;
    winampController.seek(Math.max(0, Math.min(end, state.currentTime + delta)));
  }, [videoMode]);

  const toggleFullscreenPlayback = useCallback(() => {
    if (videoMode === 'video' && videoElementRef.current) {
      const media = videoElementRef.current;
      if (media.paused) void media.play().catch(() => undefined);
      else media.pause();
      return;
    }
    if (winampController.getState().isPlaying) pause();
    else void play();
  }, [videoMode, pause, play]);

  const cycleFullscreenMode = useCallback(() => {
    if (videoMode === 'video') {
      setVideoMode('visualizer');
      return;
    }
    setFourthVisualizerMode((mode) => fourthVisualizerModes[(fourthVisualizerModes.indexOf(mode) + 1) % fourthVisualizerModes.length]);
    setFourthVisualizerPresetIndex(0);
  }, [videoMode]);

  const handleVideoStagePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.wa-video__visualizer, .wa-video__screen')) return;
    if (!isVideoFullscreen && event.pointerType === 'touch') {
      const now = Date.now();
      if (lastTouchTapRef.current && now - lastTouchTapRef.current < 340) {
        lastTouchTapRef.current = 0;
        enterVideoFullscreen();
        return;
      }
      lastTouchTapRef.current = now;
      return;
    }
    if (isVideoFullscreen) revealFullscreenControls();
  };

  useEffect(() => {
    const element = videoWindowRef.current;
    const syncFullscreen = () => {
      const active = document.fullscreenElement === element;
      setIsVideoFullscreen(active);
      if (active) revealFullscreenControls();
      else {
        clearFullscreenHideTimer();
        fullscreenPanelHoverRef.current = false;
        setShowFullscreenControls(true);
      }
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, [clearFullscreenHideTimer, revealFullscreenControls]);

  useEffect(() => {
    if (!isVideoFullscreen) return;
    const handleFullscreenKeys = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          event.stopImmediatePropagation();
          seekFullscreenMedia(-5);
          revealFullscreenControls();
          break;
        case 'ArrowRight':
          event.preventDefault();
          event.stopImmediatePropagation();
          seekFullscreenMedia(5);
          revealFullscreenControls();
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopImmediatePropagation();
          previous();
          revealFullscreenControls();
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopImmediatePropagation();
          next();
          revealFullscreenControls();
          break;
        case ' ':
          event.preventDefault();
          event.stopImmediatePropagation();
          toggleFullscreenPlayback();
          revealFullscreenControls();
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          event.stopImmediatePropagation();
          cycleFullscreenMode();
          revealFullscreenControls();
          break;
        case 'Escape':
          event.stopImmediatePropagation();
          exitVideoFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleFullscreenKeys, true);
    return () => window.removeEventListener('keydown', handleFullscreenKeys, true);
  }, [isVideoFullscreen, seekFullscreenMedia, previous, next, toggleFullscreenPlayback, cycleFullscreenMode, revealFullscreenControls, exitVideoFullscreen]);

  useEffect(() => () => clearFullscreenHideTimer(), [clearFullscreenHideTimer]);

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
        case 'f':
          if (showVideo && activeWindow) {
            event.preventDefault();
            event.stopImmediatePropagation();
            enterVideoFullscreen();
          } else {
            handled = false;
          }
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
  }, [previous, play, pause, stop, next, currentTime, duration, volume, showVideo, activeWindow, enterVideoFullscreen]);

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
              <WinampMainVisualizer
                mode={mainVisualizerMode}
                modeName={mainVisualizerModeNames[mainVisualizerMode]}
                visualizerColors={activeSkin?.visualizerColors}
                onCycle={() => setMainVisualizerMode((mode) => ((mode + 1) % 3) as 0 | 1 | 2)}
              />

              {/* Right Column: Track Marquee & Technical Info */}
              <div className="wa-display__right">
                <div className="wa-marquee-box">
                  <div className="wa-marquee-text">
                    {trackIndex + 1}. {track.artist} - {track.title} ({duration ? formatTime(duration) : track.durationLabel})
                  </div>
                </div>
                <div className="wa-tech-info">
                  <div className="wa-bitrate" title="Bitrate metadata is not available for this track">
                    <span className="wa-digit-val">—</span> <span className="wa-unit">kbps</span>
                  </div>
                  <div className="wa-samplerate" title="Sample-rate metadata is not available for this track">
                    <span className="wa-digit-val">—</span> <span className="wa-unit">kHz</span>
                  </div>
                  <div className="wa-audio-channels" title="Channel metadata is not available for this track">
                    <span className="wa-chan">—</span>
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
                style={activeSkin ? {
                  backgroundColor: activeSkin.playlistStyle.normalbg,
                  color: activeSkin.playlistStyle.normal,
                  fontFamily: activeSkin.playlistStyle.font,
                } : undefined}
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
                      style={activeSkin ? {
                        color: isCurrent ? activeSkin.playlistStyle.current : activeSkin.playlistStyle.normal,
                        backgroundColor: playlistSelection.includes(index) || isCurrent
                          ? activeSkin.playlistStyle.selectedbg
                          : activeSkin.playlistStyle.normalbg,
                        fontFamily: activeSkin.playlistStyle.font,
                      } : undefined}
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
                    <div className="wa-classic-menu__panel wa-classic-menu__panel--pl" style={activeSkin ? { backgroundColor: activeSkin.playlistStyle.mbbg, color: activeSkin.playlistStyle.mbfg } : undefined}>
                      <button type="button" className="wa-btn-pl" onClick={() => setPlaylistSelection([])}>Clear selection</button>
                      <button type="button" className="wa-btn-pl" onClick={() => setPlayerSettingsOpen(true)}>Player settings…</button>
                      <button type="button" className="wa-btn-pl" onClick={() => m3uInputRef.current?.click()}>Import M3U</button>
                      <button type="button" className="wa-btn-pl" onClick={exportM3uFile}>Export M3U</button>
                      <button type="button" className="wa-btn-pl" onClick={exportHtmlPlaylist}>Export HTML playlist</button>
                      <button type="button" className="wa-btn-pl" onClick={() => skinInputRef.current?.click()}>Import .wsz skin</button>
                      {skinVisuals && <button type="button" className="wa-btn-pl" onClick={() => { void clearActiveWinampSkin().then(() => { setSkinVisuals(null); setSkinStatus('Built-in Winamp appearance restored'); }).catch(() => { setSkinVisuals(null); setSkinStatus('Built-in appearance restored for this session; saved skin could not be cleared'); }); }}>Reset skin</button>}
                    </div>
                  </details>
                  <details name="wa-classic-menu" className="wa-classic-menu wa-classic-menu--list" onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.open = false; }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
                    <summary className="wa-btn-pl wa-btn-pl--opts">LIST OPT</summary>
                    <div className="wa-classic-menu__panel wa-classic-menu__panel--list" style={activeSkin ? { backgroundColor: activeSkin.playlistStyle.mbbg, color: activeSkin.playlistStyle.mbfg } : undefined}>
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
                    <button type="button" className="wa-btn-pl" onClick={exportHtmlPlaylist} title="Export a portable HTML playlist">HTML OUT</button>
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
        ref={videoWindowRef}
        tabIndex={isVideoFullscreen ? -1 : undefined}
        className={`wa-window wa-video ${videoMode === 'video' ? 'wa-video--video' : 'wa-video--visualizer'} ${videoShade ? 'wa-window--shaded' : ''} ${isVideoFullscreen ? 'wa-video--fullscreen' : ''}`}
        style={isVideoFullscreen ? undefined : { left: windowPositions.video.x, top: windowPositions.video.y, zIndex: activeWindow === 'video' ? 90 : 80 }}
        onPointerDown={() => setActiveWindow('video')}
        onPointerUp={handleVideoStagePointerUp}
        onDoubleClick={(event) => {
          const target = event.target as HTMLElement;
          if (isVideoFullscreen || !target.closest('.wa-video__visualizer, .wa-video__screen')) return;
          event.preventDefault();
          enterVideoFullscreen();
        }}
        onMouseMove={() => { if (isVideoFullscreen) revealFullscreenControls(); }}
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
          <WinampFourthVisualizer
            mode={fourthVisualizerMode}
            presetIndex={fourthVisualizerPresetIndex}
            onCycle={() => setFourthVisualizerMode((mode) => fourthVisualizerModes[(fourthVisualizerModes.indexOf(mode) + 1) % fourthVisualizerModes.length])}
          />
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
                setVideoIsPlaying(false);
              }
              event.currentTarget.value = '';
            }} />
            {videoUrl ? <video ref={videoElementRef} src={videoUrl} controls={!isVideoFullscreen} playsInline onPlay={() => { setVideoIsPlaying(true); if (isVideoFullscreen) revealFullscreenControls(); }} onPause={() => { setVideoIsPlaying(false); if (isVideoFullscreen) revealFullscreenControls(); }} /> : <div className="wa-video__empty">OPEN A VIDEO FILE</div>}
            <button type="button" className="wa-video__open" onClick={() => videoInputRef.current?.click()}>OPEN VIDEO</button>
          </div>
        )}
        {isVideoFullscreen && <div
          role="toolbar"
          aria-label="Fullscreen media controls"
          className={`wa-video__fullscreen-controls${showFullscreenControls ? ' is-visible' : ''}`}
          onPointerEnter={() => {
            fullscreenPanelHoverRef.current = true;
            clearFullscreenHideTimer();
            setShowFullscreenControls(true);
          }}
          onPointerLeave={() => {
            fullscreenPanelHoverRef.current = false;
            scheduleFullscreenControlsHide();
          }}
          onPointerUp={(event) => {
            if (event.pointerType === 'touch') {
              fullscreenPanelHoverRef.current = false;
              scheduleFullscreenControlsHide();
            }
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" title="Назад на 5 секунд" aria-label="Назад на 5 секунд" onClick={() => { seekFullscreenMedia(-5); revealFullscreenControls(); }}>−5s</button>
          <button type="button" title="Предыдущий трек" aria-label="Предыдущий трек" onClick={() => { previous(); revealFullscreenControls(); }}>|◀</button>
          <button type="button" title="Пауза или продолжить" aria-label="Пауза или продолжить" onClick={() => { toggleFullscreenPlayback(); revealFullscreenControls(); }}>{videoMode === 'video' ? (videoIsPlaying ? 'Ⅱ' : '▶') : (isPlaying ? 'Ⅱ' : '▶')}</button>
          <button type="button" title="Следующий трек" aria-label="Следующий трек" onClick={() => { next(); revealFullscreenControls(); }}>▶|</button>
          <button type="button" title="Вперёд на 5 секунд" aria-label="Вперёд на 5 секунд" onClick={() => { seekFullscreenMedia(5); revealFullscreenControls(); }}>+5s</button>
          <button type="button" title="Переключить режим" aria-label="Переключить режим" onClick={() => { cycleFullscreenMode(); revealFullscreenControls(); }}>MODE</button>
          <button type="button" title="Выйти из полноэкранного режима" aria-label="Выйти из полноэкранного режима" onClick={exitVideoFullscreen}>✕</button>
        </div>}
        </>}
      </div>}
    </div>
  );
}
