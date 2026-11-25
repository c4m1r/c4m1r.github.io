/**
 * MilkDrop .milk -> Butterchurn WASM adapter.
 * EEL2 source is preserved and handed to Butterchurn's WASM compiler.
 * MilkDrop 2 HLSL shaders are reported as unsupported by Butterchurn.
 */
export type MilkPresetObject = Record<string, unknown>;
export type MilkPresetConversion = {
  preset: MilkPresetObject;
  warnings: string[];
  converted: { frameEquations: number; pixelEquations: number; customWaves: number; customShapes: number };
};

const EQUATION_KEYS = new Map([
  ['init', /^per_frame_init_(\d+)$/i],
  ['frame', /^per_frame_(\d+)$/i],
  ['pixel', /^per_pixel_(\d+)$/i],
  ['waveInit', /^wave_(\d+)_init_(\d+)$/i],
  ['waveFrame', /^wave_(\d+)_per_frame(\d+)$/i],
  ['wavePoint', /^wave_(\d+)_per_point(\d+)$/i],
  ['shapeInit', /^shape_(\d+)_init_(\d+)$/i],
  ['shapeFrame', /^shape_(\d+)_per_frame(\d+)$/i],
]);

const MAIN_FIELD_ALIASES: Record<string, string> = {
  fdecay: 'decay', fgammaadj: 'gammaadj', nwavemode: 'wave_mode',
  badditivewaves: 'additivewave', bwavedots: 'wave_dots', bwavethick: 'wave_thick',
  bmodwavealphabyvolume: 'modwavealphabyvolume', fmodwavealphastart: 'modwavealphastart',
  fmodwavealphaend: 'modwavealphaend', fwavealpha: 'wave_a', fwavescale: 'wave_scale',
  fwavesmoothing: 'wave_smoothing', fwaver: 'wave_r', fwaveg: 'wave_g', fwaveb: 'wave_b',
  fwavex: 'wave_x', fwavey: 'wave_y', bwavebrighten: 'wave_brighten',
  bmotionvectorson: 'bmotionvectorson', nmotionvectorsx: 'mv_x', nmotionvectorsy: 'mv_y',
  fmvdx: 'mv_dx', fmvdy: 'mv_dy', fmvl: 'mv_l', fmvr: 'mv_r', fmvg: 'mv_g',
  fmvb: 'mv_b', fmva: 'mv_a', fwarpanimspeed: 'warpanimspeed', fwarpscale: 'warpscale',
  fzoomexponent: 'zoomexp', fzoom: 'zoom', frot: 'rot', fcenterx: 'cx', fcentery: 'cy',
  fx: 'dx', fy: 'dy', fwarp: 'warp', fstretchx: 'sx', fstretchy: 'sy',
  btexwrap: 'wrap', bbrighten: 'brighten', bdarken: 'darken', bdarkencenter: 'darken_center',
  bsolarize: 'solarize', binvert: 'invert', bshader: 'fshader', bredbluestereo: 'red_blue',
  fvideoechozoom: 'echo_zoom', fvideoechoalpha: 'echo_alpha',
  nvideoechoorientation: 'echo_orient', bvideoecho: 'echo_alpha',
  fouterbordersize: 'ob_size', fouterborderr: 'ob_r', fouterborderg: 'ob_g',
  fouterborderb: 'ob_b', fouterbordera: 'ob_a', finnerbordersize: 'ib_size',
  finnerborderr: 'ib_r', finnerborderg: 'ib_g', finnerborderb: 'ib_b', finnerbordera: 'ib_a',
};

