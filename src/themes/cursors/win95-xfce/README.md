# Windows 95 cursor set (xfce-look)

Source: https://github.com/McNultyyy/Windows-95-Cursor-Icons (credit: david, http://xfce-look.org/content/show.php?content=47369).
The repo stores X11 Xcursor files; they are converted here to 32 x 32 PNG with the hotspot kept in the code (see `src/styles/os/themes/cursors.css`).

Roles (file -> X cursor name, hotspot x,y):
- arrow -> arrow (0,0)
- hand -> hand2 (5,0)
- ibeam -> xterm (15,16)
- wait -> watch (16,17)
- appstarting -> left_ptr_watch (0,0)
- help -> question_arrow (5,7)
- no -> crossed_circle (15,16)
- crosshair -> cross (15,16)
- pen -> pencil (15,16)
- sizeall -> fleur (15,16)
- sizenesw -> fd_double_arrow (16,16)
- sizens -> v_double_arrow (15,17)
- sizenwse -> bd_double_arrow (16,16)
- sizewe -> h_double_arrow (16,16)
- uparrow -> center_ptr (15,6)

Only arrow, hand, ibeam and wait are wired in `cursors.css` so far; the other roles wait for their selectors.
The repo has no licence file; the source credit is kept here.
