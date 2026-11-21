# Classic Windows games: inventory and sketches

Temporary sketches (набросок) for the games that shipped with Windows by default.
Layouts and rules follow the public rule sets; code is written for this site, not copied.

## Games bundled with Windows (source: Wikipedia, "List of games included with Windows")

| Game | Windows versions | Status here |
|---|---|---|
| Solitaire (Klondike, «Косынка») | 3.1, 95, 98, 2000, XP, Vista, 7, 10 | Sketch: `src/apps/games/solitaire` (draw-one, click-to-move) |
| FreeCell («Свободная ячейка») | 3.1 (Win32s), 95, 98, 2000, XP, Vista, 7, 10 | Sketch: `src/apps/games/freecell` (4 cells, supermoves) |
| Minesweeper («Сапёр») | 3.1, 95, 98, 2000, XP, Vista, 7 | Exists: `src/apps/minesweeper` |
| Hearts («Сердца») | 3.1, 95, 98, XP, Vista, 7 | Sketch: `src/apps/games/hearts` (pass, follow suit, heart-breaking, shooting the moon, 100-point game) |
| Spider Solitaire («Паук») | XP, Vista, 7, 10 | Sketch: `src/apps/games/spider` (104 cards, one-suit build K→A, stock deals; default one suit) |
| 3D Pinball – Space Cadet | 2000, XP | Sketch: `src/apps/games/pinball` (canvas physics, flippers, bumpers, plunger held by time; three balls) |
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

## Hearts rules implemented

- Pass three cards left, right, across, then none; the holder of 2♣ leads.
- Follow suit; hearts cannot lead until a heart or the Queen of Spades is played.
- No points on the first trick when another card is legal.
- Scoring: hearts 1 each, Queen of Spades 13; shooting the moon gives 26 to the others. Game ends at 100.

## Next steps

1. Spider: suit-count choice (2 and 4 suits) and the Win-style scoring/timer.
2. Chess Titans next (reference: `eat/windows7-ui-portfolio-main/components/apps/Chess.tsx`), then Mahjong and Purble Place.
3. Per-OS visual fidelity (card backs, felt colour, window chrome) after screenshots arrive in `eat/screens/oc/<os>/`.

## Pinball notes

- Physics is a simplified sketch: gravity, circle-vs-segment collisions, round bumpers (100 points), two flippers with a kick proportional to their swing speed.
- Plunger strength grows while Space is held (full at 700 ms). The Windows 2000 and XP table layout is not reproduced yet.
- Program Files name `pinball.exe` is not verified against the original file.
- Icon: XP `pinball.png` is used for XP, Win98, Win7 and Win2000 until 2000-specific art is sourced.
