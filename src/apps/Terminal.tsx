import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/useApp';
import { translations } from '../i18n/translations';
import { AsciiAurora } from '../components/effects';

type TerminalRouteCommand = 'news' | 'wiki' | 'projects' | 'gallery' | 'apps' | 'search';

const TERMINAL_SITE_ROUTES: Record<TerminalRouteCommand, string> = {
  news: '/site/news',
  wiki: '/site/wiki',
  projects: '/site/about/projects',
  gallery: '/site/gallery',
  apps: '/site/apps',
  search: '/site/search',
};

const isRouteCommand = (cmd: string): cmd is TerminalRouteCommand =>
  Object.prototype.hasOwnProperty.call(TERMINAL_SITE_ROUTES, cmd);

const pseudoScreens: Record<string, string[]> = {
  htop: [
    'PID USER      PRI  NI  VIRT   RES   CPU% MEM%  COMMAND',
    '101 site       20   0  512M   96M    3.4  1.2  vite-preview',
    '102 content    20   0  128M   32M    0.8  0.4  markdown-index',
    '103 nerv       20   0   64M   18M    0.2  0.2  route-daemon',
  ],
  mc: [
    '┌─ Site shortcuts ───────────────────────────┐',
    '│ news      wiki      projects               │',
    '│ gallery   apps      search                 │',
    '└─────────────────────────────────────────────┘',
  ],
};

interface TerminalProps {
  isFullScreen?: boolean;
}

