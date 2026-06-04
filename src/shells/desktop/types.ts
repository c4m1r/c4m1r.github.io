import { Language } from '../../i18n/translations';
import { ThemeId } from '../../contexts/AppContext';
import { ContentKind } from '../../domain/content/types';

export interface DesktopAppDefinition {
  id: string;
  title: Record<Language, string>;
  iconKey?: string; // key of ThemeAssets or standard asset key
  customIcon?: string; // direct path to import
  contentKinds?: ContentKind[];
  component: React.ComponentType<any>;
  defaultWindow: {
    width: number;
    height: number;
    resizable?: boolean;
  };
  showInStartMenu?: boolean;
  showOnDesktop?: boolean;
  supportedThemes?: ThemeId[];
}
