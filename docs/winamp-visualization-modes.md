# Winamp Visualization Modes — design and implementation contract

Status: implementation in progress. In-window renderers, grouped family picker, random action, distinct named AVS/MilkDrop scenes and optional auto-cycle are committed. The shared 60 FPS loop now stops while the document is backgrounded, resumes on return, and remains a single subscription across both visualizer surfaces. Fourth-window SVG gradient IDs are instance-scoped. Browser acceptance and genuine MilkDrop integration remain pending.

## Scope — existing fourth window only

There is exactly one expanded visualization surface: the already implemented square fourth window, initially 275 × 275 px, directly above Main. Do not create another window, pop-out, enlarged mode, sidecar, second visualization panel, or change the existing window geometry.

The existing fourth window already contains a visualizer stage and a local-video stage. Add selectable visualization modes inside that existing stage. Keep the titlebar, toolbar, video picker, local video playback, window drag/attach behavior and object-URL cleanup intact.

## Implementation snapshot (2026-11-25)

- The Main LCD now has its own independent three-mode state; the fourth window has a separate 13-mode state.
- The existing fourth-window `MODE` control cycles through Spectrum, Oscilloscope, Peak Meter, Alchemy, Bars and Waves, Battery, Ambience, Particle, Plenoptic, Spikes, Musical Colors, AVS and MilkDrop.
- Each added family uses an original SVG/CSS procedural renderer driven by the shared analyser arrays. WMP Alchemy layers frequency-shaped ribbons, orbital rings and a waveform core; Ambience blends several audio-shaped color fields; Particle uses a frequency-reactive orbital dot field; Plenoptic uses a perspective tunnel, frequency spokes and depth layers. AVS and MilkDrop named presets now have different scene geometry, not only different CSS motion. These remain original interpretations, not byte-exact reproductions of Microsoft / Nullsoft visualizers, original plugin engines, or compatible preset implementations.
- The fourth-window geometry and video stage were not changed. Added CSS scene animation respects `prefers-reduced-motion`. Browser screenshots, visual tuning and regression checks are still outstanding.
- The shared analyser RAF loop is suspended on `visibilitychange` when the tab is hidden and resumed once when it becomes visible. The controller and visibility listeners are shared across Main/Fourth subscriptions and are released when the final subscriber unmounts. SVG gradient IDs are generated from the fourth visualizer's React instance ID, avoiding duplicate document-level fragment references.

## Main LCD versus fourth-window mode state

- Main LCD remains compact and faithful to Winamp Classic. Its existing three quick displays remain Spectrum, Oscilloscope and Peak Meter.
- The fourth window gets its own independent selected visualization mode. Switching the fourth-window mode does not change the Main LCD mode; cycling the Main LCD does not change the fourth-window mode.
- Both surfaces may read the same audio-analysis data, but presentation state is independent.
- The existing toolbar has a compact grouped picker, `MODE` cycles all 13 modes, and `RND` selects another mode in the current family (or from all modes for a singleton family).
- AVS has four named original variations (Scope, Feedback Tunnel, Rotating Geometry, Kaleidoscope); MilkDrop has four (Geiss Flow, Fractal Flame, Waveform Tunnel, Psychedelic Swirl), cycled with `PSET`.

## Canonical Winamp visualization families

### Built-in Classic analyzer
- Spectrum Analyzer
- Oscilloscope
- Peak Meter

These are already represented in the project and remain available. The expanded window may render them at its larger existing stage dimensions, but they are not separate windows.

### Winamp visualization plug-in families
- **AVS (Advanced Visualization Studio):** preset-driven geometric / feedback visualizations. Implement a small original set of AVS-inspired scenes (for example: Scope, Oscilloscope, Spectrum, Rotating Shapes, Feedback Tunnel, Color Cycle). Do not claim binary plugin compatibility or AVS preset-file compatibility unless actually implemented.
- **MilkDrop:** fluid, full-stage, beat-reactive geometric feedback scenes. Implement original MilkDrop-inspired scenes only; do not claim the original MilkDrop engine, preset compatibility, or bundled third-party plugin support.

Winamp's official product documentation identifies AVS and MilkDrop 2 as its visualization plug-ins and describes manual/random preset switching and fullscreen use.

## Canonical Windows Media Player families

The mode picker should use recognizable original WMP names and keep their family identity visible:

### WMP 9–12 core
- **Alchemy** — fluid, colorful, audio-reactive 3D-like forms and trails.
- **Bars and Waves** — spectrum bars with flowing wave/ribbon variants.
- **Battery** — a battery / charge metaphor whose level and glow respond to audio.

### Legacy WMP 7–10 collection
- **Ambience** — slow atmospheric color fields and flowing forms.
- **Particle** — particle field / dot-plane movement driven by the music.
- **Plenoptic** — layered depth / kaleidoscopic visual field.
- **Spikes** — sharp radial or amoeba-like forms driven by frequency and beat.
- **Musical Colors** — color-field visualization tied to level and frequency.

The legacy modes are historical WMP visualizations, not all present in later WMP versions. Show them under a clearly labeled legacy group rather than implying every version shipped them.

