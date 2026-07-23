/**
 * apps/mycv/MyCV.tsx
 *
 * Desktop CV application — uses the shared domain/resume layer.
 * No direct cv-data.json import. Visual differences come from OS CSS wrappers.
 */
import { useState } from 'react';
import profileGif from '../../themes/winxp/assets/avatars/profile.gif';
import { useResume } from '../../domain/resume/useResume';
import { useApp } from '../../contexts/useApp';
import type { CvTabId } from '../../domain/resume/resume.types';
import type { Language } from '../../i18n/translations';

const TAB_LABELS: Record<CvTabId, Record<Language, string>> = {
  education: {
    en: 'Education',
    ru: 'Образование',
    fr: 'Formation',
    es: 'Educación',
    zh: '教育',
    ja: '学歴',
    ko: '학력',
  },
  it: {
    en: 'IT',
    ru: 'IT',
    fr: 'IT',
    es: 'IT',
    zh: 'IT',
    ja: 'IT',
    ko: 'IT',
  },
  gamedev: {
    en: 'GameDev',
    ru: 'GameDev',
    fr: 'GameDev',
    es: 'GameDev',
    zh: 'GameDev',
    ja: 'GameDev',
    ko: 'GameDev',
  },
  rewards: {
    en: 'Rewards',
    ru: 'Rewards',
    fr: 'Rewards',
    es: 'Rewards',
    zh: 'Rewards',
    ja: 'Rewards',
    ko: 'Rewards',
  },
};

export function MyCV() {
  const { language } = useApp();
  const { locale, profile, tabs } = useResume();
  const [activeTab, setActiveTab] = useState<CvTabId>('education');
  const entries = locale[activeTab] ?? [];

  return (
    <div className="cv-app w-full h-full flex flex-col overflow-auto select-text">
      {/* Profile header */}
      <div className="cv-app__header flex items-center gap-4 px-5 py-4 border-b select-none">
        <div className="cv-app__avatar-wrapper w-24 h-24 rounded-full flex items-center justify-center border shadow-inner">
          <img src={profileGif} alt="Profile" className="cv-app__avatar w-20 h-20 rounded-full" />
        </div>
        <div>
          <h1 className="cv-app__name text-2xl font-semibold leading-tight">{profile.name}</h1>
          <p className="cv-app__role text-sm font-semibold">{profile.role}</p>
          <p className="cv-app__tagline text-xs">{profile.tagline}</p>
        </div>
      </div>

      {/* Tabs + entries */}
      <div className="flex-1 px-5 pt-4">
        <div className="cv-app__tabs flex gap-2 mb-4 select-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cv-app__tab-button px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                activeTab === tab ? 'selected' : ''
              }`}
            >
              {TAB_LABELS[tab][language] ?? TAB_LABELS[tab].en}
            </button>
          ))}
        </div>

        <div className="cv-app__entries space-y-3 pb-6">
          {entries.map((entry, index) => (
            <div
              key={`${entry.title}-${index}`}
              className="cv-app__entry rounded-lg px-4 py-3 shadow-sm border"
            >
              <div className="flex justify-between items-baseline gap-3">
                <div>
                  <h2 className="cv-app__entry-title text-sm font-bold">{entry.title}</h2>
                  {entry.subtitle && <p className="cv-app__entry-subtitle text-xs">{entry.subtitle}</p>}
                </div>
                {entry.year && <span className="cv-app__entry-year text-[11px] font-semibold">{entry.year}</span>}
              </div>
              {entry.details && (
                <ul className="cv-app__entry-details mt-2 text-xs space-y-1 list-disc list-inside">
                  {entry.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
