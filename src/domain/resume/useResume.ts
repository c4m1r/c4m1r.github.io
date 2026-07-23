/**
 * domain/resume/useResume.ts
 *
 * React hook — resolves the current language from AppContext and returns
 * the typed ResumeSlice for any component that needs CV data.
 *
 * Usage:
 *   const { locale, profile, tabs } = useResume();
 *   const entries = locale[activeTab];
 */

import { useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import { loadCvLocale, CV_TABS } from './resume.loader';
import type { ResumeSlice } from './resume.types';

/** Static profile info — edit here to update both site + desktop app */
export const RESUME_PROFILE = {
  name: 'C4m1r',
  role: 'IT Engineer / Indie Game Architect',
  tagline: 'WebOS by C4m1r · XP Experience Pack',
} as const;

/**
 * Returns the full resume slice for the currently selected language.
 * Memoised on language changes only.
 */
export function useResume(): ResumeSlice {
  const { language } = useApp();

  const locale = useMemo(() => loadCvLocale(language), [language]);

  return {
    locale,
    profile: RESUME_PROFILE,
    tabs: CV_TABS,
  };
}