## Interaction and mode navigation

- Compact selector grouped as: Winamp Classic, Winamp AVS, Winamp MilkDrop-inspired, Windows Media Player, Windows Media Player Legacy.
- Previous / next mode cycles within the current group; group switching is explicit.
- Random mode chooses another mode in the active group without immediately repeating the current mode.
- Optional auto-cycle is off by default; when enabled it advances every 15 seconds and pauses while the fourth window is hidden/shaded, Video is active, or the browser tab is backgrounded.
- The current mode name is visible unobtrusively inside the stage.
- Preserve the existing compact square window. No full-screen-only controls, new panels or oversized settings UI are required for this task.
- If basic tuning is useful, keep it to a compact palette / sensitivity / motion control row and avoid obstructing the visualizer.

## Fullscreen stage controls

- Double-click the fourth window's video / visualization stage, or double-tap it on touch devices, to enter fullscreen. The existing fourth window is promoted; no second window or pop-out player is created.
- In fullscreen, mouse movement or a single touch reveals a translucent bottom transport panel. It hides after 3 seconds when the pointer is outside the panel; hovering the panel keeps it visible.
- The panel provides -5s / +5s seeking, previous / next Winamp playlist track, play / pause, mode switching and fullscreen exit. Seeking targets the local video when Video is active and the current Winamp audio track when Visualization is active. When Video is active, OPEN VIDEO accepts multiple local files as a temporary in-session queue; previous / next and end-of-file advance within that queue, while Visualization mode uses the Winamp audio playlist.
- Keyboard controls while fullscreen: Left / Right seek 5 seconds; Up / Down select previous / next Winamp playlist track; Space toggles playback; M switches to the next visualization mode (or returns from Video to Visualization); Escape always exits fullscreen.
- Press F while a Winamp window is active to open the fourth stage in fullscreen (when the fourth window is visible). The shortcut is ignored while an editable field has focus.
- Native Fullscreen API is preferred, with a viewport-fixed fallback for browsers that do not expose it. Preserve the local video URL and playback element while entering / leaving fullscreen.
- The fourth window's normal dimensions and attached-window layout remain unchanged outside fullscreen.

## Audio data and rendering

- Use the existing shared Web Audio analyser; do not create a second audio engine or duplicate playback.
- Reuse the existing audio analysis loop where possible. Do not introduce React state updates for every animation frame.
- Canvas or SVG rendering may be used within the current stage; choose based on the effect and keep resource use suitable for a 275 px square viewport.
- Stop expensive animation work when the fourth window is hidden or when its Video stage is active.
- When playback is paused/stopped, analyzers decay naturally; ambient procedural modes may continue at a restrained idle rate.
- Do not fabricate stereo channel separation if the existing analyser exposes only merged channel data.
- No remote assets, cloud APIs, mandatory external libraries or imported plugin binaries.

## Visual direction

- Preserve the current fourth-window square dimensions and existing Winamp Classic chrome.
- Winamp analyzer modes should retain recognizable analyzer conventions: black stage, distinct bands, peak hold and restrained phosphor-like color.
- AVS/MilkDrop-inspired modes may be more experimental, colorful and fluid, but should remain visually distinct from the WMP collection.
- WMP modes should reproduce their characteristic visual grammar and motion, not just rename generic particles or bars.
- No mode may cover the titlebar, toolbar, video picker or window controls.
- Switching between visualizer and video must preserve the selected local video and cleanup behavior.

## Delivery phases

1. **State and selector:** decouple fourth-window mode from Main LCD; completed independent state, grouped family picker, full MODE cycle, RND action, named AVS/MilkDrop variants and optional 15-second AUTO cycle.
2. **WMP core:** Alchemy, Bars and Waves, Battery.
3. **WMP legacy:** Ambience, Particle, Plenoptic, Spikes, Musical Colors.
4. **Winamp plug-in-inspired:** original AVS-style and MilkDrop-inspired scenes with a small set of named presets.
5. **Polish:** randomization and reduced-motion handling are implemented; optional auto-cycle, responsive rendering and audio/performance acceptance remain.

## Acceptance

- No new window, no enlarged visualization layout and no change to the current fourth-window geometry.
- Main LCD and fourth-window mode selections are independent.
- Every named mode has visibly distinct motion and reacts to actual audio samples.
- WMP core and legacy modes are labeled accurately; AVS / MilkDrop inspiration is not misrepresented as original plugin compatibility.
- Test bass-heavy, speech, quiet, paused, stopped, short and long tracks.
- Verify no expensive animation loop while fourth window is hidden or in Video mode.
- Verify switching modes does not interrupt video playback or leak object URLs.
- Verify no audible change, no duplicate audio playback, no EQ/controller/playlist regressions.
- Browser screenshots and interaction tests are required before marking any phase Verified.

## Reference notes

- Winamp Help Center: Winamp desktop player lists AVS and MilkDrop 2 as visualization plug-ins and describes classic analyzer options.
- Windows Media Player history: Alchemy, Bars and Waves, Battery are the later core set; Ambience, Particle, Plenoptic, Spikes and Musical Colors belong to earlier WMP generations.
