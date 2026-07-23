# Desktop Runtime Manual Checklist

## Boot matrix
- [ ] GRUB -> Windows XP.
- [ ] GRUB -> Windows 98.
- [ ] GRUB -> Windows 7.
- [ ] GRUB -> Ubuntu.
- [ ] GRUB -> WebOS.

## Boot/login/welcome
- [ ] Boot screen completes.
- [ ] Login screen accepts login.
- [ ] Welcome screen transitions to desktop.
- [ ] Logoff returns to login.
- [ ] Shutdown returns to GRUB where expected.

## Desktop icons and apps
- [ ] Desktop icons are visible in each theme.
- [ ] Single click selects an icon.
- [ ] Double click opens an app.
- [ ] App windows render expected content.
- [ ] Unknown/missing launch paths show existing error behavior.

## Window interactions
- [ ] Window drag works.
- [ ] Window resize works.
- [ ] Maximize works.
- [ ] Restore works.
- [ ] Minimize works.
- [ ] Close works.
- [ ] Focus / z-index updates correctly.
- [ ] Multiple windows can be opened and focused.

## Desktop shell interactions
- [ ] Taskbar click focuses/restores/minimizes as before.
- [ ] Start menu opens and closes.
- [ ] Start menu app launch works.
- [ ] Context menu opens at pointer position.
- [ ] Context menu actions preserve previous behavior.
- [ ] Selection box selects icons correctly.
- [ ] Custom wallpaper persists and responds to `wallpaper-changed`.

## ASCII scope
- [ ] ASCII visible on Ubuntu desktop.
- [ ] ASCII visible on WebOS desktop.
- [ ] ASCII not visible on Windows XP desktop.
- [ ] ASCII not visible on Windows 98 desktop.
- [ ] ASCII not visible on Windows 7 desktop.
