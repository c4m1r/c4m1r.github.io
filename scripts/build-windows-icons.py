#!/usr/bin/env python3
"""
Build the canonical Windows icon collection used by the Windows-family skins.

Output: src/themes/windows-icons/
  <family>/<role>/<size>.png   one PNG per size the OS shipped (see FAMILY_SIZES)
  <family>/<role>/icon.ico     multi-size ICO containing the same sizes
  manifest.json                role -> app -> source -> per-size method and provenance

Method, per role and per size (in order of preference):
  1. native   a file in the source's icon family (same base name, e.g.
              computer_2_cool-0..5) that is already drawn at exactly that size.
              When several candidates share the size, the one whose artwork
              best matches the role's reference is chosen (see match_error).
  2. derived  no native artwork exists for that size: the best larger native
              is downscaled with LANCZOS. Upscaling is never performed.
  3. (none)   no native artwork at or above the size: the size is omitted and
              recorded in the manifest.

Rules (see docs/icon-bank-audit.md and docs/agents.md):
  * Sources are the existing canonical copies under src/themes/*. Nothing is
    imported from eat/ and no donor artwork is added here.
  * Transparency is preserved (RGBA, centred on a square canvas).

Run: python3 scripts/build-windows-icons.py
Requires: Pillow; numpy and scipy only for the white-background knockout step.
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw  # noqa: F401  (ImageDraw kept for future fills)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
OUT = SRC / "themes" / "windows-icons"

# Sizes each OS generation actually shipped. Windows 98 through XP shipped
# 16/32/48 px shell icons; Windows 7 added 256 px "jumbo" icons.
FAMILY_SIZES = {
    "win98": [16, 32, 48],
    "win2000": [16, 32, 48],
    "winxp": [16, 32, 48],
    "win7": [16, 24, 32, 48, 64, 128, 256],
}

W98 = "themes/win98/assets/icons"
W2K = "themes/win98/assets/icons"  # Windows 2000 variants live in the 98 archive as *_2k-N.png
XP = "themes/winxp/assets/icons"
W7 = "themes/win7/assets/icons"

# (family, role, app, reference source relative to src/)
ROLES: list[tuple[str, str, str, str]] = [
    # ---- Windows 98 ----
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

    # ---- Windows 2000 (*_2k variants) ----
    ("win2000", "computer", "My Computer", f"{W2K}/computer_explorer_2k-4.png"),
    ("win2000", "my-documents", "My Documents", f"{W2K}/directory_open_file_mydocs_2k-4.png"),
    ("win2000", "recycle-empty", "Recycle Bin (empty)", f"{W2K}/recycle_bin_empty_2k-4.png"),
    ("win2000", "recycle-full", "Recycle Bin (full)", f"{W2K}/recycle_bin_full_2k-4.png"),

    # ---- Windows XP Luna (named sources; 1024 px originals are downscaled
    #      only where no native pool exists) ----
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

# Curated native variants for Windows XP. Each file was identified visually on a
# labelled contact sheet of the numbered XP bank (winxp/assets/icons/NNN(WxW).png)
# and, where a reference exists, confirmed numerically. The automatic matcher is
# not used for XP because the 16 px candidates are not discriminative there.
# Roles not listed here keep their named source and downscaled sizes.
CURATED_NATIVE: dict[tuple[str, str], dict[int, str]] = {
    ("winxp", "computer"): {32: f"{XP}/676(32x32).png"},
    ("winxp", "recycle-bin"): {32: f"{XP}/360(32x32).png"},
    ("winxp", "internet-explorer"): {16: f"{XP}/896(16x16).png"},
    ("winxp", "outlook-express"): {16: f"{XP}/887(16x16).png", 32: f"{XP}/887(32x32).png"},
    ("winxp", "media-player"): {16: f"{XP}/846(16x16).png", 32: f"{XP}/846(32x32).png"},
    ("winxp", "calculator"): {16: f"{XP}/74(16x16).png", 32: f"{XP}/74(32x32).png"},
    ("winxp", "paint"): {16: f"{XP}/680(16x16).png", 32: f"{XP}/680(32x32).png"},
    ("winxp", "notepad"): {16: f"{XP}/327(16x16).png", 32: f"{XP}/327(32x32).png"},
    ("winxp", "terminal"): {16: f"{XP}/56(16x16).png"},
    ("winxp", "help"): {16: f"{XP}/747(16x16).png", 32: f"{XP}/747(32x32).png"},
    ("winxp", "search"): {32: f"{XP}/299(32x32).png"},
    ("winxp", "sound"): {16: f"{XP}/690(16x16).png"},
    ("winxp", "volume"): {16: f"{XP}/690(16x16).png"},
}

# Source defects where the background is opaque (near-white) instead of transparent.
KNOCKOUT_WHITE_BACKGROUND = {("win7", "volume")}
KNOCKOUT_MIN_CHANNEL = 230

# Maximum mean error (0..1 scale) accepted when matching a native candidate to the reference.
MATCH_ERROR_LIMIT = 0.12


def base_name(path: Path) -> str:
    """Icon family key: file stem without a trailing -N variant index."""
    return re.sub(r"-\d+$", "", path.stem)


def load_rgba(path: Path) -> Image.Image:
    with Image.open(path) as opened:
        return opened.convert("RGBA")


def knockout_white_background(img: Image.Image) -> Image.Image:
    """Make the edge-connected near-white background transparent."""
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


def match_error(candidate: Image.Image, reference: Image.Image) -> float:
    """Mean error between a native candidate and the reference scaled to the candidate's size.

    Compares premultiplied colour and alpha on a 0..1 scale, so transparent
    background pixels do not dominate the score.
    """
    size = candidate.size[0]
    ref = square_canvas(reference, size)
    c = np.asarray(candidate, dtype=np.float64) / 255.0
    r = np.asarray(ref, dtype=np.float64) / 255.0
    c_pm = c[:, :, :3] * c[:, :, 3:4]
    r_pm = r[:, :, :3] * r[:, :, 3:4]
    return float(np.mean((c_pm - r_pm) ** 2) + np.mean((c[:, :, 3] - r[:, :, 3]) ** 2)) / 2.0


def native_pool(source: Path) -> list[Path]:
    """All files in the source's directory that share its base name (the same icon family)."""
    key = base_name(source)
    return sorted(p for p in source.parent.glob("*.png") if base_name(p) == key)


