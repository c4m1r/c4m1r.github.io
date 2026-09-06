# Desktop Shell

Папка `src/shells/desktop/` фиксирует архитектурную границу desktop runtime:

- `DesktopShell.tsx` — публичный entrypoint, используемый темизированными OS wrappers (`WindowsXP`, `Windows98`, `UbuntuOS`, `IOSPage`, etc.).
- `DesktopShellContainer.tsx` — канонический контейнер рабочего стола, управляющий панелью задач, системным треем, окнами, ярлыками, контекстными меню и диалогами.
- `runtime/windowManager.ts` — канонический движок состояния Window Manager (открытие, закрытие, сворачивание, фокус, каскадирование и позиционирование окон).
- `components/` — изолированные поверхности рабочего стола (`DesktopStartMenuSurface`, `DesktopContextMenuSurface`, `DesktopIconGrid`, `DesktopSelectionBox`, `TaskbarSystemArea`, `RunDialog`, `DesktopErrorBox`).
- `components/start-menu/` — вынесенные компоненты меню Пуск (`StartMenu`, `StartMenuXP`, `StartMenu98`).
- `desktopTypes.ts` — runtime contracts и абстракции рабочего стола.
- `desktopConstants.ts` — runtime-level константы рабочего стола.
- `appRegistry.tsx` — реестр доступных для запуска приложений и сопоставление их `appId` с React-компонентами.
- `shortcutsRegistry.ts` — реестр ярлыков рабочего стола и системного меню.
