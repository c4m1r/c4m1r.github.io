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
- [ ] Current markup includes an extra NEXT/auto-advance button beside Shuffle/Repeat; remove it from the visible Classic row and expose the setting through player settings.
- [ ] Current markup includes a mini album-art preview; hide it in Webamp Classic.
- [ ] Verify titlebar chrome/wordmark and display proportions, analyzer position and metadata alignment.
- [ ] Reconcile transport spacing and bevels to the six-button reference row.
- [ ] Verify volume/balance/EQ/PL fit the compact row without wrapping.

### Equalizer
- [ ] Permanent preset rail currently contains preset-name input, SAVE, DEL, EQF IN and EQF OUT. Remove it from the always-visible faceplate.
- [ ] Q1 OUT was moved into the top row, but reference top rail only has ON/AUTO, graph and PRESETS. Move Q1 OUT into PRESETS menu.
- [ ] Fit graph/preset rail and fader panel into strict 275 × 116 px geometry; all 11 faders and labels must remain visible.
- [ ] CSS contains successive overrides for the same EQ selectors; consolidate final Classic-only faceplate rules after visual verification.
- [ ] Match yellow rails, silver square handles, dB labels, frequency labels and spacing.

### Playlist
- [ ] Current markup exposes CLR SEL as a fourth primary action and a second tools row with M3U IN/OUT, SKIN IN, optional RESET and LIST OPT. Replace with ADD / REM / SEL / MISC and LIST OPT; move extra operations into menus.
- [ ] Rebuild footer as one compact row; retain elapsed/total LCD and tiny status controls without extra toolbar height.
- [ ] Match list viewport height, black field, green text, current-track white text, right-aligned durations and narrow scrollbar.
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
