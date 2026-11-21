#!/usr/bin/env python3
"""
Standardize the Windows 98 icon bank into category/name layout.

Source : src/themes/win98/assets/icons/<base>[-N].png   (587 base names, 1758 files)
Output : src/themes/win98/icons/<category>/<name>/<WxH>-<N>.png
         src/themes/win98/icons/manifest.json  (original file -> new path, per file)

  * <name>  is the original base name in kebab-case (underscores -> hyphens).
  * <N>     is the original variant index (0 when the source had none).
  * <WxH>   is the intrinsic pixel size, so size variants are self-describing.
  * <category> is assigned by ordered keyword rules (CATEGORY_RULES). The first
    matching rule wins; anything unmatched goes to "system". The full mapping
    is in the manifest and can be reviewed or corrected by editing the rules.

Run: python3 scripts/organize-win98-icons.py
"""

import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src/themes/win98/assets/icons"
OUT = ROOT / "src/themes/win98/icons"

# Ordered: first match wins. Matching is by whole word tokens of the base name
# (split on "_"); a token ending in "*" matches as a prefix. Multi-word keys are
# matched as contiguous token sequences.
CATEGORY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("apps", ("game", "mshearts", "minesweeper", "spider", "solitaire", "ms dos", "calculator", "calendar", "clock",
              "time and date", "user calendar", "address book", "cardfile", "appwiz", "installer", "program manager",
              "regedit", "defragment", "scandisk", "msconfig", "msinfo32", "doctor watson", "java", "directx",
              "graphedit", "msagent", "msn*", "outlook express", "shell window*", "scanregw", "sched tasks", "rename",
              "replace", "erase", "system restore", "tools gear", "gears*", "tree", "winrep", "paint*", "console prompt",
              "computer user pencil", "start menu xp", "start menu shortcuts", "computer taskmgr", "accessibility two windows",
              "application hourglass*", "application hammer grouppol")),
    ("security", ("certificate*", "key", "keys", "padlock", "lock", "trust*", "signature*", "registration*", "restrict",
                  "world lock",
                  "accessibility big keys", "accessibility key pointer", "users key", "sorted lock")),
    ("media", ("keyboard musical", "media player*", "video*", "movie*", "mci", "multimedia", "midi*", "roland", "drum", "cd audio*",
               "audio*", "imag*", "wia img*", "kodak imaging*", "sound*", "loudspeaker*", "mixer*", "microphone*",
               "amplify", "active movie", "camera vid*", "scanner video cam", "computer sound", "executable sound")),
    ("network", ("network*", "conn*", "dialup*", "modem", "dial", "world*", "web*", "internet*", "netmeeting*",
                 "netshow*", "ipconfig", "server*", "telephony", "rj", "jack", "msie*", "homepage*", "frame web",
                 "connected", "channels*", "infrared*", "gps", "remote*", "mailbox*", "entire network globe",
                 "direct cable conn", "expansion board modem", "directory net web")),
    ("devices", ("printer*", "scanner*", "floppy*", "cd drive*", "hard disk*", "removable*", "drive*", "laptop*",
                 "monitor*", "keyboard", "mouse*", "joystick*", "camera*", "card reader*", "memory", "processor", "ram",
                 "chip*", "scsi", "usb*", "battery*", "eject*", "unplug*", "ups", "expansion board", "backup devices*",
                 "fax*", "diskettes*", "cylinder database", "plotter", "ac plug", "cable*", "device rhombic chip",
                 "computer*", "clean drive", "standby*", "input devices", "file program group")),
    ("documents", ("document*", "file*", "write*", "notepad*", "word*", "wordpad", "xml*", "html*", "script*", "font*",
                   "chm", "help*", "sheet", "template*", "filepack", "newspaper*", "envelope*", "message*", "note",
                   "tip", "ole*", "text", "catalog*", "charmap*", "utopia*", "color profile*", "executable script",
                   "move system file", "msagent file")),
    ("folders", ("directory*", "folder*", "recycle bin directory", "replace directory", "search directory")),
]

SIZE_RE = re.compile(r"^(.+?)(?:-(\d+))?\.png$")


def _matches(tokens: list[str], key: str) -> bool:
    """True if the key's words occur contiguously in tokens; a trailing * is a prefix match on the word."""
    words = key.split()
    for start in range(len(tokens) - len(words) + 1):
        window = tokens[start:start + len(words)]
        if all(
            (t.startswith(w[:-1]) if w.endswith("*") else t == w)
            for t, w in zip(window, words)
        ):
            return True
    return False


def categorize(base: str) -> str:
    tokens = base.lower().replace("-", "_").split("_")
    tokens = [t for t in tokens if t]
    for category, keys in CATEGORY_RULES:
        for key in keys:
            if _matches(tokens, key):
                return category
    return "system"


def parse(filename: str) -> tuple[str, int]:
    m = SIZE_RE.match(filename)
    base = m.group(1)
    index = int(m.group(2)) if m.group(2) is not None else 0
    return base, index


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    files = sorted(p for p in SRC.glob("*.png"))
    items = []
    for path in files:
        base, index = parse(path.name)
        category = categorize(base)
        name = base.replace("_", "-").lower()
        with Image.open(path) as im:
            width, height = im.size
        target = OUT / category / name / f"{width}x{height}-{index}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            raise SystemExit(f"collision: {target}")
        shutil.copyfile(path, target)
        items.append({
            "source": path.name,
            "file": target.relative_to(OUT).as_posix(),
            "category": category,
            "name": name,
            "size": [width, height],
            "variant": index,
        })

    manifest = {
        "generator": "scripts/organize-win98-icons.py",
        "count": len(items),
        "categories": {c: sum(1 for i in items if i["category"] == c) for c in sorted({i["category"] for i in items})},
        "items": items,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(items)} files organized into {OUT.relative_to(ROOT)}")
    for c, n in manifest["categories"].items():
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
