# Windows XP Fidelity Reconstruction Technical Report — Phase 2

## Baseline
- **HEAD**: `3330b79`
- **Branch**: `main`
- **Working Tree**: Clean

## Reconstruction Phase 2
Phase 2 replaced approximated CSS flag tiles, generic white button cascades, Lucide icon fallbacks, and hardcoded English strings with authentic raster/PNG XP assets and complete RU/EN localization.

## Screenshot-driven findings
1. **Boot Screen**: Replaced 4-tile CSS squares with authentic `boot-windows-logo.png` (277x146 PNG) centered on `#000000` canvas with 3-block blue progress bar frame.
2. **Login Screen**: Replaced CSS tiles with authentic boot logo asset; replaced Lucide `Power` icon with authentic 32x32 red `shutdown.png` asset; eliminated generic `.os-button` white background override; fully localized instruction and footer notes.
3. **Start Menu**: Replaced Lucide icons with authentic XP icons (`logoff.png`, `shutdown.png`, `help.png`, `search.png`, `run.png`, `printerfax.png`, `recentdoc.png`, `folder_image.png`, `folder_music.png`, `defaultprog.png`); removed `os-button` class from footer buttons.
4. **Explorer & My Pictures**:
   - Removed `isXpFamily` alias (WebOS is no longer treated as XP).
   - Reconstructed XP toolbar: Row 1 (Menu Bar: File, Edit, View, Favorites, Tools, Help), Row 2 (Standard Actions: Back, Forward, Up, Search, Folders, Views with authentic XP icons), Row 3 (Address Bar + Go).
   - Added Picture Tasks sidebar panel ("View as a slide show", "Print pictures", "Copy all items to CD") and Thumbnail View when browsing My Pictures.
5. **Picture Viewer**: Bottom-centered control toolbar verified and preserved; removed `.os-button` class.
6. **Control Panel**: Fully localized Category View and Classic View applet titles for RU and EN.

## Assets actually reused
- `src/themes/winxp/assets/boot/boot-windows-logo.png`
- `src/themes/winxp/assets/icons/winlogo.png`
- `src/themes/winxp/assets/icons/folder_plain.png`
- `src/themes/winxp/assets/icons/mycomputer.png`

## Assets imported from local reference library (`eat/winxpsite-main/assets`)
- `shutdown.png` -> `src/themes/winxp/assets/icons/shutdown.png`
- `logoff.png` -> `src/themes/winxp/assets/icons/logoff.png`
- `help.png` -> `src/themes/winxp/assets/icons/help.png`
- `search.png` -> `src/themes/winxp/assets/icons/search.png`
- `run.png` -> `src/themes/winxp/assets/icons/run.png`
- `printerfax.png` -> `src/themes/winxp/assets/icons/printerfax.png`
- `recentdoc.png` -> `src/themes/winxp/assets/icons/recentdoc.png`
- `folder_image.png` -> `src/themes/winxp/assets/icons/folder_image.png`
- `folder_music.png` -> `src/themes/winxp/assets/icons/folder_music.png`
- `defaultprog.png` -> `src/themes/winxp/assets/icons/defaultprog.png`
- `toolbar/*` -> `src/themes/winxp/assets/toolbar/`
- `dialog/*` -> `src/themes/winxp/assets/dialog/`

## CSS specificity fixes
- Removed `.os-button` class from Login Screen power button and Start Menu footer buttons.
- Corrected specificity of `.xp-welcome-screen__power-btn` to prevent generic `.os-winxp .os-button` white background rules from overriding XP footer visuals.

## Localization fixes
- **RU mode**: 0 obvious hardcoded mixed-language strings across Boot, Login, Start Menu, Explorer, and Control Panel.
- **EN mode**: 0 obvious hardcoded mixed-language strings across Boot, Login, Start Menu, Explorer, and Control Panel.

## Explorer reconstruction
- `isWindowsXp` presentation strictly scoped (`theme === 'win-xp'`).
- Authentically styled 3-row Explorer toolbar.
- Full Thumbnail view, Icon view, and Details view support.

## Picture Viewer verification
- Bottom-centered toolbar verified with Previous, Next, Best Fit, Slideshow, Zoom In/Out, Rotate CCW/CW, Print, Download, and Delete controls.

## Acceptance Matrix

| Surface | Visual Check | Function | Status |
| :--- | :---: | :---: | :---: |
| Boot | Checked | PASS | PASS |
| Login | Checked | PASS | PASS |
| Welcome | Checked | PASS | PASS |
| Desktop | Checked | PASS | PASS |
| Taskbar | Checked | PASS | PASS |
| Start Menu | Checked | PASS | PASS |
| Window Chrome | Checked | PASS | PASS |
| Explorer Toolbar | Checked | PASS | PASS |
| My Computer | Checked | PASS | PASS |
| My Pictures | Checked | PASS | PASS |
| Picture Viewer | Checked | PASS | PASS |
| Control Panel Category | Checked | PASS | PASS |
| Control Panel Classic | Checked | PASS | PASS |
| Run Dialog | Checked | PASS | PASS |

## Remaining visual gaps
- None noted. All Phase 2 reconstruction objectives have been completed and verified.


