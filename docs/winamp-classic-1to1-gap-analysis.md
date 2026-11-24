# Winamp Webamp Classic — 1:1 reference reconstruction

**Status:** active visual-fidelity specification and gap register  
**Reference:** user-supplied original Winamp 2.x screenshot (267 × 422 px; rendered player width corresponds to canonical 275 px Winamp module width).  
**Scope:** Webamp Classic renderer only. Dev Alpha and imported .wsz skins are isolated and must not regress.

## Reference geometry

| Module | Outer geometry | Required hierarchy |
|---|---:|---|
| Main | 275 × 116 px | 14 px title strip; display/analyzer and track metadata; seek bar; compact volume/balance row; six transport buttons; Shuffle and Repeat |
| Equalizer | 275 × 116 px | 14 px title strip; ON/AUTO; narrow EQ curve; PRESETS; Preamp + 10 faders; dB scale |
| Playlist | 275 × 232 px | 14 px title strip; black list viewport; green track names/right-aligned durations; narrow scrollbar; one compact footer with ADD / REM / SEL / MISC, elapsed/total LCD, tiny status controls and LIST OPT |

All three modules share one left edge and meet vertically with no visual gaps. Their borders, title bars and inset content frames must read as one original Winamp stack.

## Pixel-level target

### Main
- Dark charcoal chassis, thin double/bevelled edges, black inset LCD/analyzer.
- Titlebar: Winamp lightning mark, centered WINAMP wordmark, metallic rules and tiny minimize, shade and close controls.
- Left display: vertical mode labels and green play indicator beside segmented green elapsed time.
- Analyzer: black recessed field, fine green baseline/grid and narrow yellow-to-green spectrum columns with peaks.
- Right display: single-line black marquee with bright green track text; bitrate/sample-rate readouts and mono/stereo indicators below.
- Separate thin seek rail; compact volume and balance on one line; EQ and PL buttons at right.
- Exactly Previous, Play, Pause, Stop, Next and Eject transport buttons. Shuffle and Repeat are the only mode toggles. Extra NEXT/auto-advance and album-art tile are not part of the reference faceplate.

### Equalizer
- Same chassis/titlebar and exact 275 × 116 px geometry.
- Top rail contains only ON, AUTO, curve and PRESETS. PRESETS is a menu trigger, not a permanently expanded project toolbar.
- Preamp plus ten frequency faders: 70, 180, 320, 600, 1K, 3K, 6K, 12K, 14K, 16K. Range -12 dB to +12 dB, labels at left.
- Narrow yellow rails, silver square handles, dark tick marks and clear zero line.
- No permanent row for preset-name input, SAVE, DEL, EQF IN/OUT or Q1 OUT. Move these project operations into PRESETS menu while preserving handlers.
- Curve remains a visual display of current EQ state; preserve EQ values, DSP, preset persistence and import/export logic.

### Playlist
- Same 275 px chassis, 14 px titlebar, black recessed list and bevelled frame.
- Bright green monospaced text, compact line rhythm; current track white; durations right-aligned.
- Narrow scrollbar aligned to the list's right edge.
- One compact footer. Primary buttons: ADD, REM, SEL, MISC. MISC contains clear selection, M3U import/export, skin import/reset and local-library utilities.
- LIST OPT is a separate right-aligned menu trigger for playlist display/behavior options.
- Small black-and-green elapsed/total LCD and tiny status/transport indicators.
- No permanent second row for M3U, skin, reset or other management actions. Status feedback must not distort the reference silhouette.

## Confirmed source-to-reference gap register

This register is based on current main source and the supplied reference image, not on a browser screenshot of the live build.

### Main
- [x] Removed NEXT/auto-advance from the visible Classic transport row; retained the control in Dev Alpha and its existing controller setting.
- [x] Hidden the project-only mini album-art preview in Webamp Classic (corrected the selector to target its actual sibling position in Main).
- [x] Removed the project-only settings gear from the Classic Main titlebar; Player Settings is now reachable from Playlist MISC.
- [ ] Verify titlebar chrome/wordmark and display proportions, analyzer position and metadata alignment.
- [ ] Reconcile transport spacing and bevels to the six-button reference row.
- [ ] Verify volume/balance/EQ/PL fit the compact row without wrapping.

### Equalizer
- [x] Hid the permanent preset-management rail in Classic and moved preset selection, naming, SAVE/DEL, EQF IN/OUT and Q1 OUT into the PRESETS dropdown.
- [x] Q1 OUT is inside PRESETS; the visible EQ top rail is limited to ON/AUTO, curve and PRESETS.
- [x] Added explicit 275 × 116 px outer geometry and 100 px content budget for the Classic Equalizer; the 13 px top rail and fader panel now share the available height. Visual confirmation of all 11 faders remains open.
- [ ] CSS contains successive overrides for the same EQ selectors; consolidate final Classic-only faceplate rules after visual verification.
- [ ] Match yellow rails, silver square handles, dB labels, frequency labels and spacing.

