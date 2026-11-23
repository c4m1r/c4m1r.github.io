# Reference cache — OS 1:1 work

Working notes so findings are not lost between sessions. Read this before any OS design task.
Active task registry: `docs/tasks.md`. Completed records: `docs/history.md`.

## Rules (standing)
- Work only on `main`. Commit and push on `main` after each finished item (`git fetch`, `git rebase origin/main`, `git push origin main`). Never force-push.
- `eat/` is the reference material. Take media (GIF, PNG, ICO, CUR, WAV) from there or from the user's attachments; rewrite code by hand, never copy code from `eat/`.
- Canonical behaviour beats our own guesses. Check the reference before changing a size, colour or position.

## Reference locations
- Attachments (user uploads): `/mnt/user-data/attachments/<session>/...`. Screenshots are often scaled down.
- `eat/screens/oc/win98/` — Windows 98 screenshots (Start menu, desktop).
- `eat/screens/oc/win2000/` — Windows 2000 boot GIFs (professional loading, server family loading, startup desktop).
- `eat/windows2000-main/` — a third-party Windows 2000 web clone. Useful for media:
  - `src/assets/ICON/*.ico` (431 shell icons), `start.png`, `start_down.png`, `start_menu.png`, `taskbar.png`, `startMenu_arrow.png`, `startMenu_separator.png`, `notifications_*.png`, `mouse.png`, `sprites/`.
  - It has no Windows 2000 `.cur` cursors and no quick-launch row (notepad, Internet Explorer, show desktop).
- `eat/98.portfolio-main/public/cursors/` — the only `.cur` set in the repo (Windows 98: arrow, pointer, ibeam, hourglass).

## Scaling
- The 640×480 and 800×600 reference screenshots are scaled by about 0.78. Their pixel sizes are not native.
- Native Windows 2000 values used: 28 px taskbar, 22 px Start button, 32 px top-level menu rows, 32 px top-level icons, 21 px banner.
- Measured on the 640×480 reference: taskbar face `#d4d0c8`, Start button about 16 px tall at that scale.

## Decisions
- **Windows 2000 Server Family splash.** Advanced Server and Datacenter use it as their loading screen for now (temporary, agreed).
- **Post-logon welcome.** The XP-style blue welcome (`WelcomeScreen`) is shown only by the `webos` theme. Windows 98 and 2000 (and other skins routed through WebOS) go straight to the desktop after `preloadThemeAssets` finishes, showing the wallpaper meanwhile. Win XP and Win 7 have their own flows.
- **Language flag.** Lives at the left edge of the tray, before the other tray icons and the speaker (`TaskbarSystemArea` `languageSlot`). It is not in the taskbar body.
- **Windows 2000 taskbar face.** `#d4d0c8`, scoped as `.os-classic .taskbar.theme-win2000` in `classic.css`. The shared `.taskbar-98` grey would otherwise win.

## Open items and what is missing
- Windows 2000 cursors: no canonical `.cur` set found in `eat/`, on GitHub search, or in web search. Do not reuse the 98 set. Needs the user's files.
- Windows 2000 quick-launch icons (notepad, Internet Explorer, show desktop): the icons are probably among `eat/windows2000-main/src/assets/ICON/*.ico`, but the IDs are not identified yet. Needs a visual check of each `.ico` against the reference.
- Windows 2000 top-level Start icons: needs a Start menu reference.
- Windows 95 cursors and the 98 logon "Welcome to Windows" window: no reference.

## Verification recipe (Playwright)
- Restart the preview server if `curl` returns 000: `setsid nohup npx vite preview --host 127.0.0.1 --port 4173 --strictPort` (run from the repo, in the background).
- Rebuild after CSS or TSX changes (`npx vite build`). `vite preview` serves `dist/`, so a stale build looks like a failed fix.
- GRUB flow: click "Launch GRUB", press ArrowDown, click "Windows ▸", then the profile row by a prefix regex (`^Windows 2000`, `^Windows 98`). Click OK when it appears.
- Measure with `getBoundingClientRect` and `getComputedStyle` rather than guessing from screenshots.
- A classic-skin rule can be overridden by `.os-classic .taskbar` or `.taskbar-98`. Raise specificity or scope to the theme class before concluding a rule does nothing.
