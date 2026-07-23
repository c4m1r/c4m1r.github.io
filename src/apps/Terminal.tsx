import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/useApp';
import { translations } from '../i18n/translations';
import { AsciiAurora } from '../components/effects';

export function Terminal() {
  const { language } = useApp();
  const t = translations[language].terminal;
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    t.welcome,
    '',
    'Type "help" for available commands.',
    '',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    setHistory((prev) => [...prev, `$ ${cmd}`]);

    if (trimmed === 'help') {
      setHistory((prev) => [
        ...prev,
        '',
        t.help,
        '  htop - Show pseudo site runtime monitor',
        '  mc - Browse site material shortcuts',
        '  news/wiki/projects/gallery/apps/search - Open site sections',
        '',
      ]);
    } else if (trimmed === 'clear') {
      setHistory([]);
    } else if (trimmed === '') {
      setHistory((prev) => [...prev, '']);
    } else if (pseudoScreens[trimmed]) {
      setHistory((prev) => [...prev, '', ...pseudoScreens[trimmed], '']);
    } else if (isRouteCommand(trimmed)) {
      const target = TERMINAL_SITE_ROUTES[trimmed];
      setHistory((prev) => [...prev, `Opening ${target}…`, '']);
      window.setTimeout(() => {
        window.location.href = target;
      }, 120);
    } else {
      setHistory((prev) => [...prev, `Command not found: ${trimmed}`, 'Type "help" for available commands.', '']);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black text-green-400 font-mono p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <AsciiAurora
        variant="terminal"
        opacity={0.16}
        columns={96}
        rows={34}
        frameInterval={90}
        speed={0.72}
      />
      <div className="relative z-10 max-w-4xl mx-auto">
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-green-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