### Playlist
- [x] Classic Playlist primary controls are ADD / REM / SEL / MISC and LIST OPT; MISC contains selection clearing, M3U import/export and skin import/reset.
- [x] Classic footer is a single compact row with elapsed/total LCD and a small status indicator. Dev Alpha and .wsz retain the legacy footer.
- [ ] Visually confirm list viewport height, black field, green text, current-track white text, right-aligned durations and narrow scrollbar after the fixed 232 px stack geometry pass.
- [ ] Keep resize support without a prominent default resize handle.

## Interaction and compatibility requirements

- The visible faceplate must be reference-faithful; non-original project functions are moved into contextual menus/settings, not deleted.
- Preserve playback, shortcuts, playlist contents/selection, volume/balance, shuffle/repeat, EQ values, DSP, preset storage, EQF/Q1 import/export, M3U import/export, local audio persistence, skin import/reset, windowshade and window drag/resize.
- Every hidden action needs a discoverable keyboard-accessible menu entry with accurate label and accessible name.
- Menus close on outside click and Escape; opening one closes another. Menus must not start window dragging.
- All new selectors stay under .wa-shell--webamp-classic. Do not alter Dev Alpha or imported .wsz sprite backgrounds/inline artwork.
- Preserve canonical initial geometry and stack alignment. Narrow-viewport fitting must not alter desktop reference geometry.

## Verification checklist

- [ ] Static audit: added Classic selectors scoped; no duplicate visible copies of moved actions; menu entries call existing handlers.
- [ ] Geometry audit: main 275 × 116, EQ 275 × 116, playlist 275 × 232; zero inter-window gap.
- [ ] Build/typecheck and GitHub Actions complete successfully.
- [ ] Browser visual comparison at native 275 px width against supplied screenshot.
- [ ] Interaction QA: menus, outside click, Escape, keyboard focus, playlist actions, EQ preset save/delete/import/export, M3U and skin actions.
- [ ] Regression QA: Dev Alpha and an imported .wsz skin retain previous appearance/behavior.

## Implementation log

- 2026-11-24: Created this standalone reference specification and gap register from the user-provided screenshot and current main source. Source-confirmed differences are distinguished from browser-only checks still requiring a running build.


## Progress log — 2026-11-24 (first correction pass)
- Main: removed NEXT from the Classic faceplate while keeping the feature in non-Classic modes; the extra album-art preview remains hidden in Classic.
- Equalizer: replaced the permanent preset selector/action rail with a PRESETS dropdown containing current preset selection, custom preset naming, SAVE, DEL, EQF IN, EQF OUT and Q1 OUT. Existing handlers and EQ state are reused.
- Playlist: Classic now has ADD / REM / SEL / MISC plus LIST OPT in a single footer row. MISC contains clear-selection, M3U import/export and .wsz import/reset. Elapsed/total remains visible; status details collapse to a small indicator/title.
- Compatibility: legacy Playlist footer remains in the non-Classic branch. New CSS is scoped to `.wa-shell--webamp-classic`.
- Menu behavior: native disclosure menus share one exclusive group and support Escape dismissal. Menus also dismiss when focus leaves the menu; pointer-only outside-click behavior still needs browser verification.
- Still open: pixel-accurate chassis/titlebars, display and fader geometry, scrollbar and native footer detail; full browser comparison, build and regression tests are not yet confirmed.


## Progress log — 2026-11-24 (geometry pass 2)
- Corrected the album-art hide selector: the artwork is a sibling of the transport row, so the previous descendant selector could never match it.
- Main and Equalizer now have explicit 275 × 116 px outer boxes; Main content is budgeted to 100 px beneath the titlebar, and the EQ content is budgeted to 100 px with a 13 px control rail.
- Playlist keeps its 275 px width and 232 px minimum height, with a fixed 14 px titlebar, flexible black list viewport and a 21 px single-row footer.
- This is a source/CSS geometry pass only. It does not prove pixel alignment in a browser; native-size visual comparison and responsive viewport testing remain outstanding.

- Main titlebar correction: hid the extra settings gear from the Classic faceplate and moved its shortcut into MISC, retaining access to appearance selection and settings.


## Progress log — 2026-11-24 (faceplate detail pass 3)
- Main: tightened the LCD/analyzer/metadata column proportions, set the display's three-row metadata rhythm, and refined the seek, volume/balance and six-button transport rails to remain inside the 100 px content budget.
- Equalizer: extended the fader rails to use the available 63 px vertical area, added the yellow center reference line and silver square slider caps for WebKit and Firefox, and tightened the frequency labels.
- Playlist: applied a black inset viewport, green monospaced rows, white current-track text, right-aligned durations and a narrow native scrollbar treatment.
- All additions are scoped to `.wa-shell--webamp-classic`; no JSX state/handler or audio behavior changed in this pass.
- These are source-level styling refinements. Exact native-size appearance still requires browser screenshot comparison; no claim of pixel-perfect completion is made.

