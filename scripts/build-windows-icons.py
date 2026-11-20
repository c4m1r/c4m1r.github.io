#!/usr/bin/env python3
"""
Build the canonical Windows icon collection used by the Windows-family skins.

Output: src/themes/windows-icons/
  <family>/<role>/<size>.png   one PNG per standard Windows size that the source allows
  <family>/<role>/icon.ico     multi-size ICO containing the same sizes
  manifest.json                role -> app -> source -> produced/skipped sizes

Rules (see docs/icon-bank-audit.md and docs/agents.md):
  * Sources are the existing canonical copies under src/themes/*. Nothing is
    imported from eat/ and no donor artwork is added here.
  * Images are only DOWNSCALED. A size larger than the source's longest edge is
    recorded as skipped in the manifest; it is never produced by upscaling.
  * Transparency is preserved (RGBA, LANCZOS resampling, centred on a square canvas).

Run: python3 scripts/build-windows-icons.py
Requires: Pillow (numpy and scipy only for the white-background knockout step)
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
OUT = SRC / "themes" / "windows-icons"

SIZES = [16, 24, 32, 48, 64, 128, 256]

W98 = "themes/win98/assets/icons"
W2K = "themes/win98/assets/icons"  # Windows 2000 variants live in the 98 archive as *_2k-4.png
XP = "themes/winxp/assets/icons"
W7 = "themes/win7/assets/icons"

# (family, role, app, source relative to src/)
ROLES: list[tuple[str, str, str, str]] = [
    # ---- Windows 98 (16/32-bit era shell artwork, native 32/48 px) ----
    ("win98", "computer", "My Computer", f"{W98}/computer_2_cool-3.png"),
    ("win98", "folder", "Folder", f"{W98}/directory_closed-4.png"),
    ("win98", "recycle-empty", "Recycle Bin (empty)", f"{W98}/recycle_bin_empty-4.png"),
    ("win98", "recycle-full", "Recycle Bin (full)", f"{W98}/recycle_bin_full-2.png"),
    ("win98", "my-documents", "My Documents", f"{W98}/directory_open_file_mydocs-0.png"),
    ("win98", "search", "Find", f"{W98}/search_computer-0.png"),
    ("win98", "internet-explorer", "Internet Explorer", f"{W98}/msie1-2.png"),
    ("win98", "outlook-express", "Outlook Express", f"{W98}/mailbox_world-2.png"),
    ("win98", "media-player", "Media Player", f"{W98}/media_player-0.png"),
    ("win98", "calculator", "Calculator", f"{W98}/calculator-0.png"),
    ("win98", "calendar", "Calendar", f"{W98}/calendar-0.png"),
    ("win98", "pictures", "Imaging (Kodak)", f"{W98}/kodak_imaging-0.png"),
    ("win98", "control-panel", "Control Panel", f"{W98}/directory_control_panel-0.png"),
    ("win98", "help", "Help", f"{W98}/help_book_computer-4.png"),
    ("win98", "terminal", "MS-DOS Prompt", f"{W98}/ms_dos-0.png"),
    ("win98", "minesweeper", "Minesweeper", f"{W98}/game_mine_1-0.png"),
    ("win98", "notepad", "Notepad", f"{W98}/document-0.png"),
    ("win98", "network", "Network Connections", f"{W98}/directory_network_conn-5.png"),
    ("win98", "volume", "Volume", f"{W98}/loudspeaker_rays-0.png"),
    ("win98", "sound", "Sounds", f"{W98}/computer_sound-0.png"),
    ("win98", "paint", "Paint", f"{W98}/paint_old-0.png"),

    # ---- Windows 2000 (native 48 px *_2k variants only; partial by design) ----
    ("win2000", "computer", "My Computer", f"{W2K}/computer_explorer_2k-4.png"),
    ("win2000", "my-documents", "My Documents", f"{W2K}/directory_open_file_mydocs_2k-4.png"),
    ("win2000", "recycle-empty", "Recycle Bin (empty)", f"{W2K}/recycle_bin_empty_2k-4.png"),
    ("win2000", "recycle-full", "Recycle Bin (full)", f"{W2K}/recycle_bin_full_2k-4.png"),

    # ---- Windows XP Luna (32/48 native; several 1024 px sources) ----
    ("winxp", "folder", "Folder", f"{XP}/folder_plain.png"),
    ("winxp", "computer", "My Computer", f"{XP}/mycomputer.png"),
    ("winxp", "recycle-bin", "Recycle Bin", f"{XP}/recycling_bin.png"),
    ("winxp", "internet-explorer", "Internet Explorer", f"{XP}/ie.png"),
    ("winxp", "outlook-express", "Outlook Express", f"{XP}/outlook.png"),
    ("winxp", "media-player", "Windows Media Player", f"{XP}/mediaplayer.png"),
    ("winxp", "games", "Games (Pinball)", f"{XP}/pinball.png"),
    ("winxp", "projects", "Projects folder", f"{XP}/folder_program.png"),
    ("winxp", "minesweeper", "Minesweeper", "apps/minesweeper/assets/icon.png"),
    ("winxp", "calculator", "Calculator", f"{XP}/calc.png"),
    ("winxp", "paint", "Paint", f"{XP}/paint.png"),
    ("winxp", "control-panel", "Control Panel", f"{XP}/hardware.png"),
    ("winxp", "notepad", "Notepad", f"{XP}/Notepad.png"),
    ("winxp", "rich-text", "WordPad / Rich Text", f"{XP}/filetypes/rich-text.png"),
    ("winxp", "volume", "Volume", f"{XP}/Volume.png"),
    ("winxp", "mute", "Mute", f"{XP}/Mute.png"),
    ("winxp", "notification", "Notification", f"{XP}/Information.png"),
    ("winxp", "calendar", "Date and Time", f"{XP}/Date and Time.png"),
    ("winxp", "terminal", "Command Prompt", f"{XP}/cmd.png"),
    ("winxp", "run", "Run", f"{XP}/run.png"),
    ("winxp", "help", "Help and Support", f"{XP}/help.png"),
    ("winxp", "search", "Search", f"{XP}/search.png"),
    ("winxp", "performance-monitor", "Performance Monitor", f"{XP}/Performance Monitor.png"),
    ("winxp", "printers", "Printers and Faxes", f"{XP}/printers-and-faxes.png"),
    ("winxp", "network", "Network", f"{XP}/internet.png"),
    ("winxp", "sound", "Sounds and Audio", f"{XP}/sound.png"),
    ("winxp", "appearance", "Display / Appearance", f"{XP}/appearance.png"),
    ("winxp", "users", "User Accounts", f"{XP}/users.png"),
    ("winxp", "regional", "Regional Settings", f"{XP}/earth.png"),
    ("winxp", "security", "Security Center", f"{XP}/green_shield.png"),
    ("winxp", "pictures", "Windows Picture and Fax Viewer", f"{XP}/Windows Picture and Fax Viewer.png"),

    # ---- Windows 7 Aero (256–512 px sources; the orb is a button, not an icon) ----
    ("win7", "computer", "Computer", f"{W7}/computer.png"),
    ("win7", "folder", "Folder", f"{W7}/folder.png"),
    ("win7", "internet-explorer", "Internet Explorer", f"{W7}/internet-explorer.png"),
    ("win7", "mail", "Windows Mail", f"{W7}/mail.png"),
    ("win7", "volume", "Volume", f"{W7}/volume.png"),
]


# Source defects where the background is opaque (near-white) instead of transparent.
# Only near-white regions that touch the image edge are removed, so white
# highlights enclosed by the artwork are preserved.
KNOCKOUT_WHITE_BACKGROUND = {("win7", "volume")}
KNOCKOUT_MIN_CHANNEL = 230


def knockout_white_background(img: Image.Image) -> Image.Image:
    """Make the edge-connected near-white background transparent (needs numpy + scipy)."""
    import numpy as np
    from scipy import ndimage

    rgba = np.array(img)
    near_white = rgba[:, :, :3].min(axis=2) >= KNOCKOUT_MIN_CHANNEL
    labels, _ = ndimage.label(near_white)
    edge_labels = set(np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1],
    ]))) - {0}
    background = np.isin(labels, list(edge_labels))
    rgba[background, 3] = 0
    return Image.fromarray(rgba, "RGBA")


def square_canvas(img: Image.Image, size: int) -> Image.Image:
    """Scale img to fit inside size x size (no upscaling) and centre it on a transparent canvas."""
    w, h = img.size
    scale = size / max(w, h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS) if (nw, nh) != (w, h) else img.copy()
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    entries = []
    seen: set[tuple[str, str]] = set()

    for family, role, app, rel in ROLES:
        key = (family, role)
        if key in seen:
            raise SystemExit(f"duplicate role {family}/{role}")
        seen.add(key)

        source = SRC / rel
        if not source.exists():
            raise SystemExit(f"missing source for {family}/{role}: {rel}")

        with Image.open(source) as opened:
            img = opened.convert("RGBA")
        if (family, role) in KNOCKOUT_WHITE_BACKGROUND:
            img = knockout_white_background(img)
        longest = max(img.size)

        produced: list[int] = []
        skipped: list[dict] = []
        files: dict[str, str] = {}
        role_dir = OUT / family / role
        role_dir.mkdir(parents=True, exist_ok=True)

        for size in SIZES:
            if size > longest:
                skipped.append({"size": size, "reason": f"source longest edge {longest}px; upscaling is not allowed"})
                continue
            canvas = square_canvas(img, size)
            target = role_dir / f"{size}.png"
            canvas.save(target, optimize=True)
            produced.append(size)
            files[str(size)] = target.relative_to(OUT).as_posix()

        ico_path = role_dir / "icon.ico"
        base = square_canvas(img, max(produced))
        base.save(ico_path, format="ICO", sizes=[(s, s) for s in produced])

        entries.append({
            "family": family,
            "role": role,
            "app": app,
            "source": f"src/{rel}",
            "sourceSize": list(img.size),
            "produced": produced,
            "skipped": skipped,
            "files": files,
            "ico": ico_path.relative_to(OUT).as_posix(),
            "notes": ["edge-connected white background knocked out (opaque source)"]
            if (family, role) in KNOCKOUT_WHITE_BACKGROUND else [],
        })

    manifest = {
        "generator": "scripts/build-windows-icons.py",
        "sizes": SIZES,
        "policy": "downscale-only; no upscaling; transparency preserved",
        "families": sorted({e["family"] for e in entries}),
        "count": len(entries),
        "entries": entries,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(entries)} roles to {OUT.relative_to(ROOT)}")
    for family in manifest["families"]:
        fam = [e for e in entries if e["family"] == family]
        print(f"  {family}: {len(fam)} roles")


if __name__ == "__main__":
    main()
