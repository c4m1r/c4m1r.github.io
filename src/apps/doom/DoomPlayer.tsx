import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/useApp';
import { DoomVariantId, doomVariantMap } from './config';

interface DoomPlayerProps {
  variantId: DoomVariantId;
}

export function DoomPlayer({ variantId }: DoomPlayerProps) {
  const { language } = useApp();
  const variant = doomVariantMap[variantId];
  const builds = useMemo(() => variant?.builds ?? [], [variant]);
  const [activeBuildId, setActiveBuildId] = useState(builds[0]?.id ?? 'webgl');
  const [frameFailed, setFrameFailed] = useState(false);

  useEffect(() => {
    setActiveBuildId(builds[0]?.id ?? 'webgl');
    setFrameFailed(false);
  }, [variantId, builds]);

  const activeBuild = useMemo(() => {
    return builds.find((build) => build.id === activeBuildId) ?? builds[0];
  }, [activeBuildId, builds]);

  if (!variant || !activeBuild) {
    return (
      <div className="doom-player flex items-center justify-center h-full bg-black text-white font-tahoma text-sm">
        {language === 'ru' ? 'Не удалось загрузить конфигурацию DOOM.' : 'Unable to load DOOM config.'}
      </div>
    );
  }

  const isRu = language === 'ru';

  return (
    <div className="doom-player flex h-full w-full flex-col bg-[#000] text-white font-tahoma text-xs">
      <header className="doom-player__chrome flex min-h-0 shrink-0 items-center justify-between gap-3 border-b border-[#272727] bg-[#101010] px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
          <h1 className="shrink-0 text-base font-semibold tracking-wide text-[#f44336] drop-shadow">
            {variant.title}
          </h1>
          {variant.subtitle && (
            <span className="shrink-0 text-[10px] text-[#bcbcbc]">{variant.subtitle}</span>
          )}
          <p className="min-w-0 truncate text-[10px] text-[#bcbcbc]" title={isRu ? variant.description.ru : variant.description.en}>
            {isRu ? variant.description.ru : variant.description.en}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
            {variant.builds.map((build) => (
              <button
                key={build.id}
                onClick={() => { setActiveBuildId(build.id); setFrameFailed(false); }}
                className={`doom-player__button px-3 py-1 rounded border text-[11px] ${
                  build.id === activeBuildId
                    ? 'is-active bg-[#f44336] border-[#ff7961] text-white'
                    : 'bg-[#1b1b1b] border-[#3d3d3d] text-[#d0d0d0] hover:border-[#f44336]'
                }`}
              >
                {build.label}
              </button>
            ))}
            <a
              href={activeBuild.url}
              target="_blank"
              rel="noreferrer"
              className="doom-player__link px-3 py-1 rounded border border-[#9fd4ff] text-[#9fd4ff] text-[11px] hover:bg-[#9fd4ff]/10"
            >
              {isRu ? 'Открыть выбранную сборку отдельно' : 'Open selected build separately'}
            </a>
          </div>
        </div>
      </header>

      <div className="doom-player__stage flex-1 relative bg-black overflow-hidden">
        <iframe
          key={activeBuild.url}
          src={activeBuild.url}
          title={variant.title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          onError={() => setFrameFailed(true)}
        />
        {frameFailed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/95 p-6 text-center text-white">
            <strong>{isRu ? 'Встроенная версия не загрузилась' : 'The embedded build did not load'}</strong>
            <p className="max-w-lg text-xs text-gray-300">
              {isRu ? 'Встроенная навигация не удалась. Прямая ссылка может работать независимо от ограничений iframe, но доступность самой игры всё равно нужно проверить.' : 'Embedded navigation failed. The direct link may work independently of iframe restrictions, but actual game availability still needs verification.'}
            </p>
            <a href={activeBuild.url} target="_blank" rel="noreferrer" className="rounded border border-blue-400 px-4 py-2 text-sm text-blue-200 hover:bg-blue-500/20">
              {isRu ? 'Открыть игру отдельно' : 'Open game separately'}
            </a>
          </div>
        )}
    </div>

    </div>
  );
}
