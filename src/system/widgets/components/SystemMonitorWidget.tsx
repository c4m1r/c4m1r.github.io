import { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/useApp';
import { Cpu, HardDrive } from 'lucide-react';

export function SystemMonitorWidget() {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [cpu, setCpu] = useState(12);
  const [history, setHistory] = useState<number[]>([14, 12, 18, 15, 11, 13, 16, 12, 10, 12]);
  const [memoryUsed] = useState(11.7);
  const totalMemory = 32;
  const diskPct = 51;

  useEffect(() => {
    const timer = setInterval(() => {
      const nextCpu = Math.max(5, Math.min(65, Math.round(12 + (Math.random() - 0.5) * 14)));
      setCpu(nextCpu);
      setHistory((prev) => [...prev.slice(1), nextCpu]);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const svgWidth = 80;
  const svgHeight = 20;
  const minVal = 0;
  const maxVal = 100;
  const path = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * svgWidth;
      const y = svgHeight - (val / (maxVal - minVal)) * svgHeight;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="glass-widget p-3 flex flex-col justify-between w-full sm:w-[230px] min-h-[140px]">
      <div className="glass-widget__ambient" />

      {/* CPU */}
      <div className="z-10">
        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Cpu size={12} />
            <span>CPU</span>
          </span>
          <span className="text-sm font-black text-white font-mono">{cpu}%</span>
        </div>

        {/* Dynamic Waveform */}
        <div className="w-full h-5 bg-white/5 rounded-md border border-white/10 flex items-center justify-center overflow-hidden">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            <path
              d={path}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Memory & Disk */}
      <div className="space-y-1.5 text-[10px] z-10 pt-2 border-t border-white/10">
        {/* RAM */}
        <div>
          <div className="flex justify-between text-gray-300 mb-0.5">
            <span>{isRu ? 'Память' : 'RAM'}</span>
            <span className="font-mono">{memoryUsed} {isRu ? 'из' : 'of'} {totalMemory} ГБ</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
              style={{ width: `${(memoryUsed / totalMemory) * 100}%` }}
            />
          </div>
        </div>

        {/* Disk C: */}
        <div>
          <div className="flex justify-between text-gray-300 mb-0.5">
            <span className="flex items-center gap-1">
              <HardDrive size={10} className="text-gray-400" />
              <span>{isRu ? 'Диск C:' : 'Drive C:'}</span>
            </span>
            <span className="font-mono">{diskPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
              style={{ width: `${diskPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
