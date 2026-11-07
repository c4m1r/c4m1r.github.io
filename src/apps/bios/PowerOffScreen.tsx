import { useEffect } from 'react';
import { Power } from 'lucide-react';
import { useApp } from '../../contexts/useApp';

interface PowerOffScreenProps {
  onPowerOn: () => void;
}

export function PowerOffScreen({ onPowerOn }: PowerOffScreenProps) {
  const { language } = useApp();
  const isRu = language === 'ru';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        onPowerOn();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPowerOn]);

  return (
    <div
      onClick={onPowerOn}
      className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-center justify-center p-8 z-50 cursor-pointer select-none"
    >
      <div className="text-center max-w-xl flex flex-col items-center gap-6">
        {/* Iconic Windows 95/98/XP APM shutdown message in classic orange/amber */}
        <h1
          className="text-2xl md:text-3xl font-bold tracking-wide"
          style={{
            color: '#ff9900',
            fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif',
            textShadow: '0 0 10px rgba(255, 153, 0, 0.4)',
          }}
        >
          {isRu ? 'Теперь питание компьютера можно отключить.' : "It's now safe to turn off your computer."}
        </h1>

        <p className="text-gray-500 font-mono text-sm">
          {isRu
            ? 'Система остановлена. Нажмите в любом месте или кнопку питания для перезапуска.'
            : 'System halted. Click anywhere or press the power button to reboot.'}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPowerOn();
          }}
          className="mt-4 flex items-center gap-2.5 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 shadow-lg transition-all cursor-pointer font-mono text-sm"
        >
          <Power size={18} className="text-orange-400" />
          <span>{isRu ? 'Включить питание (POST Boot)' : 'Power On (POST Boot)'}</span>
        </button>
      </div>
    </div>
  );
}
