# c4m1r.github.io

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple)](https://vitejs.dev/)

An advanced, interactive web portfolio and multi-OS desktop runtime environment built with React, TypeScript, and modern CSS.

---

## Architecture Overview

The project is structured around a **Single Desktop Engine** and **Content Domain Boundary**:

```text
src/
├── apps/               # Modular applications (Explorer, Terminal, Media Player, etc.)
├── components/         # Reusable UI components & visual effects
├── config/             # Feature flags & environment configuration
├── content/            # Markdown content, wiki pages, projects, and articles
├── contexts/           # App contexts (Weather, Desktop state, Global actions)
├── domain/             # Content models, search indexers, and registry logic
├── shells/
│   ├── desktop/        # Unified DesktopShell runtime & window manager
│   ├── os/             # OS skin definitions, labels, and class mappings
│   └── site/           # Modern personal website shell & layout
├── styles/
│   ├── effects/        # ASCII art, Aurora, weather animation styles
│   ├── markdown/       # Prose and article formatting
│   ├── os/             # Theme stylesheets (Win98, WinXP, Win7, Ubuntu, Arch, WebOS, macOS, iOS)
│   └── site/           # Base website styles
└── themes/             # OS boot loaders, session screens, and static theme assets
```

### Key Architectural Principles

1. **Single Runtime Engine**: `DesktopShell` is a single unified React desktop runtime. No forks exist for individual operating systems.
2. **Strict CSS Isolation**: Themes are encapsulated within scoped classes (`.os-winxp`, `.os-classic`, `.os-win7`, `.os-ubuntu`, `.os-arch`, `.os-webos`, `.os-spooky`, `.os-macos`, `.os-ios`).
3. **Protected Portfolio Apps**: Core portfolio applications (`my-cv`, `projects-grid`, `blog`, `wiki`, `about`) maintain canonical identities across all OS themes.
4. **Zero External Runtime Dependencies**: Fully self-contained build. All external reference assets from donor repositories (`/eat/`) are canonicalized under `src/themes/`.

---

## Supported OS Environments & Themes

- **Windows XP**: Authentic Luna blue taskbar, green start button, royal blue window headers, and Explorer layout.
- **Windows 98**: Authentic 3D beveled borders, classic `#c0c0c0` palette, dithered active window buttons, and sunken system tray.
- **Windows 7**: Aero Glass translucent gradient borders, glowing round Start Orb, and Aero taskbar.
- **Ubuntu**: Modern Yaru dark panel, aubergine gradient background, orange accent highlights, and traffic-light control dots.
- **Arch Linux**: Dark slate panel (`#1e222b`), Arch cyan accents (`#1793d1`), and minimalist circular window controls.
- **WebOS**: Frosted glass dock taskbar, cyan glow indicators, and modern dark card UI.
- **Halloween Edition**: Midnight purple canvas (`#12041d`) with neon pumpkin orange borders and glowing titlebars.
- **macOS Tahoe**: Authentic top menu bar with Apple logo, Control Center, magnification Dock, and Monterey/Tahoe wallpaper suite.
- **iOS Suite**: Generational SpringBoard mobile experiences (iOS 5, 9, 16, 26) with lock screens and touch-adapted interactions.

---

## Development & Verification

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Quality Verification Pipeline
Before submitting changes, all checks must pass:

```bash
# 1. Structural context boundary verification
npm run verify

# 2. TypeScript typecheck
npm run typecheck

# 3. ESLint static analysis
npm run lint

# 4. Production build
npm run build

# 5. Git diff integrity
git diff --check
```

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-v3)**. See [LICENSE](LICENSE) for details.
