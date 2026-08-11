# iOS Version Boot Profiles & iPad Support Metadata

This document records the architectural details and metadata rules for the iOS version boot entries added to `c4m1r.github.io`.

---

## Architectural Principles

1. **GRUB Displays OS Versions Only**: Boot menu options show exact OS versions (`iOS 26.6.1`, `iOS 16.7.16`, `iOS 9.3.6`, `iOS 5.1.1`). They do NOT show iPad model names (`iPad 1`, `iPad 3`).
2. **iPad Support Cycle Exposed in Metadata**: Representative iPad hardware generations and support cycles appear inside System Info / Control Panel metadata rather than as separate OS runtimes.
3. **Single Desktop Shell**: `DesktopShell` remains a single unified React engine. No `iPad1Desktop`, `iPad3Desktop`, or `iOSDesktopRuntime` components were created.
4. **Zero Heavy Binary Asset Addition**: 0 new `.mp3`, `.gif`, `.webm`, or large image assets were added. Styling is implemented entirely via scoped CSS gradients, backdrop filters, and existing tracked assets.
5. **Protected Portfolio Apps**: All 6 core portfolio content apps (`my-cv`, `projects-grid`, `blog`, `wiki`, `about`, `content-reader`) remain protected from system folder renaming.
6. **Feature Flag Priority**: `features.news = false` in `src/config/features.ts` maintains absolute precedence over OS skin display rules.

---

## OS Versions & Representative iPad Support Metadata

### 1. iOS 26.6.1 (`ios-26`)
- **GRUB Label**: `iOS 26.6.1`
- **Design Era**: Modern glass / blur (`ios-modern-blur`)
- **Source Status**: `user-requested` (UI display label requested as iOS 26.6.1; official Apple security page currently documents iOS/iPadOS 26.6).
- **Representative Devices**: iPad Pro / iPad Air modern support cycle (iPad 8th gen+, iPad Air 3rd gen+, iPad mini 5th gen+, iPad Pro 11-inch 1st gen+, iPad Pro 12.9-inch 3rd gen+).
- **Support Cycle Label**: Modern iPadOS 26 support cycle.
- **Verification Note**: Display label requested; verify exact patch availability before treating as official.

### 2. iOS 16.7.16 (`ios-16`)
- **GRUB Label**: `iOS 16.7.16`
- **Design Era**: Flat translucent (`ios-flat-blur`)
- **Source Status**: `apple-documented`
- **Representative Devices**: iPad 5th generation / iPad Pro 9.7-inch / iPad Pro 12.9-inch 1st generation.
- **Support Cycle Label**: Legacy iPadOS 16 security support cycle.

### 3. iOS 9.3.6 (`ios-9`)
- **GRUB Label**: `iOS 9.3.6`
- **Design Era**: Transitional flat (`ios-flat-blur`)
- **Source Status**: `apple-documented`
- **Representative Devices**: iPad 3rd generation Cellular / iPad 2 Cellular era.
- **Support Cycle Label**: iOS 9 legacy cellular GPS/date support cycle.
- **Note**: Fixes GPS/date rollover issue on affected older cellular models.

### 4. iOS 5.1.1 (`ios-5`)
- **GRUB Label**: `iOS 5.1.1`
- **Design Era**: Skeuomorphic glossy (`ios-old-glass`)
- **Source Status**: `apple-documented`
- **Representative Devices**: Original iPad (1st generation) / iPad 2.
- **Support Cycle Label**: Original iPad skeuomorphic iOS support cycle.

---

## Verification Standards

- **Static Verification**: `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.
- **Asset Size Guard**: 0 new untracked binary files > 250 KB added to repository.
- **Browser Smoke Test**: GRUB boot menu verified across all entries (`Site`, `Windows XP`, `Windows 98`, `Windows 7`, `Ubuntu`, `iOS 26.6.1`, `iOS 16.7.16`, `iOS 9.3.6`, `iOS 5.1.1`, `Terminal`, `WebOS`).
