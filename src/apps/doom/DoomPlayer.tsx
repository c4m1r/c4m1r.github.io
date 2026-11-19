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
  const [frameLoaded, setFrameLoaded] = useState(false);

  useEffect(() => {
    setActiveBuildId(builds[0]?.id ?? 'webgl');
    setFrameFailed(false);
    setFrameLoaded(false);
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
      <header className="doom-player__chrome px-3 py-2 border-b border-[#272727] bg-[#101010]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-[#f44336] drop-shadow">
              {variant.title}
            </h1>
            {variant.subtitle && (
              <p className="text-[#e0e0e0] text-[11px]">{variant.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {variant.builds.map((build) => (
              <button
                key={build.id}
                onClick={() => { setActiveBuildId(build.id); setFrameFailed(false); setFrameLoaded(false); }}
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
        <p className="text-[#bcbcbc] mt-2">
          {isRu ? variant.description.ru : variant.description.en}
        </p>
      </header>

      <div className="doom-player__stage flex-1 relative bg-black overflow-hidden">
        <div className="doom-player__status absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-3 border border-[#555] bg-black/85 px-3 py-2 text-[11px] text-[#f5d98a]">
          <span>
            {frameFailed
              ? (isRu ? 'Не удалось подтвердить загрузку встроенной страницы.' : 'The embedded page could not be confirmed as loaded.')
              : frameLoaded
                ? (isRu ? 'Страница iframe загружена; запуск игрового движка и доступность управления не подтверждены.' : 'The iframe page loaded; game engine startup and input are not verified.')
                : (isRu ? 'Ожидание ответа внешней страницы. Загрузка iframe не гарантирует запуск игры.' : 'Waiting for the external page. An iframe load does not guarantee that the game started.')}
          </span>
          <a href={activeBuild.url} target="_blank" rel="noreferrer" className="shrink-0 underline text-[#9fd4ff]">
            {isRu ? 'В отдельной вкладке' : 'Open separately'}
          </a>
        </div>
        <iframe
          key={activeBuild.url}
          src={activeBuild.url}
          title={variant.title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          onLoad={() => { setFrameLoaded(true); setFrameFailed(false); }}
          onError={() => { setFrameLoaded(false); setFrameFailed(true); }}
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
        <div className="doom-player__tip absolute bottom-2 right-4 bg-[#111]/80 px-3 py-2 rounded text-[11px] text-[#ffb400] border border-[#ffb400]/40 shadow-lg max-w-sm">
          {isRu
            ? 'Важно: успешная загрузка страницы не означает, что игровой движок запустился. Проверяй управление, звук и игровой процесс отдельно.'
            : 'Important: a successful page load does not mean the game engine started. Verify controls, audio and gameplay separately.'}
        </div>
      </div>

      <footer className="doom-player__footer bg-[#101010] border-t border-[#272727] px-3 py-2 text-[#bcbcbc] text-[11px] flex justify-between">
        <span>Emupedia / wasm-doom</span>
        <span>{isRu ? 'Все права принадлежат id Software.' : 'All rights belong to id Software.'}</span>
      </footer>
    </div>
  );
}
