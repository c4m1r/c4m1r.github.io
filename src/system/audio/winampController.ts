import { PROJECT_PLAYLIST, type MediaTrack } from '../../apps/mediaplayer/playlist';

export interface WinampState {
  trackIndex: number;
  track: MediaTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  autoAdvance: boolean;
  shuffle: boolean;
}

type WinampSubscriber = (state: WinampState) => void;

class WinampControllerService {
  private audioElement: HTMLAudioElement | null = null;
  private playlist: MediaTrack[] = [...PROJECT_PLAYLIST];
  private trackIndex = 0;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private volume = 0.85;
  private repeat = false;
  private autoAdvance = true;
  private shuffle = false;
  private subscribers = new Set<WinampSubscriber>();
  private initialized = false;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private eqEnabled = true;
  private eqGains = Array(10).fill(0) as number[];
  private preampGain = 0;
  private balance = 0;
  private preampNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private readonly eqFrequencies = [70, 180, 320, 600, 1000, 3000, 6000, 12000, 14000, 16000];

  constructor() {
    this.loadEqualizerSettings();
    if (typeof window !== 'undefined') {
      window.addEventListener('winamp:command', (e: Event) => {
        const custom = e as CustomEvent<{ action: string; value?: unknown }>;
        if (custom.detail?.action === 'play') void this.play();
        else if (custom.detail?.action === 'pause') this.pause();
        else if (custom.detail?.action === 'toggle') this.toggle();
        else if (custom.detail?.action === 'next') this.next();
        else if (custom.detail?.action === 'prev') this.prev();
        else if (custom.detail?.action === 'seek') this.seek(Number(custom.detail.value));
        else if (custom.detail?.action === 'setTrack') this.setTrack(Number(custom.detail.value));
        else if (custom.detail?.action === 'setAutoAdvance') this.setAutoAdvance(Boolean(custom.detail.value));
        else if (custom.detail?.action === 'setShuffle') this.setShuffle(Boolean(custom.detail.value));
      });
    }
  }

