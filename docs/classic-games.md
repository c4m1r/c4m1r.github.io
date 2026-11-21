# Classic Windows games: inventory and sketches

Temporary sketches (набросок) for the games that shipped with Windows by default.
Layouts and rules follow the public rule sets; code is written for this site, not copied.

## Games bundled with Windows (source: Wikipedia, "List of games included with Windows")

| Game | Windows versions | Status here |
|---|---|---|
| Solitaire (Klondike, «Косынка») | 3.1, 95, 98, 2000, XP, Vista, 7, 10 | Sketch: `src/apps/games/solitaire` (draw-one, click-to-move) |
| FreeCell («Свободная ячейка») | 3.1 (Win32s), 95, 98, 2000, XP, Vista, 7, 10 | Sketch: `src/apps/games/freecell` (4 cells, supermoves) |
| Minesweeper («Сапёр») | 3.1, 95, 98, 2000, XP, Vista, 7 | Exists: `src/apps/minesweeper` |
| Hearts | 3.1, 95, 98, XP, Vista, 7 | Not started |
| Spider Solitaire | XP, Vista, 7, 10 | Not started |
| 3D Pinball – Space Cadet | 2000, XP | Not started |
| Reversi | 3.1 | Not started |
| Chess Titans | Vista, 7 | Not started (Chess sketch reference in `eat/`) |
| Internet Backgammon | XP, 7 | Not started |
| Purble Place | Vista, 7 | Not started |
| Mahjong | Vista, 7, 8, 10 | Not started |

## Rules implemented in the sketches

- Klondike: build tableau down in alternating colours, only Kings to empty columns; foundations build up by suit from Ace; the stock draws one card and is recycled when empty; face-down cards flip when exposed.
- FreeCell: all 52 cards face up (four columns of 7, four of 6); four free cells hold one card; foundations build up by suit; tableau builds down in alternating colours, any card to an empty column; a run moves if `(free cells + 1) * 2^(empty columns)` allows it.

## Material used from `eat/` (reference only, nothing copied)

- `eat/windows7-ui-portfolio-main/components/apps/Solitaire.tsx` and `Chess.tsx` (MIT, reference for behaviour and layout).
- `eat/wins95Portfolio-main/src/components/MineSweeper.jsx` (reference for Minesweeper, already implemented).
- Native icons: XP `solitaire.png`, `freecell.png`; Win7 `solitaire.png`; Win98 `game-solitaire`, `game-freecell`. Win2000 inherits Win98 for these (its own set has no Solitaire icon). Win7 has no FreeCell icon, so it currently uses the XP one.

## Next steps

1. Hearts and Spider Solitaire (same card model in `src/apps/games/cards`).
2. Pinball and Chess as separate sketches once the card games are reviewed against the user's screenshots.
3. Per-OS visual fidelity (card backs, felt colour, window chrome) after screenshots arrive in `eat/screens/oc/<os>/`.
