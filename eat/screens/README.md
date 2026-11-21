# Reference screenshots of original operating systems

Put screenshots in `eat/screens/oc/<os>/` (one folder per OS). They are the reference for pixel comparison.

Folders: `win98`, `win2000`, `winxp`, `win7`, `vista`, `win10`, `win11`.

## Rule for screenshots

A screenshot sent by the user is a check of the work already done: it is compared with the current build, and every visible difference is recorded as a task in `docs/tasks.md` before the next change.

## Needed screenshots (per OS)

Boot and login
- Boot screen (logo and progress), full screen
- Login screen with user tiles, default account picture visible
- Welcome screen (XP/7)

Desktop
- Empty desktop with default icons and taskbar
- Start menu closed and open, with the submenu (Programs > Accessories) opened
- Recycle Bin window, empty and with one item

Explorer
- My Computer, icons view and details view
- A folder with files, list view and details view
- Explorer toolbar and address bar at full scale

Applications
- Calculator (standard view)
- Notepad with a text file open
- Paint with a drawing open
- Minesweeper (beginner game in progress)
- Windows Media Player (main window)
- Internet Explorer (any page)
- Outlook Express (inbox)

Dialogs
- Shut Down dialog
- Run dialog
- Disk/drive error prompt (empty optical drive)

Vista, 10, 11 only
- Start menu with search
- Settings or Alarm app window

Use full-resolution screenshots (no scaling), PNG format, named `<nn>-<topic>.png` (for example `03-start-menu-open.png`).

## Games (per OS where the game was bundled)

Use the same rule as above: full-resolution PNG, `<nn>-<game>-<topic>.png`. Each game is captured in its own OS folder.

Solitaire (Klondike), bundled in 98, 2000, XP, 7
- New deal, before any move (tableau, stock, waste, foundations visible)
- Mid-game with a card selected or dragged (selection highlight)
- Game menu and Options menu open (Draw One / Draw Three)
- Win screen or the end-of-game animation, if the OS has one

FreeCell, bundled in 98, 2000, XP, 7
- New deal with four free cells visible
- Game in progress with a supermove (several cards moving)
- Win screen

Hearts, bundled in 98, XP, 7
- Pass dialog (three cards selected)
- Trick in progress
- Round-end score dialog

Spider Solitaire, bundled in XP, 7
- New one-suit deal with stock visible
- A completed King-to-Ace run removed to the foundation
- Difficulty menu (one, two, four suits)

Minesweeper, bundled in 98, 2000, XP, 7 (already listed above, add these)
- Beginner game in progress
- Win and loss message dialogs
- Custom Field dialog

3D Pinball: Space Cadet, bundled in 2000, XP
- Table in play with the flippers and ball visible
- High score dialog

Chess Titans and Purble Place, bundled in Vista, 7
- Chess board with a move highlighted; promotion dialog
- Purble Place main menu and Match game in progress

Mahjong, bundled in Vista, 7
- Board layout selection and a game in progress

Internet Backgammon, bundled in XP, 7
- Board in play, dice rolled

Reversi, bundled in 3.1 only (optional; the Win 3.1 screen is not in the current OS list)

## Per-OS details to capture (in addition to the list above)

Alarm / clock (no native alarm in 98, 2000, XP, 7; use the generic application icon there, as already coded)
- Vista: Sidebar clock gadget and Windows Calendar alarm settings if present
- Windows 10 and 11: Alarms & Clock app, alarm list and the add-alarm dialog, plus the app icon in Start and taskbar
- Any OS: a typical generic .exe application icon (for example a plain executable in My Computer) for comparison with the fallback icon

Icons to confirm against the originals
- Solitaire, FreeCell, Hearts and Spider icons at 16, 32 and 48 px (Start menu, desktop, Explorer list view)
- Generic .exe icon per OS (My Computer, Program Files folder in list view)
