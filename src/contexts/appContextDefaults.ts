import { type Language, detectLanguage } from '../i18n/translations';
import { siteUrlConfig } from '../shells/site/siteUrlConfig';
import { type AppMode } from './appContextTypes';

export const LANGUAGE_STORAGE_KEY = 'webos-language';

const supportedLanguages: Language[] = ['en', 'ru', 'fr', 'es', 'zh', 'ja', 'ko'];

const isLanguage = (value: string | null): value is Language =>
  !!value && (supportedLanguages as readonly string[]).includes(value);

export const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLanguage(stored)) {
    return stored;
  }
  return detectLanguage();
};

export const getInitialMode = (): AppMode => {
  if (typeof window === 'undefined') {
    return 'grub';
  }

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect?.startsWith(siteUrlConfig.basePath)) {
    window.history.replaceState({}, '', redirect);
    return 'blog';
  }

  if (window.location.pathname.startsWith(siteUrlConfig.basePath)) {
    return 'blog';
  }

  return 'grub';
};
