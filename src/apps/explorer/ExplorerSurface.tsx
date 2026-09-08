import { type ComponentProps } from 'react';
import { useApp } from '../../contexts/useApp';
import { MyComputer as LegacyExplorer } from './MyComputer';
import { Windows7Explorer } from './Windows7Explorer';

export function ExplorerSurface(props: ComponentProps<typeof LegacyExplorer>) {
  const { theme } = useApp();

  if (theme === 'win7') {
    return <Windows7Explorer {...props} />;
  }

  return <LegacyExplorer {...props} />;
}
