import { Language } from '../../i18n/translations';
import { type ThemeId } from '../../contexts/appContextTypes';
import { ContentKind } from '../../domain/content/types';

export interface DesktopAppDefinition {
  id: string;
  title: Record<Language, string>;
  iconKey?: string; // key of ThemeAssets or standard asset key
  customIcon?: string; // direct path to import
  contentKinds?: ContentKind[];
  component: React.ComponentType<Record<string, unknown>>;
  defaultWindow: {
    width: number;
    height: number;
    resizable?: boolean;
  };
  showInStartMenu?: boolean;
  showOnDesktop?: boolean;
  supportedThemes?: ThemeId[];
}
