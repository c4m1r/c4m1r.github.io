#!/usr/bin/env python3
"""
Generates the generic alarm tones used by the Alarm app.

The tones are synthesised here (sine and square waves, no samples), so they carry
no third-party licence: they are original work of this project and free to use.
Run from anywhere:  python3 eat/original/sound-generator/gen-alarm-sounds.py
Output: src/assets/alarm-sounds/<key>.wav (mono, 16-bit, 22050 Hz).
"""
import math
import os
import struct
import wave

RATE = 22050
# Repository root is three levels up from this folder (eat/original/sound-generator).
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'src', 'assets', 'alarm-sounds')


def tone(freq, dur, wave_kind='sine', volume=0.6, attack=0.005, release=0.04):
    n = int(RATE * dur)
    samples = []
    for i in range(n):
        t = i / RATE
        phase = freq * t
        if wave_kind == 'square':
            v = 1.0 if (phase % 1.0) < 0.5 else -1.0
        else:
            v = math.sin(2 * math.pi * phase)
        env = 1.0
        if t < attack:
            env = t / attack
        if dur - t < release:
            env = min(env, (dur - t) / release)
        samples.append(v * env * volume)
    return samples


def sweep(f0, f1, dur, volume=0.6):
    n = int(RATE * dur)
    out, phase = [], 0.0
    for i in range(n):
        t = i / n
        f = f0 + (f1 - f0) * t
        phase += f / RATE
        v = math.sin(2 * math.pi * phase)
        env = min(1.0, i / (0.01 * RATE), (n - i) / (0.04 * RATE))
        out.append(v * env * volume)
    return out


def silence(dur):
    return [0.0] * int(RATE * dur)


def repeat_to(samples, total):
    target = int(RATE * total)
    out = []
    while len(out) < target:
        out.extend(samples)
    return out[:target]


def bell_chime(total=4.0):
    # Ascending arpeggio with decay, like a classic chime.
    notes = [523.25, 659.25, 783.99, 1046.5]
    phrase = []
    for f in notes:
        phrase += tone(f, 0.45, 'sine', 0.55, attack=0.002, release=0.3)
    phrase += silence(0.4)
    return repeat_to(phrase, total)


def digital_beeps(total=4.0):
    # Quick square-wave beeps, like an electronic clock.
    beep = tone(1000, 0.12, 'square', 0.4, attack=0.002, release=0.01) + silence(0.1)
    group = beep * 3 + silence(0.5)
    return repeat_to(group, total)


def siren(total=4.0):
    # Rising and falling sweep, like a wake-up siren.
    up = sweep(600, 1400, 0.9)
    down = sweep(1400, 600, 0.9)
    return repeat_to(up + down, total)


def classic_bell(total=4.0):
    # Two-pitch double ring, like a mechanical alarm clock.
    ring = tone(880, 0.25, 'sine', 0.6, attack=0.002, release=0.15) + tone(660, 0.25, 'sine', 0.6, attack=0.002, release=0.15)
    group = ring + silence(0.2) + ring + silence(0.9)
    return repeat_to(group, total)


TONES = {
    'alarm-chime': bell_chime,
    'alarm-digital': digital_beeps,
    'alarm-siren': siren,
    'alarm-classic': classic_bell,
}


def write_wav(path, samples):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = b''.join(struct.pack('<h', int(max(-1.0, min(1.0, s)) * 32767)) for s in samples)
        w.writeframes(frames)


def main():
    os.makedirs(OUT, exist_ok=True)
    for key, builder in TONES.items():
        path = os.path.join(OUT, key + '.wav')
        write_wav(path, builder())
        print('wrote', os.path.normpath(path), os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    main()
