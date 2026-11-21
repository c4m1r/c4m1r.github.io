# External references for 1:1 fidelity

Reference-only sources used to check the OS skins. Nothing from these repositories is copied into the site
unless it is an original OS asset that is already stored in the theme sets.

## Sources and what they cover

| Source | Licence | What it gives us | Result of the check |
|---|---|---|---|
| `matthewmx86/WinClassic_icons` (Redmond97 GTK theme, `Source Icons/w98`, `Source Icons/w2k`) | No LICENSE file in the repository (README: a Chicago95 derivative with Win98/Win2K icons) | Original-style icon sources, Win98 and Win2K | Win98: 586 of 627 source names already in the site's Win98 manifest; 41 missing, mostly `directory_*` and printer variants. Win2K: no Calculator, Outlook or Minesweeper icons; these fall back to the Win98 set on Win2000, as coded. |
| `jdan/98.css` | MIT (Jordan Scales) | Measured Win98 chrome values | Title bar: site uses 18 px height, `#000080 → #1084d0` gradient, 2 px frame, `#c0c0c0` window background. These match the reference. |
| `botoxparty/xp.css` | MIT (Adam Hammad, Jordan Scales) | Measured XP window values | Window background `#ece9d8` matches the site's XP token. Luna title bar is image-based in the reference, so it cannot be checked by colour alone. |

## Gaps that a public source cannot close

- Exact pixel art of the window chrome, taskbar and Start button: none of the public sources has original bitmaps for these, and the CSS libraries are reconstructions.
- Game and application screens: they need the user's screenshots (see `eat/screens/README.md`).

## Next steps

1. Add the 41 missing Win98 source icons to the Win98 set if they are used by the Win98 Explorer (check directory and printer icons first).
2. Compare the user's screenshots with the current build and record each difference in `docs/tasks.md` before changing anything.
