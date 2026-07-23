import { type ReactNode } from 'react';

export type DesktopSystemCommand = 'logoff' | 'shutdown';

export interface DesktopShellProps {
  onSystemCommand?: (command: DesktopSystemCommand) => void;
}

export interface DesktopPosition {
  x: number;
  y: number;
}

export interface DesktopSize {
  width: number;
  height: number;
}

export interface DesktopSelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DesktopIcon {
  id: string;
  icon: ReactNode;
  label: string;
  type: 'folder' | 'system';
  x?: number;
  y?: number;
}
