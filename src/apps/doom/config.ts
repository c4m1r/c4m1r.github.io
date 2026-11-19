import doomIcon from './assets/doom-icon-lg.webp';

const EMUPEDIA_BASE = 'https://emupedia.net';

export type DoomVariantId = 'doom1' | 'doom2' | 'doom3';

export interface DoomVariantBuild {
  id: 'asmjs' | 'wasm' | 'webgl';
  label: string;
  url: string;
}

export interface DoomVariant {
  id: DoomVariantId;
  title: string;
  subtitle?: string;
  icon: string;
  homepage?: string;
  description: {
    ru: string;
    en: string;
  };
  builds: DoomVariantBuild[];
  window: {
    width: number;
    height: number;
  };
}

const desktopIcon = () => doomIcon;

export const doomVariants: DoomVariant[] = [
  {
    id: 'doom1',
    title: 'Doom (1993)',
    subtitle: 'Ultimate Doom',
    icon: desktopIcon(),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom1/`,
    description: {
      ru: 'Классический Doom с поддержкой ASM.js и WebAssembly портов wasm-doom.',
      en: 'Classic Doom running via wasm-doom with both ASM.js and WebAssembly builds.',
    },
    builds: [
      {
        id: 'asmjs',
        label: 'ASM.js',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom1/asmjs/`,
      },
      {
        id: 'wasm',
        label: 'WebAssembly',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom1/`,
      },
    ],
    window: {
      width: 960,
      height: 640,
    },
  },
  {
    id: 'doom2',
    title: 'Doom II: Hell on Earth',
    icon: desktopIcon(),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom2/`,
    description: {
      ru: 'Продолжение Doom с поддержкой wasm-doom. Доступны ASM.js и WebAssembly версии.',
      en: 'Sequel to Doom powered by wasm-doom with ASM.js and WebAssembly builds.',
    },
    builds: [
      {
        id: 'asmjs',
        label: 'ASM.js',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom2/asmjs/`,
      },
      {
        id: 'wasm',
        label: 'WebAssembly',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom2/`,
      },
    ],
    window: {
      width: 960,
      height: 640,
    },
  },
  {
    id: 'doom3',
    title: 'Doom 3 Demo (WIP)',
    icon: desktopIcon(),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom3/`,
    description: {
      ru: 'Демонстрационная сборка Doom 3 на WebAssembly. Проект отмечен Emupedia как Work in Progress.',
      en: 'Doom 3 WebAssembly demo. Emupedia currently labels this build as Work in Progress.',
    },
    builds: [
      {
        id: 'webgl',
        label: 'WebGL',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom3/`,
      },
    ],
    window: {
      width: 1024,
      height: 720,
    },
  },
];

export const doomVariantMap: Record<DoomVariantId, DoomVariant> = doomVariants.reduce(
  (acc, variant) => {
    acc[variant.id] = variant;
    return acc;
  },
  {} as Record<DoomVariantId, DoomVariant>,
);

