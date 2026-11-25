/**
 * MilkDrop .milk -> Butterchurn 2.x adapter.
 * EEL2 is parsed and emitted as the JavaScript equation strings expected by
 * the pinned Butterchurn 2.6.7 runtime. Custom HLSL shaders remain unsupported.
 */
export type MilkPresetObject = Record<string, unknown>;
export type MilkdropEelParser = {
  convert_basic_preset(version: number, init: string, frame: string, pixel: string): { perFrameInitEQs?: string | null; perFrameEQs?: string | null; perPixelEQs?: string | null };
  make_wave_map(version: number, input: { init_eqs_str: string; frame_eqs_str: string; point_eqs_str: string }): { perFrameInitEQs?: string | null; perFrameEQs?: string | null; perPointEQs?: string | null };
  make_shape_map(version: number, input: { init_eqs_str: string; frame_eqs_str: string }): { perFrameInitEQs?: string | null; perFrameEQs?: string | null };
};

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
  fwavesmoothing: 'wave_smoothing', fwavemystery: 'wave_mystery', fwaver: 'wave_r', fwaveg: 'wave_g', fwaveb: 'wave_b',
  fwavex: 'wave_x', fwavey: 'wave_y', bwavebrighten: 'wave_brighten',
  bmotionvectorson: 'bmotionvectorson', nmotionvectorsx: 'mv_x', nmotionvectorsy: 'mv_y',
  fmvdx: 'mv_dx', fmvdy: 'mv_dy', fmvl: 'mv_l', fmvr: 'mv_r', fmvg: 'mv_g',
  fmvb: 'mv_b', fmva: 'mv_a', fwarpanimspeed: 'warpanimspeed', fwarpscale: 'warpscale',
  fzoomexponent: 'zoomexp', fzoom: 'zoom', frot: 'rot', fcenterx: 'cx', fcentery: 'cy',
  fx: 'dx', fy: 'dy', fwarp: 'warp', fstretchx: 'sx', fstretchy: 'sy',
  btexwrap: 'wrap', bbrighten: 'brighten', bdarken: 'darken', bdarkencenter: 'darken_center',
  bsolarize: 'solarize', binvert: 'invert', bshader: 'fshader', bredbluestereo: 'red_blue',
  fvideoechozoom: 'echo_zoom', fvideoechoalpha: 'echo_alpha',
  nvideoechoorientation: 'echo_orient',
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

const MAIN_FIELD_KEYS = new Set([
  'decay', 'gammaadj', 'echo_zoom', 'echo_alpha', 'echo_orient', 'red_blue', 'brighten',
  'darken', 'wrap', 'darken_center', 'solarize', 'invert', 'bmotionvectorson', 'fshader',
  'b1n', 'b2n', 'b3n', 'b1x', 'b2x', 'b3x', 'b1ed', 'wave_mode', 'additivewave',
  'wave_dots', 'wave_thick', 'wave_a', 'wave_scale', 'wave_smoothing', 'wave_mystery',
  'modwavealphabyvolume', 'modwavealphastart', 'modwavealphaend', 'wave_r', 'wave_g',
  'wave_b', 'wave_x', 'wave_y', 'wave_brighten', 'mv_x', 'mv_y', 'mv_dx', 'mv_dy',
  'mv_l', 'mv_r', 'mv_g', 'mv_b', 'mv_a', 'warpanimspeed', 'warpscale', 'zoomexp',
  'zoom', 'rot', 'cx', 'cy', 'dx', 'dy', 'warp', 'sx', 'sy', 'ob_size', 'ob_r',
  'ob_g', 'ob_b', 'ob_a', 'ib_size', 'ib_r', 'ib_g', 'ib_b', 'ib_a', 'rating',
]);
const WAVE_FIELD_KEYS = new Set([
  'enabled', 'samples', 'sep', 'scaling', 'smoothing', 'r', 'g', 'b', 'a',
  'spectrum', 'usedots', 'thick', 'additive',
]);
const SHAPE_FIELD_KEYS = new Set([
  'enabled', 'sides', 'additive', 'thickoutline', 'textured', 'num_inst',
  'tex_zoom', 'tex_ang', 'x', 'y', 'rad', 'ang', 'r', 'g', 'b', 'a',
  'r2', 'g2', 'b2', 'a2', 'border_r', 'border_g', 'border_b', 'border_a',
]);