  private initAudio() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    const audio = new Audio();
    audio.volume = this.volume;
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', () => {
      this.currentTime = audio.currentTime;
      this.notify();
    });
    audio.addEventListener('loadedmetadata', () => {
      this.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      this.notify();
    });
    audio.addEventListener('ended', () => {
      if (this.repeat) {
        audio.currentTime = 0;
        void this.play();
      } else if (this.autoAdvance) {
        this.advance(true);
      } else {
        this.isPlaying = false;
        this.currentTime = audio.duration || this.currentTime;
        this.notify();
      }
    });
    audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });
    audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });
    audio.addEventListener('error', () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audioElement = audio;
    this.updateAudioSrc(false);
  }

  private updateAudioSrc(shouldPlay = this.isPlaying) {
    const track = this.getTrack();
    const audio = this.audioElement;
    if (!audio || !track) return;

    audio.pause();
    audio.src = track.src;
    audio.currentTime = 0;
    this.currentTime = 0;
    this.duration = 0;
    audio.load();
    this.notify();
    if (shouldPlay) void this.play();
  }

  private pickRandomIndex(): number {
    if (this.playlist.length <= 1) return 0;
    const choices = this.playlist.map((_, index) => index).filter((index) => index !== this.trackIndex);
    return choices[Math.floor(Math.random() * choices.length)] ?? this.trackIndex;
  }

  private pickNextIndex(): number {
    return this.shuffle ? this.pickRandomIndex() : (this.trackIndex + 1) % this.playlist.length;
  }

  private advance(shouldPlay: boolean) {
    this.trackIndex = this.pickNextIndex();
    this.updateAudioSrc(shouldPlay);
  }

  public getTrack(): MediaTrack {
    return this.playlist[this.trackIndex] ?? this.playlist[0] ?? PROJECT_PLAYLIST[0];
  }

  public getPlaylist(): MediaTrack[] {
    return [...this.playlist];
  }

  public addTracks(tracks: MediaTrack[]): void {
    const existing = new Set(this.playlist.map((track) => track.id));
    const additions = tracks.filter((track) => track?.id && track.src && !existing.has(track.id));
    if (!additions.length) return;
    this.playlist = [...this.playlist, ...additions];
    this.notify();
  }

  public removeTracks(indices: number[]): void {
    if (!indices.length || this.playlist.length <= 1) return;
    const remove = new Set(indices.filter((index) => Number.isInteger(index) && index >= 0 && index < this.playlist.length));
    if (!remove.size || remove.size >= this.playlist.length) return;
    const currentTrack = this.getTrack();
    const removedTracks = this.playlist.filter((_, index) => remove.has(index));
    this.playlist = this.playlist.filter((_, index) => !remove.has(index));
    const currentWasRemoved = remove.has(this.trackIndex);
    const nextIndex = this.playlist.findIndex((track) => track.id === currentTrack.id);
    this.trackIndex = nextIndex >= 0 ? nextIndex : Math.min(this.trackIndex, this.playlist.length - 1);
    if (currentWasRemoved && this.audioElement) this.updateAudioSrc(this.isPlaying);
    else this.notify();
    if (typeof URL !== 'undefined') {
      removedTracks.forEach((track) => {
        if (track.src.startsWith('blob:')) URL.revokeObjectURL(track.src);
      });
    }
  }


  public getState(): WinampState {
    return {
      trackIndex: this.trackIndex,
      track: this.getTrack(),
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration || 180,
      volume: this.volume,
      autoAdvance: this.autoAdvance,
      shuffle: this.shuffle,
    };
  }

  public subscribe(fn: WinampSubscriber): () => void {
    this.subscribers.add(fn);
    fn(this.getState());
    return () => {
      this.subscribers.delete(fn);
    };
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach((fn) => {
      try {
        fn(state);
      } catch {
        // Isolate subscribers so one view cannot break playback state propagation.
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('winamp:state-changed', { detail: state }));
    }
  }

  public play(): Promise<void> {
    this.initAudio();
    if (!this.audioElement) return Promise.resolve();
    return this.audioElement.play().then(() => {
      this.isPlaying = true;
      this.notify();
    }).catch(() => {
      this.isPlaying = false;
      this.notify();
    });
  }

  public pause(): void {
    this.audioElement?.pause();
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) this.pause();
    else void this.play();
  }

  public next(): void {
    this.initAudio();
    this.advance(this.isPlaying);
  }

  public prev(): void {
    this.initAudio();
    this.trackIndex = (this.trackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.updateAudioSrc(this.isPlaying);
  }

  public randomTrack(): void {
    this.initAudio();
    if (this.playlist.length <= 1) return;
    this.trackIndex = this.pickRandomIndex();
    this.updateAudioSrc(this.isPlaying);
  }

  public playRandom(): Promise<void> {
    this.initAudio();
    if (this.playlist.length > 1) {
      this.trackIndex = this.pickRandomIndex();
      this.updateAudioSrc(false);
    }
    return this.play();
  }

  public seek(seconds: number): void {
    this.initAudio();
    if (this.audioElement && Number.isFinite(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.duration || seconds));
      this.currentTime = this.audioElement.currentTime;
      this.notify();
    }
  }

  public setTrack(index: number): void {
    this.initAudio();
    if (index >= 0 && index < this.playlist.length) {
      this.trackIndex = index;
      this.updateAudioSrc(this.isPlaying);
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) this.audioElement.volume = this.volume;
    this.notify();
  }

  public setRepeat(val: boolean): void {
    this.repeat = val;
    this.notify();
  }

  public isRepeat(): boolean {
    return this.repeat;
  }

  public setAutoAdvance(val: boolean): void {
    this.autoAdvance = val;
    this.notify();
  }

  public isAutoAdvance(): boolean {
    return this.autoAdvance;
  }

  public setShuffle(val: boolean): void {
    this.shuffle = val;
    this.notify();
  }

  public isShuffle(): boolean {
    return this.shuffle;
  }

  private loadEqualizerSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('winamp:equalizer:v1');
      if (!raw) return;
      const saved = JSON.parse(raw) as { enabled?: unknown; bands?: unknown; preamp?: unknown; balance?: unknown };
      if (typeof saved.enabled === 'boolean') this.eqEnabled = saved.enabled;
      if (Array.isArray(saved.bands) && saved.bands.length === this.eqGains.length) {
        this.eqGains = saved.bands.map((value) => Number.isFinite(value) ? Math.max(-12, Math.min(12, Number(value))) : 0);
      }
      if (typeof saved.preamp === 'number' && Number.isFinite(saved.preamp)) this.preampGain = Math.max(-12, Math.min(12, saved.preamp));
      if (typeof saved.balance === 'number' && Number.isFinite(saved.balance)) this.balance = Math.max(-1, Math.min(1, saved.balance));
    } catch {
      // Ignore unavailable storage or malformed settings and retain safe defaults.
    }
  }

  private saveEqualizerSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('winamp:equalizer:v1', JSON.stringify({
        enabled: this.eqEnabled,
        bands: this.eqGains,
        preamp: this.preampGain,
        balance: this.balance,
      }));
    } catch {
      // Playback remains available when storage is blocked or full.
    }
  }

  public setEqualizerEnabled(enabled: boolean): void {
    this.eqEnabled = enabled;
    this.eqFilters.forEach((filter, index) => filter.gain.setTargetAtTime(enabled ? this.eqGains[index] : 0, filter.context.currentTime, 0.015));
    if (this.preampNode) this.preampNode.gain.setTargetAtTime(enabled ? Math.pow(10, this.preampGain / 20) : 1, this.preampNode.context.currentTime, 0.015);
    this.saveEqualizerSettings();
  }
  public setEqualizerBand(index: number, gain: number): void {
    if (index < 0 || index >= this.eqGains.length || !Number.isFinite(gain)) return;
    this.eqGains[index] = Math.max(-12, Math.min(12, gain));
    const filter = this.eqFilters[index];
    if (filter) filter.gain.setTargetAtTime(this.eqEnabled ? this.eqGains[index] : 0, filter.context.currentTime, 0.015);
    this.saveEqualizerSettings();
  }
  public setPreamp(gainDb: number): void {
    if (!Number.isFinite(gainDb)) return;
    this.preampGain = Math.max(-12, Math.min(12, gainDb));
    if (this.preampNode) this.preampNode.gain.setTargetAtTime(this.eqEnabled ? Math.pow(10, this.preampGain / 20) : 1, this.preampNode.context.currentTime, 0.015);
    this.saveEqualizerSettings();
  }
  public setBalance(balance: number): void {
    if (!Number.isFinite(balance)) return;
    this.balance = Math.max(-1, Math.min(1, balance));
    if (this.pannerNode) this.pannerNode.pan.setTargetAtTime(this.balance, this.pannerNode.context.currentTime, 0.015);
    this.saveEqualizerSettings();
  }
  public getEqualizerState(): { enabled: boolean; bands: number[]; preamp: number; balance: number } {
    return { enabled: this.eqEnabled, bands: [...this.eqGains], preamp: this.preampGain, balance: this.balance };
  }
  public getAudioElement(): HTMLAudioElement | null {
    this.initAudio();
    return this.audioElement;
  }

  public getWebAudio(): {
    ctx: AudioContext | null;
    analyser: AnalyserNode | null;
    source: MediaElementAudioSourceNode | null;
  } {
    if (typeof window === 'undefined') return { ctx: null, analyser: null, source: null };
    this.initAudio();
    if (!this.audioElement) return { ctx: null, analyser: null, source: null };
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          const ctx = new AudioCtxClass();
          this.audioCtx = ctx;
          this.mediaSource = ctx.createMediaElementSource(this.audioElement);
          this.analyser = ctx.createAnalyser();
          this.analyser.fftSize = 64;
          this.eqFilters = this.eqFrequencies.map((frequency, index) => {
            const filter = ctx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = frequency;
            filter.Q.value = 1;
            filter.gain.value = this.eqEnabled ? this.eqGains[index] : 0;
            return filter;
          });
          this.preampNode = ctx.createGain();
          this.preampNode.gain.value = this.eqEnabled ? Math.pow(10, this.preampGain / 20) : 1;
          this.pannerNode = ctx.createStereoPanner();
          this.pannerNode.pan.value = this.balance;
          let previous: AudioNode = this.mediaSource;
          this.eqFilters.forEach((filter) => { previous.connect(filter); previous = filter; });
          previous.connect(this.preampNode);
          this.preampNode.connect(this.pannerNode);
          this.pannerNode.connect(this.analyser);
          this.analyser.connect(ctx.destination);
        }
      }
      if (this.audioCtx?.state === 'suspended') void this.audioCtx.resume();
    } catch (e) {
      console.warn('Web Audio init skipped:', e);
    }
    return { ctx: this.audioCtx, analyser: this.analyser, source: this.mediaSource };
  }
}

export const winampController = new WinampControllerService();
