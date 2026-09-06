/**
 * ExploreSystemSection — Home page section highlighting the interactive pseudo-OS capability.
 * Uses enabledOsBootProfiles from src/shells/os/osProfiles.ts.
 */

import { Terminal, Cpu, ArrowRight, Play } from 'lucide-react';
import { enabledOsBootProfiles } from '../../os/osProfiles';
import { useApp } from '../../../contexts/useApp';
import { type OsBootProfile } from '../../os/osTypes';

interface ExploreSystemSectionProps {
  onOpenGrub?: () => void;
}

const OS_ICONS: Record<string, string> = {
  'win-xp': '🪟',
  'win-98': '💾',
  'win7': '💎',
  'ubuntu': '🐧',
  'arch': '❄️',
  'ios-26': '📱',
  'ios-16': '📱',
  'ios-9': '📱',
  'ios-5': '📱',
  'halloween': '🎃',
  'terminal': '📟',
  'webos': '🌐',
  'site': '🖥️',
};

export function ExploreSystemSection({ onOpenGrub }: ExploreSystemSectionProps) {
  const { setMode, setTheme, language } = useApp();

  const titleText =
    language === 'ru'
      ? 'Интерактивные OS Окружения'
      : 'Interactive Multiverse OS';

  const subtitleText =
    language === 'ru'
      ? 'Этот сайт — полноценная программная экосистема. Выберите окружение для загрузки:'
      : 'This website double-functions as a multi-OS environment. Choose a profile to boot into:';

  const launchGrubText =
    language === 'ru'
      ? 'Открыть Загрузчик GRUB'
      : 'Launch GRUB Bootloader';

  // Exclude current 'site' profile from the environment list
  const desktopProfiles = enabledOsBootProfiles.filter((p) => p.id !== 'site');

  const handleLaunchProfile = (profile: OsBootProfile) => {
    if (profile.theme) {
      setTheme(profile.theme);
    }
    setMode(profile.mode);
  };

  return (
    <section className="container mx-auto px-6 py-20" aria-labelledby="explore-system-heading">
      <div className="glass rounded-3xl p-8 md:p-12 neu-sm border border-border/80 relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Cpu className="w-4 h-4" />
                <span>Pseudo-OS Runtime</span>
              </div>
              <h2 id="explore-system-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                {titleText}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                {subtitleText}
              </p>
            </div>

            {onOpenGrub && (
              <button
                type="button"
                onClick={onOpenGrub}
                className="neu inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform flex-shrink-0 self-start md:self-auto"
              >
                <Terminal className="w-5 h-5" />
                <span>{launchGrubText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* OS Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {desktopProfiles.map((profile) => {
              const icon = OS_ICONS[profile.id] ?? '🖥️';
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleLaunchProfile(profile)}
                  className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/60 hover:shadow-md transition-all duration-200 text-center gap-2"
                >
                  <span className="text-3xl transition-transform group-hover:scale-110" role="img" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-xs font-bold text-foreground truncate max-w-full">
                    {profile.label}
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                    <span className="sr-only">Boot into {profile.label}</span>
                    <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
