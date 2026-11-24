# Winamp Visualization Modes — design and implementation contract

Status: design baseline; implementation and browser acceptance are pending.

## Goal

Turn the fourth Video / Visualization window into a genuine multi-mode music visualization surface inspired by classic Winamp visualizers and Windows Media Player 9/10. Preserve the compact Main LCD as a separate, deliberately simple Winamp hardware display.

This is an original implementation. “MilkDrop-inspired” means a project-authored reactive effect, not the original MilkDrop engine, preset compatibility, or a claim of plugin support.

## Two visualization surfaces

### Main LCD (small, always compact)

Keep the existing three quick modes and their instant click-to-cycle behavior:
1. Spectrum — frequency columns with peak hold.
2. Oscilloscope — time-domain waveform.
3. Peak meter — peak-hold level columns.

Do not add large effects or settings panels to Main. It should remain faithful to the small Winamp LCD.

### Fourth window (expanded visualizer)

Replace the current three-mode duplicate with a mode browser. Modes are grouped by visual family, not by vendor branding:

| Group | Mode | Visual behavior | Reference family |
|---|---|---|---|
| Winamp Classic | Spectrum Analyzer | 32–64 logarithmic frequency bands, peak caps, configurable decay | Winamp AVS / classic analyzer |
| Winamp Classic | Oscilloscope | Smooth time-domain trace; mono and dual-trace variants | Winamp oscilloscope |
| Winamp Classic | Spectrogram | Scrolling frequency/time waterfall with logarithmic frequency mapping | Analyzer / spectrogram |
| Winamp Classic | Stereo Scope | Lissajous / XY phase trace when stereo channel data is available; honest mono fallback otherwise | Winamp scope |
| WMP-style | Bars & Waves | Paired frequency bars and flowing waveform ribbons | Windows Media Player |
| WMP-style | Mystify | Multiple continuously morphing, audio-reactive wireframe polygons | Windows Media Player |
| WMP-style | Particles | Audio-reactive particle field with bass impulses and treble shimmer | Windows Media Player |
| WMP-style | Spikes | Radial or mirrored spike field driven by frequency bins | Windows Media Player |
| WMP-style | Battery / Pulse | A central form whose fill, glow and pulse respond to average level and bass | Windows Media Player |
| Experimental | Milkdrop-inspired | Full-stage procedural feedback / geometric patterns with beat-reactive motion; original presets only | Inspired by MilkDrop, not compatible with it |

The mode browser should make the selected mode and group obvious. Do not imply that these are bundled Microsoft or Winamp plugins.

## Controls

- Previous / next mode; direct mode picker grouped by family.
- Random mode, with no immediate repeat.
- Optional auto-cycle with a configurable interval; disabled by default.
- Fullscreen visualization stage, with Escape to exit.
- Compact settings: palette, sensitivity, smoothing/decay, and visual density where relevant.
- Reset-to-default settings.
- Keyboard access and visible focus. Buttons must have useful labels and must not intercept window dragging outside their own hit areas.
- Persist only user preferences (selected mode, palette, sensitivity, smoothing, auto-cycle). Do not persist transient analyser samples or animation state.

## Audio data and rendering architecture

- One shared Web Audio analyser source; no second audio engine and no duplicate media playback.
- Read frequency and time-domain samples once per animation frame and expose a compact frame snapshot to the active renderer.
- Prefer a canvas renderer for the large stage. Resize using the element's actual pixel size and devicePixelRatio, capped to avoid excessive backing-store memory on high-DPI displays.
- Use requestAnimationFrame only while the visualizer is visible and the audio context is running or a deliberate idle animation is selected. Stop/cancel the loop on hide, mode teardown and unmount.
- Do not call React state setters for every sample/frame. React state should hold mode and settings; animation samples stay in refs/canvas.
- Handle paused/stopped audio deterministically: decay to silence for analyzers; procedural idle motion only where the mode explicitly supports it.
- Avoid random values per React render. Seed or update procedural motion in the renderer loop.
- Stereo Scope must not fabricate separate left/right channels. If the current controller graph exposes only a merged analyser, show a mono scope or implement a documented channel splitter in the existing graph without changing playback gain, EQ/DSP routing, or controller ownership.
- No mandatory external libraries, cloud APIs, remote assets, or imported plugin binaries.

## Visual direction

- Keep the Winamp Classic frame/chrome and the existing square 275 px initial stage. The stage itself can scale to the user's resized window if resizing is later enabled.
- Default Spectrum palette should evoke classic Winamp green/yellow/red analyzer columns on a black background. Other modes may have distinct palettes.
- WMP-style modes should be more fluid, colorful and spatial, while retaining readable contrast and restrained controls.
- No visualizer mode should cover the titlebar, toolbar, window controls or video controls.
- The video tab remains independent and must not lose its selected file or object-URL cleanup when switching modes.

## Delivery phases

1. **Foundation:** mode registry, grouped selector, previous/next/random controls, preference persistence, visibility-aware render lifecycle.
2. **Classic analyzers:** Spectrum Analyzer, Oscilloscope, Spectrogram and safe mono/stereo scope behavior.
3. **WMP-style collection:** Bars & Waves, Mystify, Particles, Spikes and Battery/Pulse.
4. **Experimental renderer:** original Milkdrop-inspired procedural mode and a small curated preset set.
5. **Polish:** fullscreen, palette/sensitivity/smoothing controls, keyboard navigation, reduced-motion handling and responsive canvas sizing.

## Acceptance

- Each mode visibly differs and reacts to actual audio samples; no mode is merely a renamed copy of the same bars.
- Test bass-heavy, speech, quiet, paused, stopped, short and long tracks.
- Verify no analyser loop continues while the fourth window is hidden or video mode is active.
- Verify resize, fullscreen, device-pixel-ratio changes, narrow viewport, touch and keyboard use.
- Verify no audible change, no duplicate audio playback, no EQ/controller/playlist regressions.
- Verify no React render loop or per-frame component-tree churn.
- Browser screenshots and interaction tests are required before marking any phase Verified.
