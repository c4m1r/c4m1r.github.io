export type WinampSkinRegionSection = 'normal' | 'windowshade' | 'equalizer' | 'equalizerws';

export interface WinampSkinRegionPoint {
  x: number;
  y: number;
}

export type WinampSkinRegions = Partial<Record<WinampSkinRegionSection, WinampSkinRegionPoint[][]>>;

const REGION_WIDTH = 275;
const REGION_HEIGHT = 116;
const MAX_POLYGONS = 32;
const MAX_POINTS_PER_POLYGON = 256;

/**
 * Parse the classic Winamp REGION.TXT polygon masks. Invalid or incomplete
 * sections are ignored so a malformed optional config never rejects a skin.
 */
export function parseWinampSkinRegions(source: string): WinampSkinRegions {
  const sections = new Map<string, { numPoints?: string; pointList?: string }>();
  let currentSection: string | null = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.split(';', 1)[0].trim();
    if (!line) continue;
    const section = line.match(/^\[([^\]]+)\]$/);
    if (section) {
      currentSection = section[1].trim().toLowerCase();
      if (!sections.has(currentSection)) sections.set(currentSection, {});
      continue;
    }
    if (!currentSection) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    const entry = sections.get(currentSection);
    if (!entry) continue;
    if (key === 'numpoints') entry.numPoints = value;
    else if (key === 'pointlist') entry.pointList = value;
  }

  const result: WinampSkinRegions = {};
  const sectionMap: Array<[string, WinampSkinRegionSection]> = [
    ['normal', 'normal'],
    ['windowshade', 'windowshade'],
    ['equalizer', 'equalizer'],
    ['equalizerws', 'equalizerws'],
  ];

  for (const [sourceName, targetName] of sectionMap) {
    const section = sections.get(sourceName);
    if (!section?.numPoints || !section.pointList) continue;
    const counts = section.numPoints.split(/[\s,]+/).filter(Boolean).map(Number);
    const coordinates = section.pointList.split(/[\s,]+/).filter(Boolean).map(Number);
    if (!counts.length || counts.length > MAX_POLYGONS || counts.some((count) => !Number.isInteger(count) || count < 3 || count > MAX_POINTS_PER_POLYGON)) continue;
    if (coordinates.some((coordinate) => !Number.isFinite(coordinate))) continue;
    if (coordinates.length !== counts.reduce((sum, count) => sum + count * 2, 0)) continue;

    let cursor = 0;
    const polygons: WinampSkinRegionPoint[][] = [];
    let valid = true;
    for (const count of counts) {
      const polygon: WinampSkinRegionPoint[] = [];
      for (let point = 0; point < count; point += 1) {
        const x = coordinates[cursor++];
        const y = coordinates[cursor++];
        if (x < 0 || x > REGION_WIDTH || y < 0 || y > REGION_HEIGHT) {
          valid = false;
          break;
        }
        polygon.push({ x, y });
      }
      if (!valid) break;
      polygons.push(polygon);
    }
    if (valid && polygons.length) result[targetName] = polygons;
  }
  return result;
}
