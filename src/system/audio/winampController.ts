import { PROJECT_PLAYLIST, type MediaTrack } from '../../apps/mediaplayer/playlist';

export interface WinampState {
  trackIndex: number;
  track: MediaTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
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
  private subscribers = new Set<WinampSubscriber>();
  private initialized = false;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('winamp:command', (e: Event) => {
        const custom = e as CustomEvent<{ action: string; value?: unknown }>;
        if (custom.detail?.action === 'play') this.play();
        else if (custom.detail?.action === 'pause') this.pause();
        else if (custom.detail?.action === 'toggle') this.toggle();
        else if (custom.detail?.action === 'next') this.next();
        else if (custom.detail?.action === 'prev') this.prev();
        else if (custom.detail?.action === 'seek') this.seek(Number(custom.detail.value));
        else if (custom.detail?.action === 'setTrack') this.setTrack(Number(custom.detail.value));
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
      this.duration = audio.duration || 0;
      this.notify();
    });

    audio.addEventListener('ended', () => {
      if (this.repeat && this.audioElement) {
        this.audioElement.currentTime = 0;
        void this.play();
      } else {
        this.next();
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

    this.audioElement = audio;
    this.updateAudioSrc();
  }

  private updateAudioSrc() {
    const track = this.getTrack();
    if (this.audioElement && track) {
      const wasPlaying = this.isPlaying;
      this.audioElement.src = track.src;
      this.audioElement.currentTime = 0;
      this.currentTime = 0;
      if (wasPlaying) {
        this.audioElement.play().catch(() => {
          this.isPlaying = false;
          this.notify();
        });
      }
    }
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
        // Safe dispatch
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
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      void this.play();
    }
  }

  public next(): void {
    this.initAudio();
    this.trackIndex = (this.trackIndex + 1) % PROJECT_PLAYLIST.length;
    this.updateAudioSrc();
    this.notify();
  }

  public prev(): void {
    this.initAudio();
    this.trackIndex = (this.trackIndex - 1 + PROJECT_PLAYLIST.length) % PROJECT_PLAYLIST.length;
    this.updateAudioSrc();
    this.notify();
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
      this.updateAudioSrc();
      this.notify();
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.notify();
  }

  public setRepeat(val: boolean): void {
    this.repeat = val;
  }

  public isRepeat(): boolean {
    return this.repeat;
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
          const source = ctx.createMediaElementSource(this.audioElement);
          this.mediaSource = source;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          this.analyser = analyser;
          source.connect(analyser);
          analyser.connect(ctx.destination);
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('Web Audio init skipped:', e);
    }
    return { ctx: this.audioCtx, analyser: this.analyser, source: this.mediaSource };
  }
}

export const winampController = new WinampControllerService();
