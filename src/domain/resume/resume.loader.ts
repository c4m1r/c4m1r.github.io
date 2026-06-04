/**
 * domain/resume/resume.loader.ts
 *
 * Single loader — reads cv-data.json and returns a typed, locale-aware
 * CvLocale for any supported language key.
 *
 * Both site-визитка (BlogSite) and Desktop ResumeApp (MyCV) call this.
 * Nothing else imports cv-data.json directly.
 */

import cvDataRaw from '../../content/cv/cv-data.json';
import type { CvData, CvLocale, CvTabId } from './resume.types';

const CV_DATA = cvDataRaw as CvData;

/** Ordered canonical tab list (shared across site + desktop) */
export const CV_TABS: CvTabId[] = ['education', 'it', 'gamedev', 'rewards'];

/**
 * Returns the locale-specific CV data for `lang`.
 * Falls back to 'en' if the locale is not found.
 */
export function loadCvLocale(lang: string): CvLocale {
  return CV_DATA[lang] ?? CV_DATA['en'];
}

/**
 * Returns the raw CvData for all locales.
 * Useful for static export / SSR.
 */
export function getRawCvData(): CvData {
  return CV_DATA;
}

/**
 * Returns a list of supported language keys present in the JSON.
 */
export function getSupportedCvLocales(): string[] {
  return Object.keys(CV_DATA);
}
