#!/usr/bin/env python3
"""
Standardize the Windows 7 icon bank.

Input : scripts/data/win7-icon-names.txt   "<number> <category>/<name>" per line,
        assigned by visual review of contact sheets of src/themes/win7/assets/icons/NNN.png
Output: src/themes/win7/icons/<category>/<name>.png
        src/themes/win7/icons/manifest.json

Rules:
  * Byte-identical files are stored once. The lowest source number is canonical;
    the others are listed as aliases in the manifest.
  * Different artwork that received the same name gets a numeric suffix
    (name, name-2, name-3, ...) in source-number order.
  * The original numbered files are removed from assets/icons/ after they are moved.
  * Hand-named files (computer.png, folder.png, ...) are not touched: they are imported by code.

Run: python3 scripts/organize-win7-icons.py
"""

import hashlib
import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ICONS_SRC = ROOT / "src/themes/win7/assets/icons"
OUT = ROOT / "src/themes/win7/icons"
MAP_FILE = ROOT / "scripts/data/win7-icon-names.txt"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    entries = []
    for line in MAP_FILE.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        number, target = line.split()
        category, name = target.split("/", 1)
        source = ICONS_SRC / f"{number}.png"
        if not source.exists():
            # Numbers 1 and 2 are stored without zero padding.
            source = ICONS_SRC / f"{int(number)}.png"
        if not source.exists():
            raise SystemExit(f"missing source for {number}")
        entries.append({"number": number, "category": category, "name": name, "path": source,
                        "hash": sha256(source)})

    # Collapse byte-identical files into one canonical entry.
    canonical_by_hash: dict[str, dict] = {}
    unique = []
    for e in entries:
        if e["hash"] in canonical_by_hash:
            canonical_by_hash[e["hash"]]["aliases"].append(e["number"])
            e["duplicate"] = True
            continue
        e["aliases"] = []
        e["duplicate"] = False
        canonical_by_hash[e["hash"]] = e
        unique.append(e)

    # Resolve name collisions between different artwork.
    taken: dict[tuple[str, str], int] = defaultdict(int)
    for e in unique:
        key = (e["category"], e["name"])
        taken[key] += 1
        if taken[key] > 1:
            e["name"] = f"{e['name']}-{taken[key]}"

    if OUT.exists():
        shutil.rmtree(OUT)
    manifest_items = []
    for e in unique:
        target = OUT / e["category"] / f"{e['name']}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(e["path"], target)
        manifest_items.append({
            "file": target.relative_to(OUT).as_posix(),
            "category": e["category"],
            "name": e["name"],
            "source": f"{e['number']}.png",
            "aliases": e["aliases"],
        })

    for e in entries:
        e["path"].unlink()

    manifest = {
        "generator": "scripts/organize-win7-icons.py",
        "sourceMap": "scripts/data/win7-icon-names.txt",
        "count": len(manifest_items),
        "sourceFiles": len(entries),
        "duplicatesCollapsed": sum(1 for e in entries if e["duplicate"]),
        "categories": sorted({i["category"] for i in manifest_items}),
        "items": manifest_items,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{manifest['count']} unique icons from {manifest['sourceFiles']} source files "
          f"({manifest['duplicatesCollapsed']} duplicates collapsed)")
    for cat in manifest["categories"]:
        print(f"  {cat}: {sum(1 for i in manifest_items if i['category'] == cat)}")


if __name__ == "__main__":
    main()
