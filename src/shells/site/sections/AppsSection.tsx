import { type Dispatch, type SetStateAction } from 'react';
import { type AppCategoryId, type AppEntry } from '../../../domain/apps/apps.types';
import { routes } from '../siteRoutes';

const APP_CATEGORIES: AppCategoryId[] = ['ready', 'prototype', 'webos-emulation'];

interface AppsSectionProps {
  appsByCategory: Record<AppCategoryId, AppEntry[]>;
  selectedApp: AppEntry | null;
  setSelectedApp: Dispatch<SetStateAction<AppEntry | null>>;
  iframeHeight: number;
  setIsResizing: Dispatch<SetStateAction<boolean>>;
  language: string;
  ui: {
    apps: {
      title: string;
      subtitle: string;
      selectPrompt: string;
      platformsLabel: string;
      badgesLabel: string;
      dateLabel: string;
      categories: Record<AppCategoryId, string>;
    };
  };
}

export function AppsSection({
  appsByCategory,
  selectedApp,
  setSelectedApp,
  iframeHeight,
  setIsResizing,
  language,
  ui,
}: AppsSectionProps) {
  const selectApp = (app: AppEntry) => {
    setSelectedApp(app);
    window.history.pushState({}, '', routes.app(app.id));
  };

  return (
    <section className="w-full px-6 py-12 space-y-8">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {ui.apps.subtitle}
        </div>
        <h2 className="text-4xl font-bold">{ui.apps.title}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl">{ui.apps.selectPrompt}</p>
      </div>

      <div className="space-y-6">
        <div className="w-full">
          <div className="glass rounded-3xl border border-border neu-sm overflow-hidden" data-iframe-container>
            {selectedApp ? (
              <>
                <div className="relative w-full overflow-hidden bg-background" style={{ height: `${iframeHeight}px` }}>
                  {selectedApp.url ? (
                    <iframe
                      title={selectedApp.iframeTitle ?? selectedApp.title}
                      src={selectedApp.url}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      sandbox="allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      No preview available
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 z-10">
                    {(selectedApp.badges || []).map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full bg-primary text-primary-foreground shadow-lg"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="relative h-10 bg-gradient-to-b from-border/20 via-border/40 to-border/60 cursor-ns-resize hover:bg-primary/20 transition-all group select-none"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setIsResizing(true);
                  }}
                  title="Drag to resize"
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">Resize</div>
                      <div className="flex gap-1.5">
                        <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                        <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                        <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">Loading apps...</div>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="space-y-4">
              {APP_CATEGORIES.map((category) => {
                const items = appsByCategory[category] || [];
                const label = ui.apps.categories[category] || category;
                return (
                  <div key={category} className="glass rounded-2xl border border-border p-4 neu-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold">{label}</h3>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">{items.length}</span>
                    </div>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Soon.</p>
                    ) : (
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {items.map((app) => {
                          const isActive = selectedApp?.id === app.id;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              className={`w-full text-left rounded-xl border transition-all duration-200 px-3 py-2 ${
                                isActive
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-border/60 bg-card/50 hover:border-primary/60 hover:bg-card'
                              }`}
                              onClick={() => selectApp(app)}
                            >
                              <div className="font-semibold text-sm">{app.title}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{app.date || 'N/A'}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedApp && (
              <div className="glass rounded-3xl border border-border p-6 neu-sm space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">{selectedApp.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedApp.description || selectedApp.content || 'Description is missing.'}
                    </p>
                  </div>
                  {selectedApp.url && (
                    <button
                      type="button"
                      onClick={() => window.open(selectedApp.url, '_blank', 'noreferrer')}
                      className="neu px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform whitespace-nowrap"
                    >
                      {language === 'ru' ? 'Открыть' : 'Open Full'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border/50">
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                      {ui.apps.dateLabel || 'Date'}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{selectedApp.date || 'N/A'}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                      {ui.apps.platformsLabel || 'Platforms'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(!selectedApp.platforms || selectedApp.platforms.length === 0) ? (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      ) : (
                        selectedApp.platforms.map((platform) => (
                          <span key={platform} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold">
                            {platform}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                      {language === 'ru' ? 'Технологии' : 'Technologies'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(!selectedApp.technologies || selectedApp.technologies.length === 0) ? (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      ) : (
                        selectedApp.technologies.map((tech) => (
                          <span key={tech} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                            {tech}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                      {ui.apps.badgesLabel || 'Tags'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(!selectedApp.badges || selectedApp.badges.length === 0) ? (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      ) : (
                        selectedApp.badges.map((badge) => (
                          <span key={badge} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                            {badge}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
