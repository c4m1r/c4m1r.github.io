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
| Attached cursor packs (rw-designer.com, public domain per author) | Public domain (as stated by each author) | Windows 95/98, Windows 2000/XP, Windows 7/Vista, Windows 8/10 cursor sets | Windows 98 matches `eat/98.portfolio-main` for arrow, pointer, I-beam and hourglass. The user states that Windows 2000 and Windows XP share one standard cursor set; the attached `classic-1` pack is that set, and it matches the 95/98 files for most roles (byte-identical on re-check), so it is used as the 2000/XP scheme. The 95/98 set states that its hourglass was replaced by a CD, so it is not an original. The user states that Windows 8 uses the same Aero scheme as Windows 7: the attached Windows 8 pack matches `src/themes/cursors/aero` visually (alpha-masked compare, all 18 frames of each `.ani`). |
| Attached by the user (2026-11-28): Windows 11 wallpaper pack, Windows 8 wallpaper, Windows Server 2003 wallpaper, Windows 8.1 Flat Colors pack | No licence supplied | Windows 11 `img0` (default "Bloom") and 17 other wallpapers; Windows 8 default `Img0_Windows_8.jpg`; clean Server 2003 wallpaper (800×600); 84 Windows 8.1 flat icons with `.iconpackage` | Stored in `src/assets/reference/windows-misc` (not imported, apart from Windows 11 `img0`, which is wired as the Windows 11 wallpaper). The Server 2003 wallpaper is the clean original, not the watermarked copy from the reference screenshot. |

## Gaps that a public source cannot close

- Exact pixel art of the window chrome, taskbar and Start button: none of the public sources has original bitmaps for these, and the CSS libraries are reconstructions.
- Game and application screens: they need the user's screenshots (see `eat/screens/README.md`).

## Still needed (recorded 2026-11-28)

These items cannot be closed from the sources checked so far. Each one needs files from the user or a decision.

- **Ubuntu Xfce edition (decided 2026-11-28: GNOME and Xfce are two editions of the Ubuntu profile, chosen with E in GRUB).** Done: the Xfce edition uses the xfce-look cursor set (`win95-xfce`, 4 roles). Still needed: the Xfce panel, the Xfwm window frames, the Greybird or Xfce icon theme and Xfce wallpapers. The X11 Xcursor set covers cursors only.
- **Ubuntu GNOME edition (decided 2026-11-28).** The GNOME edition is the default Ubuntu look and keeps the browser cursor. Still needed for a full GNOME shell: the Adwaita or Yaru shell look (top bar, dock, window frames), the full Yaru icon theme (we have 44 of its icons), the Yaru wallpapers and the GNOME sound theme.
- **Windows 2000 cursor scheme.** Closed by the attached `classic-1` pack (the user states that 2000 and XP share it). Not yet checked against a screenshot with the cursor visible.
- **Windows 8 skin.** Wallpaper (`win8-daisy.jpg`) and the Aero cursor set are available. Still needed: the Windows 8 system icons, to compare with the 8.1 flat icons. If they differ, Windows 8 and 8.1 become two editions of the Windows 8 profile, chosen with E in GRUB (as Vista's editions are). Also needed: a skin root class for Windows 8 (none exists yet).
- **Windows 11 wallpaper.** Closed: `img0` is wired. Windows 11 icons and the other 17 wallpapers are stored for reference.
- **Windows Server 2003 wallpaper.** Closed: the clean original is stored. Wiring it needs a server2003 wallpaper override, since the profile uses the Windows XP theme.
- **Windows 8/10 and 11 quick settings.** The donor has no Windows 11 quick settings; the Windows 11 panel reuses the Windows 10 layout.

## Next steps

1. Add the 41 missing Win98 source icons to the Win98 set if they are used by the Win98 Explorer (check directory and printer icons first).
2. Compare the user's screenshots with the current build and record each difference in `docs/tasks.md` before changing anything.
