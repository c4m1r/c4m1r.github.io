import { DesktopRuntime, type DesktopShellProps } from './DesktopRuntime';

/** Public desktop shell entrypoint used by OS theme wrappers. */
export function DesktopShell(props: DesktopShellProps) {
  return <DesktopRuntime {...props} />;
}
