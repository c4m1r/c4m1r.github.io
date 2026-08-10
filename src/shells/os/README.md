# OS Core & Skin Architecture

This directory defines data-driven OS profiles and presentation rules for the system.

## Architectural Principles

1. **`osProfiles.ts`** controls GRUB boot entries and startup mode/theme bindings.
2. **`osSkins.ts`** controls OS-specific presentation rules (app display names, system folder labels, icon aliases, visibility overrides).
3. **`appRegistry.ts`** controls core application identity, component bindings, and default configuration.
4. **`DesktopShell`** is a single, unified runtime for all desktop skins.
5. **No OS-Specific App Forks**: All applications (News, Calculator, Terminal, etc.) remain unified singletons.
   - Do NOT create `Win7NewsApp`, `UbuntuCalculator`, or `Win98DesktopRuntime`.
   - Add OS differences exclusively through skin rules, theme IDs, and CSS wrappers.