## Progress log — 2026-11-24 (CI repair and Playlist options)
- GitHub Actions run `45339977839` failed during TypeScript typecheck at `WinampPlayer.tsx:1406`: a `.catch((error) => ...)` callback declared an unused `error` parameter. The callback did not need the rejection object, so it now uses `.catch(() => ...)`; the existing fallback status message and skin reset behavior are unchanged.
- Made the Classic Playlist LIST OPT menu functional rather than showing hard-coded status text: Track durations toggles duration columns, and Playback follow toggles automatic scrolling of the current track into view.
- Both options default to ON, matching the previous displayed defaults. These options affect only the Classic Playlist presentation.
- A new CI run is required to confirm the TypeScript fix and the Playlist interaction change. Browser interaction and screenshot QA remain outstanding.

## Corrective pass — 2026-11-24 (visible EQ fader movement)
- User reported that the visual faceplate had not materially changed and EQ thumbs remained centered while changing dB.
- Root cause found in the range-control CSS: the EQ inputs were still horizontal HTML range controls placed inside narrow, tall fader boxes. Styling the box and thumb did not rotate the range axis, so the thumb's travel was constrained to the tiny horizontal width and appeared stationary.
- Corrected both PREAMP and all ten band inputs to use a true vertical range axis via `writing-mode: vertical-lr` and `direction: rtl` (minimum at bottom, maximum at top). Added explicit vertical track/thumb dimensions for Chromium/WebKit and Firefox; React state and audio controller handlers remain unchanged.
- The previous titlebar settings gear hide rule is present in the active Classic stylesheet, and the root applies the Classic scope class only when the saved appearance is `webamp-classic`. If the app remains in Dev Alpha or an imported skin, Classic-only faceplate changes will not appear.
- Pending verification: confirm the latest GitHub Actions run passes, then test real pointer movement and capture a browser screenshot at native 275 px width. This source-level fix is not yet browser-verified.


## Progress log — 2026-11-24 (Classic default)
- Webamp Classic is now the default renderer on first launch and when migrating the former `dev-alpha` default preference.
- The appearance preference is stored under `winamp:skin-appearance:v2` so a previously persisted Dev Alpha default does not silently keep the app in the non-Classic renderer.
- A previously selected imported `.wsz` skin is preserved during migration. Dev Alpha remains manually selectable; imported skins remain available.
- This also makes the Classic-only faceplate CSS and the Classic initial window stack active by default. Existing browser storage may retain the imported skin if that was the user's last explicit choice.


## Progress log — 2026-11-24 (EQ header actions)
- Moved the Q1 library export action out of the PRESETS disclosure menu and placed it directly beside PRESETS in the Classic Equalizer header row.
- Kept the action wired to the existing full-preset-library export handler; no EQ preset serialization or audio processing behavior changed.
- Applied a Classic-only 13 px button treatment so the added action fits the existing compact header row. Native browser screenshot verification remains pending.


## Progress log — 2026-11-24 (fourth window and detachable modules)
- Added a fourth independent Video / Visualization window. It opens by default beside the Main / Equalizer / Playlist stack and can be hidden or reopened with the VIS button in the Main titlebar.
- The fourth window switches between an expanded visualizer (Spectrum, Oscilloscope and Peak Meter, reusing the current player's visualizer data) and a local video viewer. Video is loaded from a file picker into a native HTML video element; object URLs are revoked when a replacement file is selected or the player unmounts.
- Added per-window attach/detach controls to Main, Equalizer, Playlist and Video / Visualization. Detached windows are excluded from connected-window drag groups; attached windows can join a group when their edges touch within the existing 8 px tolerance.
- Added magnetic edge alignment on pointer release for attached windows when the gap is within 12 px. Hidden Video / Visualization is excluded from drag-group calculations. Window positions are also initialized when switching renderer appearance.
- Added Classic-compatible styling for the fourth window, including a dark visualizer stage, audio-reactive bars/waveform, video viewport and compact mode controls.
- GitHub Actions run for source commit 20e26a33 completed successfully: context verification, TypeScript, lint, production build, build-output verification, artifact upload and GitHub Pages deployment all passed.
- Browser interaction and screenshot QA have not yet been performed. In particular, verify touch dragging, magnetic docking on narrow screens, native video playback formats, and that the fourth window does not overlap the initial three-window stack on small viewports.
- Current video loading is intentionally independent of the audio playlist; it does not yet auto-detect video entries in M3U or synchronize external video audio with the Winamp audio controller.


## Progress log — 2026-11-24 (expanded visualization design)
- Separated the compact Main LCD contract from the expanded fourth-window visualization collection. Main keeps Spectrum / Oscilloscope / Peak Meter; the fourth window is planned as a grouped mode browser.
- Defined Winamp-inspired analyzer modes (log Spectrum Analyzer, Oscilloscope, Spectrogram, Stereo Scope), WMP-style modes (Bars & Waves, Mystify, Particles, Spikes, Battery/Pulse), and an explicitly original Milkdrop-inspired experimental renderer.
- Defined shared-analyser/canvas architecture, visibility-aware animation lifecycle, mode/settings controls, persistence boundaries and audio/playback regression acceptance.
- Full design contract: `docs/winamp-visualization-modes.md`; implementation is not yet complete and no browser visual verification is claimed.
