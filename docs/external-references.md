# External references for 1:1 fidelity

Reference-only sources used to check the OS skins. Nothing from these repositories is copied into the site
unless it is an original OS asset that is already stored in the theme sets.

## Sources and what they cover

| Source | Licence | What it gives us | Result of the check |
|---|---|---|---|
| `matthewmx86/WinClassic_icons` (Redmond97 GTK theme, `Source Icons/w98`, `Source Icons/w2k`) | No LICENSE file in the repository (README: a Chicago95 derivative with Win98/Win2K icons) | Original-style icon sources, Win98 and Win2K | Win98: 586 of 627 source names already in the site's Win98 manifest; 41 missing, mostly `directory_*` and printer variants. Win2K: no Calculator, Outlook or Minesweeper icons; these fall back to the Win98 set on Win2000, as coded. |
| `jdan/98.css` | MIT (Jordan Scales) | Measured Win98 chrome values | Title bar: site uses 18 px height, `#000080 → #1084d0` gradient, 2 px frame, `#c0c0c0` window background. These match the reference. |
| `botoxparty/xp.css` | MIT (Adam Hammad, Jordan Scales) | Measured XP window values | Window background `#ece9d8` matches the site's XP token. Luna title bar is image-based in the reference, so it cannot be checked by colour alone. |
| `McNultyyy/Windows-95-Cursor-Icons` (credit: david, xfce-look) | No LICENSE file | 56 X11 Xcursor files, converted to 32 px PNG. A Windows 95 scheme, and a native Xcursor theme for the Ubuntu XFCE mode | Converted to `src/themes/cursors/win95-xfce` (15 roles wired, 4 active) and `all/`. The X11 names (`left_ptr`, `xterm`, `watch`) are kept in `meta.json` for XFCE. |
| `erfg12/WinRetro_Themes` | No LICENSE file | Deskthemepacks (XP, Vista, 9x): system sounds, wallpapers, `System Icons` | 1497 files stored in `src/assets/reference/winretro` (not imported). Contains no cursors. |
| `1j01/retrores` (Windows 98 cursors and icons catalog) | No LICENSE file | Windows 98 ANI/GIF cursors | Not usable here: the ANI/GIF files are Git LFS pointers, and the anonymous clone does not fetch LFS objects. Needs a read-write repository attachment to fetch them. |
| `eat/portfolio-main 2/public/themes/Yaru` | Donor folder (no licence found) | 44 Yaru icons (apps, status, system, window) | Partial Ubuntu set. Not a full GNOME icon theme. |
| Attached cursor packs (rw-designer.com, public domain per author) | Public domain (as stated by each author) | Windows 95/98, Windows 2000/XP, Windows 7/Vista, Windows 8/10 cursor sets | Windows 98 matches `eat/98.portfolio-main` for arrow, pointer, I-beam and hourglass. The Windows 2000/XP set is byte-identical to the 95/98 files for most roles, so it is not a separate 2000 scheme. The 95/98 set states that its hourglass was replaced by a CD, so it is not an original. |

## Gaps that a public source cannot close

- Exact pixel art of the window chrome, taskbar and Start button: none of the public sources has original bitmaps for these, and the CSS libraries are reconstructions.
- Game and application screens: they need the user's screenshots (see `eat/screens/README.md`).

## Still needed (recorded 2026-11-28)

These items cannot be closed from the sources checked so far. Each one needs files from the user or a decision.

- **Ubuntu XFCE mode.** Needs an XFCE look: the panel, the window manager (Xfwm) frames and the Greybird or Xfce icon theme, and Xfce wallpapers. The X11 Xcursor set from xfce-look (`all/`) covers the cursors only. Open question: should XFCE and GNOME be two editions of the Ubuntu profile (the same mechanism as the Vista editions)?
- **Ubuntu GNOME mode.** Needs the Adwaita or Yaru GNOME shell look (top bar, dock, window frames), the full Yaru icon theme (we have 44 of its icons), the Yaru wallpapers and the GNOME sound theme. Nothing in `eat/` covers the shell itself.
- **Windows 2000 cursor scheme.** No source has a separate 2000 set. Needs the user's original 2000 `.cur` files or a screenshot with the cursor visible.
- **Windows 8 skin.** Needs its icons, wallpaper and cursor set. Only one start-screen screenshot exists (`eat/screens/oc/win8`).
- **Windows 11 wallpaper.** None in `eat/`; the Windows 7 wallpaper is used.
- **Windows Server 2003 wallpaper.** The only copy is inside the reference screenshot with a "Demonstration" watermark. A clean original is needed.
- **Windows 8/10 and 11 quick settings.** The donor has no Windows 11 quick settings; the Windows 11 panel reuses the Windows 10 layout.

## Next steps

1. Add the 41 missing Win98 source icons to the Win98 set if they are used by the Win98 Explorer (check directory and printer icons first).
2. Compare the user's screenshots with the current build and record each difference in `docs/tasks.md` before changing anything.
