/**
 * domain/resume/resume.types.ts
 *
 * Single source of truth for all Resume/CV data shapes.
 * Used by the site-визитка (BlogSite) and the Desktop ResumeApp (MyCV).
 */

/** The four CV sections that exist in cv-data.json */
export type CvTabId = 'education' | 'it' | 'gamedev' | 'rewards';

/** A single entry inside a CV tab section */
export interface CvEntry {
  title: string;
  subtitle?: string;
  year?: string;
  details?: string[];
}

/** The shape of one locale's data */
export type CvLocale = Record<CvTabId, CvEntry[]>;

/** Root JSON shape: locale key → locale data */
export type CvData = Record<string, CvLocale>;

/** The resolved resume profile consumed by UI components */
export interface ResumeProfile {
  name: string;
  role: string;
  tagline: string;
}

/** Everything a consumer needs from the resume domain */
export interface ResumeSlice {
  /** Resolved locale-aware tab data */
  locale: CvLocale;
  /** Static profile info (name, role) */
  profile: ResumeProfile;
  /** Ordered list of tab ids */
  tabs: CvTabId[];
}
