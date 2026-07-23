# Desktop Shell

Папка `src/shells/desktop/` фиксирует публичную границу desktop runtime:
- `DesktopShell.tsx` — публичный entrypoint, который используют theme wrappers.
- `DesktopRuntime.tsx` — временный adapter к legacy `themes/webos/Desktop.tsx`; это единственное допустимое место прямого импорта legacy implementation.
- `desktopTypes.ts` — runtime contracts и безопасные shared-типы рабочего стола.
- `desktopConstants.ts` — runtime-level constants без theme-specific assets/styles.
- `runtime/` — маленькие pure helpers для geometry, storage, z-index и theme/shortcut filtering.
- `appRegistry.tsx` — реестр доступных для запуска приложений и сопоставление их `appId` с React-компонентами.
- `shortcutsRegistry.ts` — реестр ярлыков рабочего стола и меню Пуск.
- `apps/` — папка со встроенными desktop-shell приложениями.

Legacy window-manager/state orchestration пока остаётся в `themes/webos/Desktop.tsx` и должно переноситься постепенно, без изменения boot/login/welcome flow и без визуального редизайна.
