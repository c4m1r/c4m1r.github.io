# Winamp Visualization Modes — design and implementation contract

Status: source implementation complete for the agreed mode set. The existing fourth window contains 14 modes, including a separate genuine MilkDrop (Butterchurn) renderer with lazy local package/preset loading, shared post-EQ audio input, preset transitions, visibility-aware RAF, WebGL context-loss handling and explicit teardown. The existing procedural MilkDrop-inspired mode remains available. The shared 60 FPS loop pauses in background tabs, resumes once on return, and remains isolated from the Winamp parent render. Browser acceptance and GPU/CPU profiling are intentionally deferred; no visual/manual test is claimed.

## Scope — existing fourth window only

There is exactly one expanded visualization surface: the already implemented square fourth window, initially 275 × 275 px, directly above Main. Do not create another window, pop-out, enlarged mode, sidecar, second visualization panel, or change the existing window geometry.

The existing fourth window already contains a visualizer stage and a local-video stage. Add selectable visualization modes inside that existing stage. Keep the titlebar, toolbar, video picker, local video playback, window drag/attach behavior and object-URL cleanup intact.

## Implementation snapshot (2026-11-25)

- The Main LCD now has its own independent three-mode state; the fourth window has a separate 14-mode state.
- The existing fourth-window `MODE` control cycles through Spectrum, Oscilloscope, Peak Meter, Alchemy, Bars and Waves, Battery, Ambience, Particle, Plenoptic, Spikes, Musical Colors, AVS, procedural MilkDrop and genuine MilkDrop (Butterchurn).
- Each added family uses an original SVG/CSS procedural renderer driven by the shared analyser arrays. WMP Alchemy layers frequency-shaped ribbons, orbital rings and a waveform core; Ambience blends several audio-shaped color fields; Particle uses a frequency-reactive orbital dot field; Plenoptic uses a perspective tunnel, frequency spokes and depth layers. AVS and procedural MilkDrop named presets now have different scene geometry, not only different CSS motion. Those procedural modes remain original interpretations, not byte-exact reproductions or compatible preset implementations. The separate Butterchurn mode is the genuine MilkDrop engine.
- The fourth-window geometry and video stage were not changed. Added CSS scene animation respects `prefers-reduced-motion`. Browser screenshots, visual tuning and regression checks are still outstanding.
- The shared analyser RAF loop is suspended on `visibilitychange` when the tab is hidden and resumed once when it becomes visible. The controller and visibility listeners are shared across Main/Fourth subscriptions and are released when the final subscriber unmounts. SVG gradient IDs are generated from the fourth visualizer's React instance ID, avoiding duplicate document-level fragment references.
- Closing the fourth module fully releases its media session: pause and detach the `<video>` source, call `load()` to reset the media element, revoke active and pending local object URLs, clear queue/source metadata, disable auto-cycle and unmount the visualizer subtree. Reopening starts in idle Visualization mode; local video files must be selected again. This avoids retaining decoded video frames, file handles and visualizer subscriptions while the module is closed.

## Main LCD versus fourth-window mode state

- Main LCD remains compact and faithful to Winamp Classic. Its existing three quick displays remain Spectrum, Oscilloscope and Peak Meter.
- The fourth window gets its own independent selected visualization mode. Switching the fourth-window mode does not change the Main LCD mode; cycling the Main LCD does not change the fourth-window mode.
- Both surfaces may read the same audio-analysis data, but presentation state is independent.
- The existing toolbar has a compact grouped picker, `MODE` cycles all 14 modes, and `RND` selects another mode in the current family (or from all modes for a singleton family).
- AVS has four named original variations (Scope, Feedback Tunnel, Rotating Geometry, Kaleidoscope); procedural MilkDrop has four (Geiss Flow, Fractal Flame, Waveform Tunnel, Psychedelic Swirl), cycled with `PSET`. Genuine MilkDrop (Butterchurn) has its own local preset pack and preset transition control.

## Canonical Winamp visualization families

### Built-in Classic analyzer
- Spectrum Analyzer
- Oscilloscope
- Peak Meter

These are already represented in the project and remain available. The expanded window may render them at its larger existing stage dimensions, but they are not separate windows.

### Winamp visualization plug-in families
- **AVS (Advanced Visualization Studio):** original preset-driven geometric / feedback scenes. Do not claim binary plugin compatibility or AVS preset-file compatibility.
- **MilkDrop-inspired (procedural):** original in-project fluid, beat-reactive geometric scenes; no original MilkDrop engine or preset compatibility is claimed.
- **MilkDrop (Butterchurn):** genuine MilkDrop-compatible rendering through the pinned Butterchurn 2.6.7 engine and local `butterchurn-presets` pack. This is a separate mode, loaded only when selected. It reuses the shared post-EQ Winamp audio node, does not create a second audible route, and explicitly tears down its audio branch, RAF and WebGL2 context when the mode/window is released.

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
4. **Winamp plug-in modes:** original AVS and procedural MilkDrop-inspired scenes plus the separate genuine Butterchurn MilkDrop engine and local preset pack.
5. **Polish:** randomization, reduced-motion handling, auto-cycle, responsive rendering, hidden-tab pause and WebGL teardown are implemented. Browser acceptance and performance profiling are deferred.

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


## MilkDrop .milk import — HLSL translation pass (2026-11-26)

- Added lazy HLSL-to-GLSL conversion for numbered MilkDrop 2 \`warp_N\` and \`comp_N\` shader blocks using the MIT-licensed upstream \`hlslparser-js\` Emscripten/WASM parser and the upstream MIT \`milkdrop-preset-utils\` shader preparation/cleanup helpers.
- The parser is dynamically imported only when a .milk file actually contains a custom shader; ordinary presets do not pay its startup cost.
- Converted shader stages are passed to Butterchurn 2.6.7 as GLSL \`warp\` / \`comp\` shader bodies. Missing or failed stages use the local fallback and produce an explicit warning.
- HLSL conversion is not claimed as universal compatibility: unsupported HLSL constructs and Butterchurn's narrower shader runtime can still reject or visually alter individual presets.
- Added fixture coverage for numbered, out-of-order shader lines, both shader stages, malformed-shader fallback, and conversion summaries.
- Browser/GPU verification with real-world .milk files and performance measurements remain pending. The source and CI test suite must pass before this pass is considered complete.
