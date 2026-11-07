import errorSoundUrl from './assets/sounds/error.wav';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Windows XP Startup Chime (Bill Brown E♭ Major orchestral chord sequence)
 */
export function playXpStartup(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.28, now);
  master.connect(ctx.destination);

  // Frequencies for the iconic rising chord sequence
  const notes = [
    { freq: 155.56, time: 0.0, dur: 4.5, type: 'triangle' as const, gain: 0.4 }, // Eb3
    { freq: 233.08, time: 0.35, dur: 4.2, type: 'sine' as const, gain: 0.35 },    // Bb3
    { freq: 311.13, time: 0.70, dur: 3.8, type: 'triangle' as const, gain: 0.3 }, // Eb4
    { freq: 392.00, time: 1.05, dur: 3.5, type: 'sine' as const, gain: 0.28 },    // G4
    { freq: 466.16, time: 1.40, dur: 3.2, type: 'sine' as const, gain: 0.25 },    // Bb4
    { freq: 622.25, time: 1.75, dur: 3.0, type: 'sine' as const, gain: 0.3 },     // Eb5
    { freq: 932.33, time: 2.10, dur: 2.6, type: 'sine' as const, gain: 0.18 },    // Bb5 chime
    { freq: 1244.5, time: 2.30, dur: 2.4, type: 'sine' as const, gain: 0.12 },    // Eb6 sparkle
  ];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now + n.time);
    filter.frequency.exponentialRampToValueAtTime(800, now + n.time + n.dur);

    osc.type = n.type;
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    g.gain.setValueAtTime(0.0001, now + n.time);
    g.gain.linearRampToValueAtTime(n.gain, now + n.time + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(master);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.1);
  }
}

/**
 * Windows XP Logon Sound (3-note warm chime)
 */
export function playXpLogon(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.3, now);
  master.connect(ctx.destination);

  const chords = [
    { freq: 311.13, time: 0.0, dur: 1.8 }, // Eb4
    { freq: 466.16, time: 0.22, dur: 1.6 }, // Bb4
    { freq: 622.25, time: 0.44, dur: 2.0 }, // Eb5
  ];

  for (const c of chords) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(c.freq, now + c.time);

    g.gain.setValueAtTime(0.001, now + c.time);
    g.gain.linearRampToValueAtTime(0.35, now + c.time + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + c.time + c.dur);

    osc.connect(g);
    g.connect(master);
    osc.start(now + c.time);
    osc.stop(now + c.time + c.dur + 0.05);
  }
}

/**
 * Windows XP Logoff Sound (4-note descending harp chime)
 */
export function playXpLogoff(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.28, now);
  master.connect(ctx.destination);

  const notes = [
    { freq: 622.25, time: 0.0, dur: 1.4 },  // Eb5
    { freq: 466.16, time: 0.18, dur: 1.4 }, // Bb4
    { freq: 392.00, time: 0.36, dur: 1.5 }, // G4
    { freq: 311.13, time: 0.54, dur: 1.8 }, // Eb4
  ];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    g.gain.setValueAtTime(0.001, now + n.time);
    g.gain.linearRampToValueAtTime(0.3, now + n.time + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

    osc.connect(g);
    g.connect(master);
    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.05);
  }
}

/**
 * Windows XP Shutdown Sound (Orchestral descending resolution)
 */
export function playXpShutdown(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.3, now);
  master.connect(ctx.destination);

  const notes = [
    { freq: 523.25, time: 0.0, dur: 1.8 },  // C5
    { freq: 466.16, time: 0.24, dur: 1.8 }, // Bb4
    { freq: 415.30, time: 0.48, dur: 2.0 }, // Ab4
    { freq: 311.13, time: 0.76, dur: 2.6 }, // Eb4
  ];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    g.gain.setValueAtTime(0.001, now + n.time);
    g.gain.linearRampToValueAtTime(0.28, now + n.time + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

    osc.connect(g);
    g.connect(master);
    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.05);
  }
}

/**
 * Windows XP Navigation Click
 */
export function playXpClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

  g.gain.setValueAtTime(0.12, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Windows XP Ding
 */
export function playXpDing(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);

  g.gain.setValueAtTime(0.22, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.48);
}

/**
 * Windows XP Balloon notification pop
 */
export function playXpBalloon(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Windows XP Error Chord (authentic error.wav)
 */
export function playXpError(): void {
  try {
    const audio = new Audio(errorSoundUrl);
    void audio.play().catch(() => {
      // Fallback to synthesized ding
      playXpDing();
    });
  } catch {
    playXpDing();
  }
}
