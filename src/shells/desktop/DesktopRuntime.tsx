import { type ComponentType } from 'react';
import { Desktop } from '../../themes/webos/Desktop';
import { type DesktopShellProps } from './desktopTypes';

export { type DesktopShellProps } from './desktopTypes';

/**
 * Desktop runtime boundary contract.
 *
 * DesktopShell is the public desktop entrypoint used by theme wrappers.
 * DesktopRuntime currently adapts the legacy WebOS Desktop implementation.
 * All new runtime helpers/types must live under src/shells/desktop.
 * Theme folders must not receive new window-manager logic.
 *
 * TODO: move runtime/window-manager/icon/start-menu ownership into
 * src/shells/desktop/runtime gradually, while keeping theme assets, boot/login
 * surfaces, and theme-specific styles under src/themes. This remains the only
 * allowed direct dependency on the legacy WebOS Desktop implementation until
 * that extraction is safe.
 */
export const DesktopRuntime: ComponentType<DesktopShellProps> = Desktop;
