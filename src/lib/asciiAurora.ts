export interface AsciiAuroraOptions {
  columns: number;
  rows: number;
  speed: number;
  frequency: number;
  sharpness: number;
  centerGap: number;
  characterRamp: string;
  direction?: 1 | -1;
  phaseOffset?: number;
}

interface AuroraCellGeometry {
  distance: number;
  angle: number;
  fanMask: number;
  edgeFalloff: number;
  centerFalloff: number;
  threshold: number;
  phaseJitter: number;
}

const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map((value) => (value + 0.5) / 16);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hashCell(x: number, y: number): number {
  let hash = (x + 1) * 374761393 + (y + 1) * 668265263;
  hash = (hash ^ (hash >>> 13)) * 1274126177;
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
}

function normalizeOptions(options: AsciiAuroraOptions): Required<AsciiAuroraOptions> {
  return {
    columns: Math.max(1, Math.floor(options.columns)),
    rows: Math.max(1, Math.floor(options.rows)),
    speed: options.speed,
    frequency: options.frequency,
    sharpness: Math.max(0.001, options.sharpness),
    centerGap: clamp01(options.centerGap),
    characterRamp: options.characterRamp || ' .:-=+*#%@',
    direction: options.direction ?? 1,
    phaseOffset: options.phaseOffset ?? 0,
  };
}

function createGeometry(options: Required<AsciiAuroraOptions>): AuroraCellGeometry[] {
  const { columns, rows, sharpness, centerGap } = options;
  const geometry: AuroraCellGeometry[] = new Array(columns * rows);
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;
  const invMaxDistance = 1 / Math.max(1, Math.hypot(centerX || 1, centerY || 1));
  const aspect = rows / Math.max(1, columns);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const normalizedX = (x - centerX) / Math.max(1, centerX || 1);
      const normalizedY = ((y - centerY) / Math.max(1, centerY || 1)) * aspect;
      const distance = Math.hypot(x - centerX, y - centerY) * invMaxDistance;
      const angle = Math.atan2(normalizedY, normalizedX);
      const fanWave = Math.abs(Math.cos(angle * 3));
      const fanMask = Math.pow(smoothstep(0.08, 1, fanWave), sharpness);
      const edgeDistance = Math.min(x, y, columns - 1 - x, rows - 1 - y);
      const edgeFalloff = smoothstep(0, Math.max(1, Math.min(columns, rows) * 0.18), edgeDistance);
      const centerFalloff = smoothstep(centerGap, Math.min(1, centerGap + 0.35), distance);
      const threshold = BAYER_4X4[(y % 4) * 4 + (x % 4)];
      const phaseJitter = hashCell(x, y) * Math.PI * 2;

      geometry[y * columns + x] = {
        distance,
        angle,
        fanMask,
        edgeFalloff,
        centerFalloff,
        threshold,
        phaseJitter,
      };
    }
  }

  return geometry;
}

export function createAsciiAuroraRenderer(
  options: AsciiAuroraOptions,
): (elapsedSeconds: number) => string {
  const normalized = normalizeOptions(options);
  const { columns, rows, speed, frequency, characterRamp, direction, phaseOffset } = normalized;
  const ramp = Array.from(characterRamp);
  const geometry = createGeometry(normalized);
  const lineBuffer = new Array<string>(rows);
  const charBuffer = new Array<string>(columns);
  const lastRampIndex = ramp.length - 1;

  return (elapsedSeconds: number): string => {
    const time = elapsedSeconds * speed * direction + phaseOffset;

    for (let y = 0; y < rows; y += 1) {
      const rowOffset = y * columns;

      for (let x = 0; x < columns; x += 1) {
        const cell = geometry[rowOffset + x];
        const wave = Math.sin(
          cell.distance * frequency * Math.PI * 2 +
          cell.angle * 2.5 +
          time +
          cell.phaseJitter * 0.18,
        );
        const ripple = 0.5 + wave * 0.5;
        const dithered = clamp01(ripple * cell.fanMask * cell.edgeFalloff * cell.centerFalloff);
        const intensity = dithered > cell.threshold * 0.92 ? dithered : dithered * 0.58;
        charBuffer[x] = ramp[Math.min(lastRampIndex, Math.floor(intensity * lastRampIndex))];
      }

      lineBuffer[y] = charBuffer.join('');
    }

    return lineBuffer.join('\n');
  };
}
