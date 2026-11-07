# AI Agent Engineering & Operation Guide: `c4m1r.github.io`

> **Scope**: Master specification and instructions for AI agents and automated assistants developing, maintaining, and enhancing the `c4m1r.github.io` multi-OS simulation ecosystem.

---

## 1. Project Philosophy & System Overview

`c4m1r.github.io` is an interactive multi-operating system simulation environment, retro computing showcase, and portfolio built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

### Key Tenets
1. **Zero External Build Dependencies**: The production build must never depend on external repositories or `/eat/`. All assets (audio, icons, fonts, stylesheets) are copied directly into `src/`.
2. **Authenticity Over Mockery**: Retro OS skins (Windows XP Luna, Windows 98 Classic, Windows 7 Aero Glass, Apple Aqua/macOS, iOS, Ubuntu) must recreate genuine animations, bevels, typography, audio cues, and layout behaviors.
3. **Non-Commercial Nostalgia Scope**: All retro operating system emulations, themes, sound effects, and icons are fan/historical demonstrations. No compliance checks or legal disclaimer modifications are needed beyond preserving the author's portfolio metadata.
4. **Strict Verification Gates**: No task is complete without passing all 5 gates:
   - `npm run verify` (Context boundary & identity integrity)
   - `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json` with 0 errors)
   - `npm run lint` (`eslint .` with 0 errors)
   - `npm run build` (`vite build` production compilation)
   - `git diff --check` (Zero trailing whitespace or merge residue)

---

## 2. Architecture & File System Map

```
c4m1r-github/
├── docs/                        # Engineering specifications, audits, task logs
│   ├── agents.md               # This agent operational guide
│   ├── architecture.md         # System architecture & lifecycle map
│   ├── donor-absorption-audit.md # Verification matrix for /eat/ donor repos
│   ├── tasks.md                # Master backlog & progress tracking
│   └── os-skin-visual-checklist.md # Visual fidelity criteria per OS
├── src/
│   ├── apps/                   # Self-contained desktop applications
│   │   ├── winamp/             # Winamp 2.x player, EQ, playlist, audio analyzer
│   │   ├── loops/              # 0chan loop visualizer, reactive cells & chpok sound
│   │   ├── mediaplayer/        # WMP classic audio player & 57-track playlist
│   │   ├── explorer/           # My Computer, file navigator, drives
│   │   ├── terminal/           # Interactive bash-like CLI shell
│   │   ├── outlook/            # Outlook Express client
│   │   └── blog/               # Markdown-powered blog viewer
│   ├── domain/                 # Domain logic & services
│   │   ├── auth/               # Credential verification & XOR/SHA-256 tokens
│   │   ├── assets/             # Asset resolvers and path utilities
│   │   ├── search/             # Global system search engine
│   │   └── resume/             # Multilingual curriculum vitae data
│   ├── contexts/               # React Context Providers
│   │   ├── AppContext.tsx      # System mode (grub|webos|blog|terminal), theme, language
│   │   └── WeatherContext.tsx  # Dynamic weather simulation & particle effects
│   ├── shells/                 # Shell renderers & desktop managers
│   │   ├── desktop/            # DesktopShell, WindowManager, taskbar, start menu
│   │   └── os/                 # OS skin classifiers, class names, and registry
│   ├── styles/                 # Global styles & theme stylesheets
│   │   └── os/themes/          # Dedicated CSS per OS (win7, classic, ubuntu, macos)
│   ├── themes/                 # Full OS theme packages
│   │   ├── winxp/              # Windows XP Luna: boot, login, welcome, sounds, css
│   │   ├── win7/               # Windows 7 Aero: glowing boot orb, login, glass css
│   │   ├── webos/              # WebOS container: boots, login, welcome, transitions
│   │   └── apple/              # macOS / iOS lock screens & session screens
│   └── i18n/                   # Multilingual translation dictionaries (ru, en, etc.)
```

---

## 3. Operating System Themes & Lifecycles

Every full desktop OS in `src/themes/` operates via a multi-phase state machine:

