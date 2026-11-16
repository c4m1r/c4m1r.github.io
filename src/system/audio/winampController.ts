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

  constructor() {
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
    if (PROJECT_PLAYLIST.length <= 1) return 0;
    const choices = PROJECT_PLAYLIST.map((_, index) => index).filter((index) => index !== this.trackIndex);
    return choices[Math.floor(Math.random() * choices.length)] ?? this.trackIndex;
  }

  private pickNextIndex(): number {
    return this.shuffle ? this.pickRandomIndex() : (this.trackIndex + 1) % PROJECT_PLAYLIST.length;
  }

  private advance(shouldPlay: boolean) {
    this.trackIndex = this.pickNextIndex();
    this.updateAudioSrc(shouldPlay);
  }

  public getTrack(): MediaTrack {
    return PROJECT_PLAYLIST[this.trackIndex] ?? PROJECT_PLAYLIST[0];
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
    this.trackIndex = (this.trackIndex - 1 + PROJECT_PLAYLIST.length) % PROJECT_PLAYLIST.length;
    this.updateAudioSrc(this.isPlaying);
  }

  public randomTrack(): void {
    this.initAudio();
    if (PROJECT_PLAYLIST.length <= 1) return;
    this.trackIndex = this.pickRandomIndex();
    this.updateAudioSrc(this.isPlaying);
  }

  public playRandom(): Promise<void> {
    this.initAudio();
    if (PROJECT_PLAYLIST.length > 1) {
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
    if (index >= 0 && index < PROJECT_PLAYLIST.length) {
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
          this.mediaSource.connect(this.analyser);
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
