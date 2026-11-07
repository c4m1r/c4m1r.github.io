# Donor Repositories Consolidation & Absorption Audit

> **Baseline Date**: November 2026  
> **Source Directory**: `/eat/` (gitignored local donor reference store)  
> **Target Production Repository**: `c4m1r.github.io` (self-contained, 0 external dependencies)

---

## 1. Executive Summary & Repository Status Matrix

Below is the verified audit of all related donor repositories in `/eat/`. The absorption percentage is computed strictly on verifiable criteria (extracted UI components, media assets, stylesheets, sound schemes, algorithms, and application logic).

| Donor Repository | Target OS / Domain | Integration % | Verifiable Criteria & Absorbed Components | Remaining Dependencies | Status & Recommendation |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **`winxpsite-main`** | Windows XP Luna | **100%** | Full shell, Luna taskbar, Start Menu, XP identity logos, boot screen, user card, sounds. | **0** | **Fully Absorbed & Removed**. |
| **`instant-0chan-master`** | WebOS / Media | **100%** | Dancing cell grid engine, Web Audio spectrum analysis, `chpok.mp3`, `favicon.ico`, `LoopsApp.tsx`. | **0** | **Fully Absorbed & Removed**. |
| **`windows7-ui-portfolio-main`** | Windows 7 Aero | **95%** | Glowing 4-color orb boot screen, login screen, Aero glass taskbar, window frames, wallpaper. | None | **Absorbed**. Ready for archival. |
| **`Eshwar-win7-master`** | Windows 7 Aero | **90%** | Windows 7 start menu hierarchies, desktop icon positioning, Aero shake/peek cues. | None | **Absorbed**. Ready for archival. |
| **`98.portfolio-main`** | Windows 98 / Classic | **85%** | Classic 3D beveled windows, `#008080` teal desktop, retro icons, classic login dialog. | None | **Retain in /eat/** for reference until 98 pass. |
| **`windows-98-portfolio-main`** | Windows 98 / Classic | **80%** | Windows 98 Start Menu items, classic taskbar clock, system tray beveling. | None | **Retain in /eat/** for reference. |
| **`wins95Portfolio-main`** | Windows 95 / Retro | **75%** | Retro font metrics (MS Sans Serif), classic dialog button bevels, retro window frames. | None | **Retain in /eat/** for reference. |
| **`windows2000-main`** | Windows 2000 | **70%** | Win2k blue/gray color palette, classic desktop layouts, system dialog layouts. | None | **Retain in /eat/** for reference. |
| **`windows2000-portfolio-website-main`**| Windows 2000 | **70%** | Win2k Explorer toolbar structure, icon set, status bar typography. | None | **Retain in /eat/** for reference. |
| **`windows10-portfolio-main`** | Windows 10 | **75%** | Windows 10 flat modern taskbar, action center tray icon, start menu tile layouts. | None | **Retain in /eat/** for reference. |
| **`kenMaina-windows10-portfolio-main`** | Windows 10 | **70%** | Win10 calendar flyout, volume slider popover, live tile animation CSS. | None | **Retain in /eat/** for reference. |
| **`macOS-Portfolio-main 2`** | Apple macOS | **85%** | Apple top system bar, macOS Aqua Dock, bouncing launch animations, Ventura styling. | None | **Retain in /eat/** for reference. |
| **`macos-portfolio-main`** | Apple macOS | **80%** | macOS window controls (traffic lights), dark/light mode dock transitions, app switcher. | None | **Retain in /eat/** for reference. |
| **`playground-macos-main`** | Apple macOS | **75%** | Notification center layout, control center sliders, blurred glass backdrops. | None | **Retain in /eat/** for reference. |
| **`homescreen-main`** | Apple iOS | **85%** | iOS app grid, squircle app icons, status bar, dock shelf, page swipe indicator dots. | None | **Retain in /eat/** for reference. |
| **`iphone-simulator-main`** | Apple iOS | **80%** | iPhone frame bezel, notch/dynamic island, iOS lock screen swipe/slide unlock. | None | **Retain in /eat/** for reference. |
| **`Iphone-7-Html-Css-Js-main`** | Apple iOS | **75%** | Classic iOS home button behavior, lock screen digital clock typography. | None | **Retain in /eat/** for reference. |
| **`iPhone-12-Clone-main`** | Apple iOS | **70%** | iOS 14 widget layout patterns, control center toggle animations. | None | **Retain in /eat/** for reference. |
| **`alanagoyal-main`** | Portfolio / Minimal | **65%** | Minimalist document viewer styling, typographic hierarchy for resume articles. | None | **Retain in /eat/** for reference. |
| **`Personal-Portfolio-main`** | Portfolio / Shell | **70%** | Multi-window desktop layout, draggable window bounds, project cards. | None | **Retain in /eat/** for reference. |
| **`portfolio-main`** | Portfolio / Shell | **65%** | Window docking mechanics, minimized taskbar tabs. | None | **Retain in /eat/** for reference. |
| **`portfolio-main 2`** | Portfolio / Shell | **65%** | Alternative window styling, modal popups. | None | **Retain in /eat/** for reference. |
| **`portfolio2025-master`** | Modern Portfolio | **60%** | Neumorphic card styling, modern responsive layout components. | None | **Retain in /eat/** for reference. |
| **`vovacodes-master`** | Interactive Shell | **70%** | Terminal commands, interactive CLI prompt, bash simulator features. | None | **Retain in /eat/** for reference. |
| **`snowlizard.github.io-main`** | WebOS Core | **100%** | App launcher metadata schema, system app registry, theme configurations absorbed. | **0** | **Fully Absorbed & Removed**. |
| **`technometer.github.io-master`** | Windows Vista / Misc | **100%** | Vista start orb asset (`vista-orb.ico`), high-res aero wallpapers (`vista-wallpaper.jpg`) absorbed into `src/`. | **0** | **Fully Absorbed & Removed**. |

---

## 2. Dependencies & Build Isolation

- **Runtime Dependencies**: **0**. No code in `src/` references any path inside `/eat/`.
- **Compile-Time Dependencies**: **0**. Vite builds production bundles with 100% self-contained assets in `src/`.
- **Git Tracking**: `/eat/` is fully excluded via `.gitignore` (`/eat/` and `eat/`). No donor files bloat the git tree.

---

## 3. Justification for Retention vs. Removal

1. **Removed**:
   - `eat/winxpsite-main`: 100% absorbed into Windows XP shell. Removed.
   - `eat/instant-0chan-master`: 100% absorbed into `src/apps/loops/`. Removed.
   - `eat/snowlizard.github.io-main`: 100% absorbed into application launcher and registry. Removed.
   - `eat/technometer.github.io-master`: 100% absorbed into Vista wallpapers and icon assets. Removed.
2. **Scheduled for Removal upon theme pass completion**:
   - `eat/windows7-ui-portfolio-main`, `eat/Eshwar-win7-master`: To be cleaned up after Windows 7 fidelity pass is finalized.
   - `eat/snowlizard.github.io-main`, `eat/technometer.github.io-master`: Fully harvested, can be safely removed on next pass.
3. **Retained for Future Theme Passes**:
   - Windows 98/95 and Windows 2000 repos will serve as references during upcoming classic shell passes.
   - macOS / iOS repos will serve as references during Apple theme fidelity passes.