function setNumericField(
  target: Record<string, unknown>,
  key: string,
  value: string,
  allowedKeys: ReadonlySet<string>,
): boolean {
  const normalized = key.toLowerCase();
  const resolved = Object.keys(target).find((candidate) => candidate.toLowerCase() === normalized)
    ?? (allowedKeys.has(normalized) ? normalized : undefined);
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

export async function convertMilkPreset(
  text: string,
  basePreset: MilkPresetObject,
  parserOverride?: MilkdropEelParser,
): Promise<MilkPresetConversion> {
  if (text.length > 2 * 1024 * 1024) throw new Error('MilkDrop preset exceeds the 2 MB import limit');
  const source = text.replace(/^\uFEFF/, '');
  const parser = parserOverride ?? (await import('milkdrop-eel-parser')).default;
  const presetVersion = /MILKDROP_PRESET_VERSION\s*=\s*201/i.test(source) ? 2 : 1;
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

  // Keep only the Butterchurn preset structure. Reusing a real preset as the
  // template would leak its visual parameters and equations into the import.
  preset.baseVals = {};
  delete preset.warp;
  delete preset.comp;
  delete preset.warp_hlsl;
  delete preset.comp_hlsl;
  preset.shapes.forEach((shape) => { shape.baseVals = {}; });
  preset.waves.forEach((wave) => { wave.baseVals = {}; });

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
      if (!target || !setNumericField(target, suffix, value, WAVE_FIELD_KEYS)) warnings.add('Unsupported custom wave field: ' + key);
      continue;
    }
    const shape = key.match(/^(?:shape|shapecode)_(\d+)_(.+)$/i);
    if (shape) {
      const slot = resolveSlotIndex(Number(shape[1]), preset.shapes.length);
      const target = slot === null ? undefined : preset.shapes[slot]?.baseVals;
      const suffix = SHAPE_FIELD_ALIASES[shape[2].toLowerCase()] ?? shape[2];
      if (!target || !setNumericField(target, suffix, value, SHAPE_FIELD_KEYS)) warnings.add('Unsupported custom shape field: ' + key);
      continue;
    }

    const alias = MAIN_FIELD_ALIASES[key.toLowerCase()];
    if (alias && setNumericField(preset.baseVals, alias, value, MAIN_FIELD_KEYS)) continue;
    if (setNumericField(preset.baseVals, key, value, MAIN_FIELD_KEYS)) continue;
    if (!metadata.test(key)) warnings.add('Unmapped MilkDrop field: ' + key);
  }

  // Butterchurn 2.6.7 compiles JavaScript equation strings with its
  // presetBase helpers; it does not understand the newer *_eqs_eel fields.
  preset.init_eqs_str = '';
  preset.frame_eqs_str = '';
  preset.pixel_eqs_str = '';
  preset.shapes.forEach((shape) => {
    delete shape.init_eqs_eel;
    delete shape.frame_eqs_eel;
    shape.init_eqs_str = '';
    shape.frame_eqs_str = '';
  });
  preset.waves.forEach((wave) => {
    delete wave.init_eqs_eel;
    delete wave.frame_eqs_eel;
    delete wave.point_eqs_eel;
    wave.init_eqs_str = '';
    wave.frame_eqs_str = '';
    wave.point_eqs_str = '';
  });

  const convertedRoot = parser.convert_basic_preset(
    presetVersion,
    programSource(programs.init),
    programSource(programs.frame),
    programSource(programs.pixel),
  );
  preset.init_eqs_str = (convertedRoot.perFrameInitEQs ?? '').trim();
  preset.frame_eqs_str = (convertedRoot.perFrameEQs ?? '').trim();
  preset.pixel_eqs_str = (convertedRoot.perPixelEQs ?? '').trim();

  preset.shapes.forEach((shape, index) => {
    const converted = parser.make_shape_map(presetVersion, {
      init_eqs_str: programSource(programs.shapeInit.get(index) ?? new Map()),
      frame_eqs_str: programSource(programs.shapeFrame.get(index) ?? new Map()),
    });
    shape.init_eqs_str = (converted.perFrameInitEQs ?? '').trim();
    shape.frame_eqs_str = (converted.perFrameEQs ?? '').trim();
  });
  preset.waves.forEach((wave, index) => {
    const converted = parser.make_wave_map(presetVersion, {
      init_eqs_str: programSource(programs.waveInit.get(index) ?? new Map()),
      frame_eqs_str: programSource(programs.waveFrame.get(index) ?? new Map()),
      point_eqs_str: programSource(programs.wavePoint.get(index) ?? new Map()),
    });
    wave.init_eqs_str = (converted.perFrameInitEQs ?? '').trim();
    wave.frame_eqs_str = (converted.perFrameEQs ?? '').trim();
    wave.point_eqs_str = (converted.perPointEQs ?? '').trim();
  });

  // Butterchurn expects GLSL strings even when a MilkDrop preset has no
  // custom shader. Use the runtime's canonical feedback shaders as fallback.
  preset.warp = 'shader_body {\\nret = texture2D(sampler_main, uv).rgb;\\nret -= 0.004;\\n}\\n';
  preset.comp = 'shader_body {\\nret = texture2D(sampler_main, uv).rgb;\\nret *= hue_shader;\\n}\\n';
  delete preset.warp_hlsl;
  delete preset.comp_hlsl;
  const frameEquations = programs.init.size + programs.frame.size;
  const pixelEquations = programs.pixel.size;
  const customWaveSlots = new Set([
    ...programs.waveInit.keys(), ...programs.waveFrame.keys(), ...programs.wavePoint.keys(),
    ...preset.waves.map((wave, index) => Number(wave.baseVals.enabled) !== 0 ? index : -1).filter((index) => index >= 0),
  ]);
  const customShapeSlots = new Set([
    ...programs.shapeInit.keys(), ...programs.shapeFrame.keys(),
    ...preset.shapes.map((shape, index) => Number(shape.baseVals.enabled) !== 0 ? index : -1).filter((index) => index >= 0),
  ]);
  const customWaves = customWaveSlots.size;
  const customShapes = customShapeSlots.size;
  if (!frameEquations && !pixelEquations && !customWaves && !customShapes) {
    warnings.add('This preset contains no EEL equations or custom wave/shape programs; only mapped scalar parameters were imported.');
  }
  return { preset, warnings: [...warnings], converted: { frameEquations, pixelEquations, customWaves, customShapes } };
}

export async function convertSimpleMilkPreset(
  text: string,
  basePreset: MilkPresetObject,
  parserOverride?: MilkdropEelParser,
): Promise<MilkPresetObject> {
  return (await convertMilkPreset(text, basePreset, parserOverride)).preset;
}
