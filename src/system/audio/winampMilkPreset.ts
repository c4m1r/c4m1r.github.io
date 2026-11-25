/**
 * Safe, dependency-free importer for the scalar subset of legacy MilkDrop .milk presets.
 * It never evaluates EEL or shader source; only known baseVals are copied.
 */
export type MilkPresetObject = Record<string, unknown>;
const UNSUPPORTED_CODE_KEY = /^(per_frame|per_pixel|wavecode|shapecode|wave_\d+_|shape_\\d+_|warp_shader|comp_shader|shader_)/i;

export function convertSimpleMilkPreset(text: string, basePreset: MilkPresetObject): MilkPresetObject {
  if (text.length > 2 * 1024 * 1024) throw new Error('MilkDrop preset exceeds the 2 MB import limit');
  const source = text.replace(/^\uFEFF/, '');
  if (/^\s*\[(?:wave|shape|warp|comp)[^\]]*\]\s*$/im.test(source)) {
    throw new Error('This .milk preset uses custom waves, shapes or shader sections; the safe scalar importer cannot convert them.');
  }
  const section = source.match(/^\s*\[preset00\]\s*$/im);
  if (!section || section.index === undefined) throw new Error('Unsupported .milk file: [preset00] section was not found');
  const remainder = source.slice(section.index + section[0].length);
  const nextSection = remainder.search(/^\s*\[[^\]]+\]\s*$/m);
  const body = nextSection >= 0 ? remainder.slice(0, nextSection) : remainder;
  const baseValues = basePreset && typeof basePreset === 'object'
    ? (basePreset as { baseVals?: Record<string, unknown> }).baseVals
    : undefined;
  if (!baseValues || typeof baseValues !== 'object' || Array.isArray(baseValues)) {
    throw new Error('Butterchurn base preset is not available for safe .milk conversion');
  }
  const preset = JSON.parse(JSON.stringify(basePreset)) as MilkPresetObject;
  const target = (preset as { baseVals: Record<string, unknown> }).baseVals;
  const supportedKeys = new Map(Object.keys(target).map((key) => [key.toLowerCase(), key]));
  let applied = 0;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!value) continue;
    if (UNSUPPORTED_CODE_KEY.test(key)) {
      throw new Error('This .milk preset contains EEL equations or shader code. Only scalar-only presets are supported by the safe importer.');
    }
    const targetKey = supportedKeys.get(key.toLowerCase());
    if (!targetKey) continue;
    let parsedValue: number;
    if (/^(true|false)$/i.test(value)) parsedValue = value.toLowerCase() === 'true' ? 1 : 0;
    else {
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) continue;
      parsedValue = Number(value);
    }
    if (!Number.isFinite(parsedValue)) continue;
    target[targetKey] = parsedValue;
    applied += 1;
  }
  if (!applied) throw new Error('No compatible scalar parameters were found in this .milk preset');
  return preset;
}