export function Terminal({ isFullScreen }: TerminalProps) {
  const { language, theme, setMode, mode } = useApp();
  const isAppleTerminal = theme === 'macos-26' || theme.startsWith('ios-');
  const t = translations[language].terminal;
  const isRu = language === 'ru';

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    t.welcome,
    '',
    'Type "help" for available commands, "exit" to return to GRUB.',
    '',
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, input, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const cancelScheduledShutdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setHistory((prev) => [...prev, isRu ? 'Запланированное выключение отменено.' : 'Scheduled shutdown aborted.']);
      return true;
    }
    return false;
  }, [isRu]);

  const scheduleShutdown = useCallback(
    (seconds: number, isReboot: boolean) => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      setHistory((prev) => [
        ...prev,
        isRu
          ? `[Оповещение] Система будет ${isReboot ? 'перезагружена' : 'выключена'} через ${seconds} сек.`
          : `Broadcast message from root@system: The system will ${isReboot ? 'reboot' : 'halt'} in ${seconds} seconds!`,
        isRu ? 'Для отмены введите: shutdown -a' : 'Type "shutdown -a" to abort.',
        '',
      ]);

      let remaining = seconds;
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          if (remaining % 5 === 0 || remaining <= 3) {
            setHistory((prev) => [
              ...prev,
              isRu ? `До завершения работы: ${remaining} сек...` : `Shutdown in ${remaining}s...`,
            ]);
          }
        } else {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setHistory((prev) => [
            ...prev,
            isRu ? 'Завершение работы системы...' : 'System halting now...',
          ]);
          setTimeout(() => {
            if (isReboot) {
              setMode('bios');
            } else {
              setMode('poweroff');
            }
          }, 400);
        }
      }, 1000);
    },
    [isRu, setMode]
  );

  const handleCommand = (cmd: string) => {
    const rawTrimmed = cmd.trim();
    const trimmed = rawTrimmed.toLowerCase();
    const prompt = isAppleTerminal ? '%' : '$';
    setHistory((prev) => [...prev, `${prompt} ${cmd}`]);

    if (!trimmed) {
      setInput('');
      return;
    }

    // Command: help
    if (trimmed === 'help') {
      setHistory((prev) => [
        ...prev,
        '',
        t.help,
        '  shutdown [-h|-s|-r|-a] [-t seconds] [now] - Shutdown or reboot machine',
        '  reboot - Restart system (POST boot)',
        '  poweroff / halt - Turn off computer',
        '  clear - Clear terminal display',
        '  exit - Return to GRUB bootloader',
        '  htop - Show pseudo site runtime monitor',
        '  mc - Browse site material shortcuts',
        '  news/wiki/projects/gallery/apps/search - Open site sections',
        '',
      ]);
      setInput('');
      return;
    }

    // Command: clear
    if (trimmed === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    // Command: exit -> return to GRUB
    if (trimmed === 'exit') {
      setHistory((prev) => [...prev, isRu ? 'Возврат в загрузчик GRUB...' : 'Returning to GRUB...']);
      setTimeout(() => setMode('grub'), 300);
      setInput('');
      return;
    }

    // Command: reboot
    if (trimmed === 'reboot') {
      setHistory((prev) => [...prev, isRu ? 'Перезагрузка системы...' : 'System reboot initiated...']);
      setTimeout(() => setMode('bios'), 400);
      setInput('');
      return;
    }

    // Command: poweroff / halt
    if (trimmed === 'poweroff' || trimmed === 'halt') {
      setHistory((prev) => [...prev, isRu ? 'Остановка системы...' : 'System halting...']);
      setTimeout(() => setMode('poweroff'), 400);
      setInput('');
      return;
    }

    // Command: shutdown ...
    if (trimmed.startsWith('shutdown')) {
      const parts = trimmed.split(/\s+/);

      // Handle shutdown -a / shutdown -c (abort)
      if (parts.includes('-a') || parts.includes('-c') || parts.includes('/a')) {
        const aborted = cancelScheduledShutdown();
        if (!aborted) {
          setHistory((prev) => [...prev, isRu ? 'Нет запланированного завершения работы.' : 'No scheduled shutdown to cancel.']);
        }
        setInput('');
        return;
      }

      const isReboot = parts.includes('-r') || parts.includes('/r');
      const isNow = parts.includes('now') || parts.includes('0') || parts.length === 1;

      // Check for timer -t <seconds> or trailing number
      let timerSeconds = 0;
      const tIndex = parts.indexOf('-t');
      if (tIndex !== -1 && parts[tIndex + 1]) {
        const parsed = parseInt(parts[tIndex + 1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          timerSeconds = parsed;
        }
      } else {
        // Check if last argument is a positive number
        const lastArg = parts[parts.length - 1];
        const parsed = parseInt(lastArg, 10);
        if (!isNaN(parsed) && parsed > 0) {
          timerSeconds = parsed;
        }
      }

      if (timerSeconds > 0) {
        scheduleShutdown(timerSeconds, isReboot);
      } else if (isNow || parts.includes('-s') || parts.includes('-h') || parts.includes('-r')) {
        setHistory((prev) => [
          ...prev,
          isRu
            ? `Инициировано немедленное ${isReboot ? 'перезагрузка' : 'выключение'}...`
            : `Initiating immediate ${isReboot ? 'reboot' : 'shutdown'}...`,
        ]);
        setTimeout(() => {
          if (isReboot) {
            setMode('bios');
          } else {
            setMode('poweroff');
          }
        }, 500);
      } else {
        setHistory((prev) => [
          ...prev,
          'Usage: shutdown [-h|-s|-r|-a] [-t seconds] [now]',
          '  shutdown -s -t 10   (shutdown in 10 seconds)',
          '  shutdown -r -t 10   (reboot in 10 seconds)',
          '  shutdown -a         (abort scheduled shutdown)',
          '  shutdown now        (shutdown immediately)',
        ]);
      }
      setInput('');
      return;
    }

    if (pseudoScreens[trimmed]) {
      setHistory((prev) => [...prev, '', ...pseudoScreens[trimmed], '']);
      setInput('');
      return;
    }

    if (isRouteCommand(trimmed)) {
      const target = TERMINAL_SITE_ROUTES[trimmed];
      setHistory((prev) => [...prev, `Opening ${target}…`, '']);
      window.setTimeout(() => {
        window.location.href = target;
      }, 120);
      setInput('');
      return;
    }

    setHistory((prev) => [
      ...prev,
      `Command not found: ${trimmed}`,
      'Type "help" for available commands.',
      '',
    ]);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCommand(input);
      setTimeout(scrollToBottom, 20);
    }
  };

  const isFull = isFullScreen || mode === 'terminal';

  return (
    <div
      ref={containerRef}
      className={`terminal-app font-mono p-4 overflow-y-auto ${
        isFull
          ? 'fixed inset-0 w-screen h-screen bg-[#000000] z-50'
          : 'relative min-h-full h-full bg-[#000000]'
      } ${isAppleTerminal ? 'terminal-app--apple text-gray-200' : 'text-green-400'}`}
      style={{
        backgroundColor: '#000000',
        minHeight: isFull ? '100vh' : '100%',
        height: isFull ? '100vh' : '100%',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {!isAppleTerminal && (
        <AsciiAurora
          variant="terminal"
          opacity={0.14}
          columns={96}
          rows={34}
          frameInterval={90}
          speed={0.72}
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto pb-8">
        {history.map((line, index) => (
          <div key={index} className="terminal-app__line whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}

        <div className="terminal-app__prompt flex items-center mt-1">
          <span className="mr-2 select-none">{isAppleTerminal ? '%' : '$'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              scrollToBottom();
            }}
            onKeyDown={handleKeyDown}
            className={`terminal-app__input flex-1 bg-transparent outline-none border-none ${
              isAppleTerminal ? 'text-gray-200' : 'text-green-400'
            }`}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
