import { type ComponentType } from 'react';
import { DesktopShellContainer } from './DesktopShellContainer';
import { type DesktopShellProps } from './desktopTypes';

export { type DesktopShellProps } from './desktopTypes';

/**
 * Desktop runtime boundary contract.
 *
 * DesktopShell is the public desktop entrypoint used by theme wrappers.
 * All desktop runtime components, hooks, surfaces, and orchestration layers
 * are now 100% owned under src/shells/desktop.
 */
export const DesktopRuntime: ComponentType<DesktopShellProps> = DesktopShellContainer;