def choose_native(source: Path, reference: Image.Image, size: int) -> tuple[Path, float] | None:
    """Best native candidate drawn at exactly `size`, or None."""
    best: tuple[Path, float] | None = None
    for candidate_path in native_pool(source):
        candidate = load_rgba(candidate_path)
        if candidate.size != (size, size):
            continue
        if candidate_path == source:
            return candidate_path, 0.0
        error = match_error(candidate, reference)
        if best is None or error < best[1]:
            best = (candidate_path, error)
    if best is not None and best[1] > MATCH_ERROR_LIMIT:
        return None
    return best


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

        reference = load_rgba(source)
        if key in KNOCKOUT_WHITE_BACKGROUND:
            reference = knockout_white_background(reference)
        longest_reference = max(reference.size)

        role_dir = OUT / family / role
        role_dir.mkdir(parents=True, exist_ok=True)

        sizes_out: dict[str, dict] = {}
        produced: list[int] = []
        skipped: list[dict] = []
        ico_base: Image.Image | None = None

        curated = CURATED_NATIVE.get(key, {})
        for size in FAMILY_SIZES[family]:
            if size in curated:
                image = load_rgba(SRC / curated[size])
                info = {"method": "curated", "from": f"src/{curated[size]}", "matchError": None}
            elif (native := choose_native(source, reference, size)) is not None:
                path, error = native
                image = load_rgba(path)
                if key in KNOCKOUT_WHITE_BACKGROUND:
                    image = knockout_white_background(image)
                method = "native" if path != source else "reference"
                info = {"method": method, "from": f"src/{path.relative_to(SRC).as_posix()}",
                        "matchError": round(error, 5)}
            elif size <= longest_reference:
                image = square_canvas(reference, size)
                info = {"method": "derived", "from": f"src/{rel}", "matchError": None}
            else:
                skipped.append({"size": size, "reason": f"no native artwork at {size}px and upscaling is not allowed"})
                continue

            canvas = image if image.size == (size, size) else square_canvas(image, size)
            target = role_dir / f"{size}.png"
            canvas.save(target, optimize=True)
            produced.append(size)
            info["file"] = target.relative_to(OUT).as_posix()
            sizes_out[str(size)] = info
            if ico_base is None or size > ico_base.size[0]:
                ico_base = canvas

        ico_path = role_dir / "icon.ico"
        if ico_base is not None:
            ico_base.save(ico_path, format="ICO", sizes=[(s, s) for s in produced])

        entries.append({
            "family": family,
            "role": role,
            "app": app,
            "source": f"src/{rel}",
            "sourceSize": list(load_rgba(source).size),
            "sizes": sizes_out,
            "skipped": skipped,
            "ico": ico_path.relative_to(OUT).as_posix() if ico_base is not None else None,
            "notes": ["edge-connected white background knocked out (opaque source)"]
            if key in KNOCKOUT_WHITE_BACKGROUND else [],
        })

    manifest = {
        "generator": "scripts/build-windows-icons.py",
        "familySizes": FAMILY_SIZES,
        "policy": "curated or matched native artwork first; derived only by downscaling; never upscaled; transparency preserved",
        "matchErrorLimit": MATCH_ERROR_LIMIT,
        "families": sorted({e["family"] for e in entries}),
        "count": len(entries),
        "entries": entries,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(entries)} roles to {OUT.relative_to(ROOT)}")
    for family in manifest["families"]:
        fam = [e for e in entries if e["family"] == family]
        methods = {}
        for e in fam:
            for info in e["sizes"].values():
                methods[info["method"]] = methods.get(info["method"], 0) + 1
        print(f"  {family}: {len(fam)} roles, sizes {methods}")


if __name__ == "__main__":
    main()
