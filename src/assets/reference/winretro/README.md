# WinRetro reference media

Source: https://github.com/erfg12/WinRetro_Themes (the `WIN XP THEME`, `WIN VISTA THEME` and `WIN 9X THEME` folders).

Kept as reference for the detailed OS skins. Nothing here is imported by the app, so the bundle does not grow.

- `winxp/`, `winvista/`, `win9x/` — one folder per theme pack, each with
  - `sounds/` — system sounds (WAV) that are not yet in `src/assets/os-sounds`,
  - `wallpapers/` — desktop wallpapers (JPG and PNG) that are not yet in the project,
  - `icons/` — the `System Icons` folder of each pack (ICO files, with their original numbering).
- Skipped on purpose: BMP wallpapers (uncompressed copies of the JPG ones), `.scr` screen savers (Windows executables), and files that are byte-identical to the project or to `eat/`.
- Names are lower-cased and hyphenated; a duplicate name gets a short hash suffix.
- Licence: the repo has no licence file, so the source is recorded here and the files are kept as-is.

## eat-audio

`src/assets/reference/eat-audio/` holds the audio from `eat/` that the project does not have (19 files, 8.8 MB): the Windows 98, Windows 7 and Windows 95 startup and chime clips, the macOS and iOS sounds, and a few songs and memes. Names are `<donor folder>__<file>`. Byte-identical copies already in the project were skipped.
