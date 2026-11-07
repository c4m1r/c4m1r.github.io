import { useState, useEffect, useRef, useCallback } from 'react';
import hardDriveAudio from '../../assets/audio/vintage-hard-drive.mp3';

interface BiosPostScreenProps {
  onComplete: () => void;
}

function playPostBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(850, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // AudioContext may be suspended before interaction
  }
}

export function BiosPostScreen({ onComplete }: BiosPostScreenProps) {
  const [stage, setStage] = useState(0);
  const [memKb, setMemKb] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const finish = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onComplete();
  }, [onComplete]);

  // Attempt to start hard drive spin-up sound
  useEffect(() => {
    try {
      const audio = new Audio(hardDriveAudio);
      audio.volume = 0.35;
      audioRef.current = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback
        });
      }
    } catch {
      // Audio failed
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Keyboard shortcut to skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Delete' || e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finish]);

  // Stage 0: Rapid RAM counting up to 131072 KB (128 MB)
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 8192;
      if (current >= 131072) {
        current = 131072;
        clearInterval(interval);
        playPostBeep();
        setTimeout(() => setStage(1), 250);
      }
      setMemKb(current);
    }, 35);

    return () => clearInterval(interval);
  }, []);

  // Stage 1+: Progressive hardware detection and driver load logs
  useEffect(() => {
    if (stage < 1) return;

    const sequence: { text: string; delay: number }[] = [
      { text: 'Award Plug and Play BIOS Extension v1.0A', delay: 120 },
      { text: 'Initialize Plug and Play Cards... PNP Init Completed', delay: 200 },
      { text: 'Detecting IDE Primary Master   ... WDC WD400BB-00AUA1 (40.0 GB)', delay: 220 },
      { text: 'Detecting IDE Primary Slave    ... None', delay: 100 },
      { text: 'Detecting IDE Secondary Master ... ATAPI CD-ROM 52X Max', delay: 150 },
      { text: 'Detecting IDE Secondary Slave  ... None', delay: 80 },
      { text: '', delay: 50 },
      { text: 'PCI device bus 0 dev 1 fn 0: Intel 82443BX Host Bridge', delay: 100 },
      { text: 'PCI device bus 1 dev 0 fn 0: NVIDIA RIVA TNT2 Model 64 (32MB) IRQ 11', delay: 120 },
      { text: 'PCI device bus 0 dev 9 fn 0: Creative Labs SB Live! (EMU10K1) IRQ 5', delay: 120 },
      { text: 'PCI device bus 0 dev 10 fn 0: Realtek RTL8139 Fast Ethernet 10/100 IRQ 10', delay: 120 },
      { text: '', delay: 60 },
      { text: 'Loading system hardware drivers:', delay: 100 },
      { text: '  HIMEM.SYS v3.95 (XMS 3.00) Extended Memory Manager ... OK', delay: 140 },
      { text: '  EMM386.EXE v4.49 Expanded Memory Manager active ... OK', delay: 120 },
      { text: '  OAKCDROM.SYS ATAPI CD-ROM device driver loaded (1 drive found: D:)', delay: 130 },
      { text: '  MSCDEX.EXE version 2.25 CD-ROM Extensions mounted on D:', delay: 120 },
      { text: '  SB16.SYS Creative Audio Controller active (IRQ 5, DMA 1)', delay: 110 },
      { text: '  ACPI Hardware Tables initialized (APIC enabled)', delay: 100 },
      { text: '', delay: 80 },
      { text: 'Booting from Primary Hard Disk (0x80)...', delay: 250 },
      { text: 'Loading GRUB stage 1.5...', delay: 200 },
      { text: 'GRUB loading, please wait...', delay: 250 },
    ];

    let currentIdx = 0;
    let timer: NodeJS.Timeout;

    const step = () => {
      if (currentIdx >= sequence.length) {
        timer = setTimeout(finish, 400);
        return;
      }
      const item = sequence[currentIdx];
      setLines((prev) => [...prev, item.text]);
      currentIdx++;

      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }

      timer = setTimeout(step, item.delay);
    };

    timer = setTimeout(step, 100);

    return () => clearTimeout(timer);
  }, [stage, finish]);

  return (
    <div
      ref={containerRef}
      onClick={finish}
      className="fixed inset-0 w-screen h-screen bg-black text-[#d0d0d0] font-mono text-sm p-6 overflow-y-auto z-50 cursor-pointer select-none leading-relaxed"
      style={{ fontFamily: '"Courier New", Courier, monospace' }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-white font-bold text-base">Award Modular BIOS v4.51PG, An Energy Star Ally</div>
          <div className="text-gray-400">Copyright (C) 1984-2001, Award Software, Inc.</div>
        </div>
        {/* Retro EPA Energy Star Badge */}
        <div className="border border-green-500 text-green-400 px-3 py-1 text-center font-bold text-xs uppercase hidden sm:block">
          energy<br />EPA POLLUTION PREVENTER
        </div>
      </div>

      {/* CPU & Memory Info */}
      <div className="mb-4">
        <div>ASUS CUSL2-C ACPI BIOS Revision 1009</div>
        <div className="text-white">Intel Pentium(R) III Processor - 800EB MHz (133x6.0)</div>
        <div className="mt-1">
          Memory Testing : <span className="text-white font-bold">{memKb}K</span>{' '}
          {stage >= 1 ? <span className="text-green-400 font-bold">OK</span> : ''}
        </div>
      </div>

      {/* Streamed Output Lines */}
      <div className="space-y-0.5">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={
              line.startsWith('Booting') || line.startsWith('Loading GRUB')
                ? 'text-cyan-400 font-bold'
                : line.includes('OK')
                  ? 'text-green-300'
                  : line.startsWith('Detecting')
                    ? 'text-yellow-200'
                    : 'text-gray-300'
            }
          >
            {line}
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-3 left-6 right-6 flex justify-between text-xs text-gray-500 border-t border-gray-800 pt-2 bg-black">
        <div>Press <span className="text-white font-bold">[DEL]</span> Setup | <span className="text-white font-bold">[ESC] / [Space]</span> Skip to GRUB</div>
        <div className="hidden md:block">11/07/2026-i440BX-W977-2A69KA1AC-00</div>
      </div>
    </div>
  );
}
