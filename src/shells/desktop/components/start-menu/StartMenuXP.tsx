import { useEffect, useState } from 'react';
import { useApp } from '../../../../contexts/useApp';
import { translations } from '../../../../i18n/translations';
import { ChevronRight, ChevronsRight } from 'lucide-react';
import { THEME_ASSETS, ThemeAssetId } from '../../../../themes/webos/themeAssets';
import { getActiveEdition } from '../../../os/osEditions';
import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import { buildXpStartMenuLists, type MenuItem } from './startMenuXpLists';
import { useFlyoutChain } from './startMenuFlyout';
import { FlyoutPanel } from './StartMenuFlyoutPanel';
import { getSessionAccount } from '../../../../domain/auth/session';
import xpUserDefaultPicture from '../../../../themes/winxp/assets/avatars/user4.png';

import logoffIcon from '../../../../themes/winxp/assets/icons/logoff.png';
import shutdownIcon from '../../../../themes/winxp/assets/icons/shutdown.png';

export interface StartMenuXPProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  appearance?: 'webos' | 'win-xp';
  onHover?: () => void;
}

export function StartMenuXP({ onClose, onLaunchApp, onOpenPath, onSystemCommand, appearance = 'webos', onHover }: StartMenuXPProps) {
  const { language, theme } = useApp();
  const t = translations[language].xp;
  const isRu = language === 'ru';
  const currentTheme = theme as ThemeAssetId;
  const activeEdition = getActiveEdition(theme);
  const themeAssets = THEME_ASSETS[currentTheme] ?? THEME_ASSETS.webos;
  const userAvatar = themeAssets.userAvatar;
  // The header follows the account chosen at login: User gets its default picture,
  // C4m1r keeps its animated avatar.
  const sessionAccount = getSessionAccount();
  const headerAvatar = sessionAccount === 'User' ? xpUserDefaultPicture : userAvatar;
  const fallbackIcon = themeAssets.folderIcon ?? themeAssets.projectsIcon;
  const handleHover = () => {
    onHover?.();
  };
  const [allProgramsOpen, setAllProgramsOpen] = useState(false);
  const flyout = useFlyoutChain<MenuItem>();
  const resetFlyout = flyout.reset;
  useEffect(() => {
    if (!allProgramsOpen) resetFlyout();
  }, [allProgramsOpen, resetFlyout]);

  const gamesTitle = t.games ?? (isRu ? 'Игры' : 'Games');

  const { pinnedPrograms, allProgramsEntries, frequentPrograms, placesLinks } = buildXpStartMenuLists({ isRu, language, gamesTitle, themeAssets });

  // User entries from Start Menu\Programs (StartUp included). The flat list shows each folder as a
  // row that opens it in Explorer; shortcuts launch their app.
  const toProgramEntry = (node: StartMenuNode): MenuItem => ({
    id: `user:${node.path ?? node.appId ?? node.label}`,
    title: node.label,
    icon: node.iconSrc ?? fallbackIcon,
    appId: node.appId,
    path: node.submenu ? undefined : node.path,
    submenu: node.submenu?.map(toProgramEntry),
  });
  const userProgramEntries: MenuItem[] = startMenuFolderNodes(startMenuProgramsPath(sessionAccount), () => null)
    .map(toProgramEntry);

  const renderProgramRow = (program: MenuItem, depth: number) => (
    <button
      key={program.id}
      type="button"
      className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-[#316ac5] hover:text-white"
      onClick={() => {
        if (program.submenu) return;
        handleMenuAction(program);
        setAllProgramsOpen(false);
      }}
      onMouseEnter={(event) => {
        handleHover();
        flyout.hover(depth, program, event.currentTarget.getBoundingClientRect());
      }}
    >
      {program.icon ? <img src={program.icon} alt="" className="h-5 w-5 object-contain" /> : <span className="h-5 w-5" />}
      <span className="flex-1">{program.title}</span>
      {program.submenu ? <ChevronRight size={12} className="opacity-70" /> : null}
    </button>
  );


  const frequentLabel = t.frequentPrograms ?? (isRu ? 'Часто используемые программы' : 'Frequently used programs');
  const allProgramsLabel = t.allPrograms ?? (isRu ? 'Все программы' : 'All Programs');
  const logOffLabel = t.logOff ?? (isRu ? 'Завершение работы' : 'Log Off');
  const turnOffLabel = t.turnOff ?? (isRu ? 'Выключить компьютер' : 'Turn Off Computer');

  const handleMenuAction = (entry: MenuItem) => {
    if (entry.disabled) {
      onClose();
      return;
    }
    if (entry.appId) {
      onLaunchApp?.(entry.appId);
      onClose();
      return;
    }
    if (entry.path) {
      onOpenPath?.(entry.path);
      onClose();
      return;
    }
    if (entry.url) {
      window.open(entry.url, '_blank', 'noreferrer');
      onClose();
      return;
    }
    onLaunchApp?.(`unavailable:${entry.title ?? entry.id}`);
    onClose();
  };

  return (
    <section
      className={`fixed z-[99999] left-0 min-w-[380px] min-h-[494px] flex flex-col start-menu-modern start-menu-${appearance} os-panel`}
      style={{
        bottom: '30px',
        filter: 'drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.4))',
        borderStyle: 'solid',
        borderColor: '#3e74cd #1854c2',
        borderWidth: '1px 1px 0',
        borderRadius: '7px 7px 0 0',
        overflow: 'hidden',
        boxShadow: 'inset -20px 0px 4px -19px #1854c2',
        pointerEvents: 'auto',
        animation: 'slideUpFade 150ms ease-out',
      }}
    >
      {/* Header */}
      <header
        className="relative flex items-center text-white start-menu__header"
        style={{
          height: '60px',
          padding: '8px',
          width: '100%',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          background: 'linear-gradient(to bottom, #245EDC 0%, #3F8CF3 7%, #245EDC 50%, #1941A5 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Top highlight line */}
        <div
          className="absolute top-[1px] left-0 w-full h-[3px]"
          style={{
            background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.3) 1%, rgba(255, 255, 255, 0.5) 2%, rgba(255, 255, 255, 0.5) 95%, rgba(255, 255, 255, 0.3) 98%, rgba(255, 255, 255, 0.2) 99%, transparent 100%)',
            boxShadow: 'inset 0 -1px 1px #0e60cb',
          }}
        />
        {headerAvatar && (
          <img
            src={headerAvatar}
            alt={sessionAccount}
            className="w-[42px] h-[42px] mr-[5px] rounded-[3px] border-2"
            style={{
              borderColor: 'rgba(222, 222, 222, 0.8)',
              backgroundColor: 'black',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
          <span
            className="text-[14px] font-bold truncate"
            style={{
              textShadow: '1px 1px rgba(0, 0, 0, 0.7)',
            }}
          >
            {sessionAccount}
          </span>
          {activeEdition && (
            <span
              className="text-[11px] font-normal opacity-85 text-blue-100 truncate"
              style={{
                textShadow: '1px 1px rgba(0, 0, 0, 0.6)',
              }}
            >
              • {activeEdition.label}
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <section
        className="flex relative"
        style={{
          margin: '0 2px',
          borderTop: '1px solid #385de7',
          boxShadow: '0 1px #385de7',
        }}
      >
        {/* Orange HR line */}
        <hr
          className="absolute left-0 right-0 top-0 h-[3px] border-0"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, #F7931E 50%, rgba(0, 0, 0, 0) 100%)',
          }}
        />

        {/* Left Menu - Programs */}
        <div className="start-menu-section start-menu-section--left os-list">
          {pinnedPrograms.length > 0 && (
            <>
              <div className="start-menu-separator start-menu-separator--dense" />
              {pinnedPrograms.map((program) => {
                const iconSrc = program.icon ?? fallbackIcon;
                return (
                  <button
                    key={program.id}
                    className={`start-menu-item os-list-item ${program.disabled ? 'disabled' : ''}`}
                    disabled={program.disabled}
                    onClick={() => handleMenuAction(program)}
                    onMouseEnter={handleHover}
                  >
                    <div className="start-menu-item__icon">
                      {iconSrc ? (
                        <img src={iconSrc} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <span className="w-6 h-6" />
                      )}
                    </div>
                    <div className="start-menu-item__title">{program.title}</div>
                  </button>
                );
              })}
              <div className="start-menu-separator start-menu-separator--dense" />
            </>
          )}

          <div className="start-menu-section__title">{frequentLabel}</div>

          {frequentPrograms.map((program, index) => {
            if (program.isSeparator) {
              return (
                <div
                  key={`frequent-separator-${index}`}
                  className="start-menu-separator"
                />
              );
            }

            const iconSrc = program.icon ?? fallbackIcon;
            return (
              <button
                key={program.id}
                className={`start-menu-item os-list-item ${program.disabled ? 'disabled' : ''}`}
                onClick={() => handleMenuAction(program)}
                onMouseEnter={handleHover}
              >
                <div className="start-menu-item__icon">
                  {iconSrc ? (
                    <img src={iconSrc} alt={program.title} className="w-6 h-6" />
                  ) : (
                    <span className="w-6 h-6" />
                  )}
                </div>
                <div className="start-menu-item__title">{program.title}</div>
              </button>
            );
          })}

          <div className="flex-grow" />

          {/* Separator */}
          <div className="start-menu-separator" />

          {/* All Programs opens as a native XP-style fly-out panel above the footer row. */}
          <div className="relative">
            <button
              type="button"
              className="start-menu-item start-menu-item--footer"
              aria-expanded={allProgramsOpen}
              aria-controls="xp-start-menu-all-programs"
              onClick={() => setAllProgramsOpen((open) => !open)}
              onMouseEnter={handleHover}
            >
              <span>{allProgramsLabel}</span>
              <ChevronsRight size={14} className="opacity-70" />
            </button>
          {allProgramsOpen && flyout.chain.map((level, index) => (
            <FlyoutPanel
              key={index}
              level={level}
              className="border border-[#7f9db9] bg-white py-0 text-[#111] shadow-xl min-w-[200px]"
            >
              {level.items.map((program) => renderProgramRow(program as MenuItem, index + 1))}
            </FlyoutPanel>
          ))}
          {allProgramsOpen && (
            <div id="xp-start-menu-all-programs" className="start-menu-all-programs absolute bottom-full left-0 z-[100001] mb-1 max-h-[min(60vh,420px)] w-full overflow-y-auto border border-[#7f9db9] bg-white text-[#111] shadow-xl">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#555]">
                {isRu ? 'Установленные программы' : 'Installed programs'}
              </div>
              {[...allProgramsEntries, ...userProgramEntries].map((program) => renderProgramRow(program, 0))}
            </div>
          )}
          </div>
        </div>

        {/* Right Menu - Places */}
        <div
          className="start-menu-section start-menu-section--right os-list"
        >
          {placesLinks.map((place, index) => {
            if (place.isSeparator) {
              return (
                <div
                  key={`places-separator-${index}`}
                  className="start-menu-separator"
                />
              );
            }

            const iconSrc = place.icon ?? fallbackIcon;
            return (
              <button
                key={place.id}
                className={`start-menu-item os-list-item ${place.disabled ? 'disabled' : ''}`}
                disabled={place.disabled}
                onClick={() => handleMenuAction(place)}
                onMouseEnter={handleHover}
              >
                <div className="start-menu-item__icon">
                  {iconSrc ? (
                    <img src={iconSrc} alt="" className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="w-5 h-5" />
                  )}
                </div>
                <div className="start-menu-item__title font-bold">{place.title}</div>
              </button>
            );
          })}

          {/* Separator */}
          <div className="start-menu-separator" />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="flex self-end items-center justify-end text-white h-9 w-full px-3"
        style={{
          background: 'linear-gradient(to bottom, #4282d6 0%, #3b85e0 3%, #418ae3 5%, #418ae3 17%, #3c87e2 21%, #3786e4 26%, #3482e3 29%, #2e7ee1 39%, #2374df 49%, #2072db 57%, #196edb 62%, #176bd8 72%, #1468d5 75%, #1165d2 83%, #0f61cb 88%)',
        }}
      >
        <button
          className="p-1 flex mr-3 items-center hover:bg-white/20 cursor-pointer rounded bg-transparent border-0 text-white text-[12px] font-sans"
          onClick={() => {
            onSystemCommand?.('logoff');
            onClose();
          }}
          onMouseEnter={handleHover}
        >
          <img src={logoffIcon} alt="" className="w-5 h-5 mr-1.5 object-contain" />
          <span>{logOffLabel}</span>
        </button>
        <button
          className="p-1 flex items-center hover:bg-white/20 cursor-pointer rounded bg-transparent border-0 text-white text-[12px] font-sans"
          onClick={() => {
            onSystemCommand?.('shutdown');
            onClose();
          }}
          onMouseEnter={handleHover}
        >
          <img src={shutdownIcon} alt="" className="w-5 h-5 mr-1.5 object-contain" />
          <span>{turnOffLabel}</span>
        </button>
      </footer>
    </section>
  );
}