function parseNumeric(value: string): number | null {
  const normalized = value.trim();
  if (/^(true|false)$/i.test(normalized)) return normalized.toLowerCase() === 'true' ? 1 : 0;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function programSource(entries: Map<number, string>): string {
  return [...entries.entries()].sort(([a], [b]) => a - b)
    .map(([, value]) => value.trim()).filter(Boolean)
    .map((value) => value.endsWith(';') ? value : value + ';').join('\n');
}

function setNumericField(target: Record<string, unknown>, key: string, value: string): boolean {
  const resolved = Object.keys(target).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  const numeric = parseNumeric(value);
  if (!resolved || numeric === null) return false;
  target[resolved] = numeric;
  return true;
}

function cloneObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveSlotIndex(rawIndex: number, slotCount: number): number | null {
  const index = rawIndex === 0 ? 0 : rawIndex - 1;
  return Number.isInteger(rawIndex) && index >= 0 && index < slotCount ? index : null;
}

const WAVE_FIELD_ALIASES: Record<string, string> = {
  mode: 'spectrum', bspectrum: 'spectrum', bdrawthick: 'thick',
  busedots: 'usedots', badditive: 'additive',
};
const SHAPE_FIELD_ALIASES: Record<string, string> = {
  badditive: 'additive', bthickoutline: 'thickoutline',
  thick_outline: 'thickoutline', tex_capture: 'textured',
};

export function convertMilkPreset(text: string, basePreset: MilkPresetObject): MilkPresetConversion {
  if (text.length > 2 * 1024 * 1024) throw new Error('MilkDrop preset exceeds the 2 MB import limit');
  const source = text.replace(/^\uFEFF/, '');
  const section = source.match(/^\s*\[preset00\]\s*$/im);
  if (!section || section.index === undefined) throw new Error('Unsupported .milk file: [preset00] section was not found');
  const remainder = source.slice(section.index + section[0].length);
  const nextSection = remainder.search(/^\s*\[[^\]]+\]\s*$/m);
  const body = nextSection >= 0 ? remainder.slice(0, nextSection) : remainder;

  const preset = cloneObject(basePreset) as MilkPresetObject & {
    baseVals: Record<string, unknown>;
    shapes: Array<{ baseVals: Record<string, unknown>; [key: string]: unknown }>;
    waves: Array<{ baseVals: Record<string, unknown>; [key: string]: unknown }>;
  };
  if (!preset.baseVals || typeof preset.baseVals !== 'object' || !Array.isArray(preset.shapes) || !Array.isArray(preset.waves)) {
    throw new Error('Butterchurn base preset is incomplete (baseVals/shapes/waves are required)');
  }

  const programs = {
    init: new Map<number, string>(), frame: new Map<number, string>(), pixel: new Map<number, string>(),
    waveInit: new Map<number, Map<number, string>>(), waveFrame: new Map<number, Map<number, string>>(),
    wavePoint: new Map<number, Map<number, string>>(), shapeInit: new Map<number, Map<number, string>>(),
    shapeFrame: new Map<number, Map<number, string>>(),
  };
  const warnings = new Set<string>();
  const metadata = /^(rating|frating|author|szauthor|title|szpresetname|description|szdescription|presetname|presetauthor|presetdescription|version|milkdrop_preset_version|psversion|psversion_comp|psversion_warp)$/i;
  const shader = /^(warp|comp)(?:_shader|_\d+|$)/i;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!value) continue;
    if (shader.test(key)) {
      warnings.add('Custom MilkDrop 2 warp/composite shaders are not executed by Butterchurn; Butterchurn feedback rendering will be used.');
      continue;
    }

    let matched = false;
    for (const [kind, pattern] of EQUATION_KEYS) {
      const match = key.match(pattern);
      if (!match) continue;
      matched = true;
      const isSlotProgram = kind.startsWith('wave') || kind.startsWith('shape');
      if (isSlotProgram) {
        const rawSlot = Number(match[1]);
        const isWave = kind.startsWith('wave');
        const slot = resolveSlotIndex(rawSlot, isWave ? preset.waves.length : preset.shapes.length);
        if (slot === null) {
          warnings.add('Unsupported custom ' + (isWave ? 'wave' : 'shape') + ' equation slot: ' + rawSlot);
          continue;
        }
        const order = Number(match[2]);
        const group = programs[kind as 'waveInit' | 'waveFrame' | 'wavePoint' | 'shapeInit' | 'shapeFrame'];
        const entries = group.get(slot) ?? new Map<number, string>();
        entries.set(order, value);
        group.set(slot, entries);
      } else {
        programs[kind as 'init' | 'frame' | 'pixel'].set(Number(match[1]), value);
      }
      break;
    }
    if (matched) continue;

    const wave = key.match(/^(?:wave|wavecode)_(\d+)_(.+)$/i);
    if (wave) {
      const slot = resolveSlotIndex(Number(wave[1]), preset.waves.length);
      const target = slot === null ? undefined : preset.waves[slot]?.baseVals;
      const suffix = WAVE_FIELD_ALIASES[wave[2].toLowerCase()] ?? wave[2];
      if (!target || !setNumericField(target, suffix, value)) warnings.add('Unsupported custom wave field: ' + key);
      continue;
    }
    const shape = key.match(/^(?:shape|shapecode)_(\d+)_(.+)$/i);
    if (shape) {
      const slot = resolveSlotIndex(Number(shape[1]), preset.shapes.length);
      const target = slot === null ? undefined : preset.shapes[slot]?.baseVals;
      const suffix = SHAPE_FIELD_ALIASES[shape[2].toLowerCase()] ?? shape[2];
      if (!target || !setNumericField(target, suffix, value)) warnings.add('Unsupported custom shape field: ' + key);
      continue;
    }

    const alias = MAIN_FIELD_ALIASES[key.toLowerCase()];
    if (alias && setNumericField(preset.baseVals, alias, value)) continue;
    if (setNumericField(preset.baseVals, key, value)) continue;
    if (!metadata.test(key)) warnings.add('Unmapped MilkDrop field: ' + key);
  }

  preset.init_eqs_eel = programSource(programs.init);
  preset.frame_eqs_eel = programSource(programs.frame);
  preset.pixel_eqs_eel = programSource(programs.pixel);
  preset.shapes.forEach((shape, index) => {
    const init = programs.shapeInit.get(index);
    const frame = programs.shapeFrame.get(index);
    if (init || frame) {
      shape.init_eqs_eel = programSource(init ?? new Map());
      shape.frame_eqs_eel = programSource(frame ?? new Map());
    }
  });
  preset.waves.forEach((wave, index) => {
    const init = programs.waveInit.get(index);
    const frame = programs.waveFrame.get(index);
    const point = programs.wavePoint.get(index);
    if (init || frame || point) {
      wave.init_eqs_eel = programSource(init ?? new Map());
      wave.frame_eqs_eel = programSource(frame ?? new Map());
      wave.point_eqs_eel = programSource(point ?? new Map());
    }
  });

  const frameEquations = programs.init.size + programs.frame.size;
  const pixelEquations = programs.pixel.size;
  const customWaves = new Set([...programs.waveInit.keys(), ...programs.waveFrame.keys(), ...programs.wavePoint.keys()]).size;
  const customShapes = new Set([...programs.shapeInit.keys(), ...programs.shapeFrame.keys()]).size;
  if (!frameEquations && !pixelEquations && !customWaves && !customShapes) {
    warnings.add('This preset contains no EEL equations or custom wave/shape programs; only mapped scalar parameters were imported.');
  }
  return { preset, warnings: [...warnings], converted: { frameEquations, pixelEquations, customWaves, customShapes } };
}

export function convertSimpleMilkPreset(text: string, basePreset: MilkPresetObject): MilkPresetObject {
  return convertMilkPreset(text, basePreset).preset;
}