```
[Grub Menu / Boot Picker]
        │
        ▼ (setMode('webos') + setTheme(themeId))
  [BootScreen] ──── (onComplete after progress / animation) ───┐
                                                                │
                                                                ▼
                                                          [LoginScreen]
                                                                │
                                                   (User authenticates account)
                                                                ▼
                                                         [WelcomeScreen]
                                                                │
                                                   (onComplete after sound/chime)
                                                                ▼
                                                        [DesktopShell]
                                                       (Windows, Apps, Tray)
                                                                │
                                   ┌────────────────────────────┴───────────────────────────┐
                                   ▼                                                        ▼
                        [SystemTransitionScreen: logoff]                 [SystemTransitionScreen: shutdown]
                                   │                                                        │
                                   ▼                                                        ▼
                             [LoginScreen]                                             [Grub Menu]
```

### OS Theme Registry:
- **`win-xp`**: Windows XP Professional (Luna Blue theme, authentic sound synthesis, Start menu with pinned/recent programs, Explorer task pane).
- **`webos`**: Standard WebOS suite with modular boot, login, and desktop launcher, featuring the `loops` application.
- **`win-98`**: Classic teal (`#008080`) desktop, 3D beveled windows, Start Menu with retro icons, classic login dialog.
- **`win7`**: Windows 7 Aero Glass, glowing four-color orb boot screen, blur taskbar, glass window headers.
- **`macos` / `apple`**: Aqua / Ventura styling, Apple system top bar, dock with bouncing icons, blurred notification center.
- **`ubuntu` / `arch`**: Linux styling with Yaru dark theme / terminal-centric desktop.

---

## 4. Authentication & Security Engine

Credentials and account authorization are managed by `src/domain/auth/credentials.ts`:
- **Primary account**: `c4m1r` (case-insensitive normalized).
- **Password**: Obfuscated secret master password (verified strictly via XOR token cipher & SHA-256 digest in `credentials.ts`).
- **Storage policy**: Passwords are **never** stored in plain text anywhere in source files, docs, or bundle outputs.
  - **Obfuscation**: XOR cipher token with key `0x65` (`[0x54, 0x57, 0x56, 0x54, 0x57, 0x56]`).
  - **Digest**: Salted SHA-256 hash (`ac0d0deae2a1d4e30a799234e867fc1d6f3f371d587924d8f327c4b74e82383b`).
- **Validation**:
  - `verifyAccountPassword(username, passwordAttempt)` (synchronous, zero-overhead).
  - `verifyAccountPasswordAsync(username, passwordAttempt)` (Web Crypto API SHA-256).

---

## 5. Standard Operating Rules for AI Agents

1. **Do Not Poll**: When running background commands or timers, allow reactive notification wakeups. Do not poll in busy loops.
2. **Never Import from `/eat/`**:
   - `eat/` is gitignored and contains reference donor repos.
   - When absorbing assets, copy them to `src/themes/<theme>/assets/` or `src/apps/<app>/assets/` and import them locally.
3. **Preserve Comments & Docstrings**: Never strip existing Russian or English explanatory comments in unaffected regions.
4. **TypeScript Strictness**:
   - No implicit `any`.
   - Never suppress type errors with `@ts-ignore` unless unavoidable third-party library limitations require `@ts-expect-error` with rationale.
5. **Vite Asset Resolution**:
   - Audio files: `import soundUrl from './assets/sound.mp3'` (resolves to Vite static URL).
   - Icons: `.png`, `.svg`, and `.ico` can be imported directly and assigned to `img.src`.
   - Vertical sliders: Avoid `orient="vertical"` attribute (unsupported by React HTML input typing). Use CSS `appearance: slider-vertical; -webkit-appearance: slider-vertical;`.
6. **Task Tracking**:
   - Document all completed tasks in `docs/tasks.md` using the canonical task schema (`TASK-XXX-YY`).

---

## 6. Testing & Quality Assurance Commands

Always execute the complete gate verification prior to completing any agent session:

```bash
# 1. Typecheck the entire TypeScript codebase
npm run typecheck

# 2. Run ESLint across all source files
npm run lint

# 3. Compile the production bundle via Vite
npm run build

# 4. Clean up dist artifacts
npm run clean

# 5. Verify Context boundaries
npm run verify

# 6. Check for git whitespace residue
git diff --check
```
