# OS Skin Visual Checklist & Identity Guidelines

This report details the visual hallmarks, architectural constraints, and safety guarantees for each supported OS skin in `c4m1r.github.io`.

---

## Architectural Principles

1. **Single Runtime Engine**: `DesktopShell` is a single, unified React desktop shell component. Zero runtime forks (`Win98Desktop`, `Win7Desktop`, `UbuntuDesktop`) exist.
2. **Single App Registry**: `appRegistry.ts` is the single source of truth for default app identity, titles, and icons.
3. **Protected Portfolio Apps**: All 6 core portfolio content apps (`my-cv`, `projects-grid`, `blog`, `wiki`, `about`, `content-reader`) are protected in `osSkins.ts` and NEVER get renamed to system folders.
4. **Feature Flag Priority**: `features.news = false` in `src/config/features.ts` has absolute precedence over OS skin display rules (`getOsAppVisibility`).

---

## Visual Skin Hallmarks

### 1. Windows XP (`.os-winxp`)
- **Taskbar**: Luna blue glossy gradient (`#245edb` -> `#1956d5`) with light blue top border (`#4889f8`).
- **Start Button**: Distinct rounded green gradient button with italic/bold title text.
- **Window Chrome**: Rounded top corners (8px radius) with royal blue titlebar gradient and authentic control buttons.
- **System Labels**: "start" / "пуск", "My Computer" / "Мой компьютер", "Recycle Bin" / "Корзина".

### 2. Windows 98 (`.os-classic`)
- **Taskbar**: Flat classic gray (`#c0c0c0`) surface with top white highlight line.
- **Start Button**: Beveled 3D square button (`#c0c0c0`) with white top/left borders and dark gray/black bottom/right borders.
- **Window Chrome**: Classic 3D beveled borders with dark blue gradient titlebar (`#000080` -> `#1084d0`).
- **Desktop**: Classic teal background tint (`#008080`).

### 3. Windows 7 (`.os-win7`)
- **Taskbar**: Aero Glass translucent backdrop blur gradient with crisp white top border.
- **Start Orb**: Round glossy blue start button orb with glowing hover state.
- **Window Chrome**: Translucent glass frame with subtle drop shadows and border glow.
- **System Labels**: "Start" / "Пуск", "Computer" / "Компьютер", "Pictures" / "Изображения", "Control Panel" / "Панель управления".

### 4. Ubuntu (`.os-ubuntu`)
- **Taskbar**: Yaru dark panel (`#2c2c2c` / `#1e1e1e`) with aubergine (`#772953`) or dark menu button.
- **Window Chrome**: Dark header titlebar (`#3d3d3d`) with Yaru traffic-light control dots.
- **Accents**: Ubuntu orange (`#e95420`) selection highlights, primary buttons, and scrollbar thumbs.
- **Desktop**: Yaru purple aubergine gradient background.
- **System Labels**: "Menu" / "Меню", "Files" / "Файлы", "Trash" / "Корзина", "Settings" / "Настройки", "Browser" / "Браузер", "Photos" / "Фото", "Terminal" / "Терминал".

### 5. WebOS (`.os-shell`)
- Default WebOS presentation identity without inheriting Windows or Ubuntu CSS overrides.

---

## Verification Standards

- **Static Checks**: `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.
- **Visual Smoke Verification**: Manual browser review across all boot entries (`Site`, `Windows XP`, `Windows 98`, `Windows 7`, `Ubuntu`, `WebOS`).
