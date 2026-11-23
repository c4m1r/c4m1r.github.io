export interface WinampSkinPlaylistStyle {
  normal: string;
  current: string;
  normalbg: string;
  selectedbg: string;
  mbfg: string;
  mbbg: string;
  font: string;
}

export interface WinampSkinArchive {
  fileName: string;
  assets: Map<string, Blob>;
  playlistStyle: WinampSkinPlaylistStyle;
  visualizerColors: string[];
  regionText: string | null;
}

interface ZipEntry {
  name: string;
  compression: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
  flags: number;
}

const MAX_ARCHIVE_BYTES = 24 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 64 * 1024 * 1024;
const MAX_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_ENTRIES = 512;
const DEFAULT_VISUALIZER_COLORS = [
  '#00ff00', '#00df00', '#00bf00', '#009f00', '#007f00', '#005f00',
  '#ffff00', '#dfdf00', '#bfbf00', '#9f9f00', '#7f7f00', '#5f5f00',
  '#ff0000', '#df0000', '#bf0000', '#9f0000', '#7f0000', '#5f0000',
  '#ffffff', '#dfdfdf', '#bfbfbf', '#9f9f9f', '#7f7f7f', '#5f5f5f',
];

const DEFAULT_PLAYLIST_STYLE: WinampSkinPlaylistStyle = {
  normal: '#00ff00',
  current: '#ffffff',
  normalbg: '#000000',
  selectedbg: '#000080',
  mbfg: '#ffffff',
  mbbg: '#000080',
  font: 'Arial',
};

function readZipDirectory(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minOffset = Math.max(0, bytes.length - 65_557);
  let endOffset = -1;

  for (let offset = bytes.length - 22; offset >= minOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('Invalid .wsz archive: ZIP directory not found');

  const diskNumber = view.getUint16(endOffset + 4, true);
  const directoryDisk = view.getUint16(endOffset + 6, true);
  const entriesOnDisk = view.getUint16(endOffset + 8, true);
  const entryCount = view.getUint16(endOffset + 10, true);
  const directorySize = view.getUint32(endOffset + 12, true);
  const directoryOffset = view.getUint32(endOffset + 16, true);

  if (diskNumber !== 0 || directoryDisk !== 0 || entriesOnDisk !== entryCount) {
    throw new Error('Multi-volume .wsz archives are not supported');
  }
  if (entryCount === 0xffff || directoryOffset === 0xffffffff || directorySize === 0xffffffff) {
    throw new Error('ZIP64 .wsz archives are not supported');
  }
  if (entryCount > MAX_ENTRIES || directoryOffset + directorySize > bytes.length) {
    throw new Error('The .wsz archive directory is outside supported limits');
  }

  const decoder = new TextDecoder('utf-8');
  const entries: ZipEntry[] = [];
  let offset = directoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error('Invalid .wsz archive: malformed ZIP directory entry');
    }

    const flags = view.getUint16(offset + 8, true);
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const nextOffset = nameStart + nameLength + extraLength + commentLength;

    if (nextOffset > bytes.length || compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new Error('Invalid .wsz archive: unsupported ZIP entry size');
    }

    const rawName = bytes.subarray(nameStart, nameStart + nameLength);
    const name = decoder.decode(rawName).replace(/\\/g, '/');
    if (name.startsWith('/') || name.split('/').some((part) => part === '..')) {
      throw new Error('Unsafe path found in .wsz archive');
    }

    if (!name.endsWith('/')) {
      if (uncompressedSize > MAX_ENTRY_BYTES) {
        throw new Error(`Skin entry exceeds the ${MAX_ENTRY_BYTES / 1024 / 1024} MB safety limit`);
      }
      entries.push({ name, compression, compressedSize, uncompressedSize, localHeaderOffset, flags });
    }
    offset = nextOffset;
  }

  const expandedTotal = entries.reduce((total, entry) => total + entry.uncompressedSize, 0);
  if (expandedTotal > MAX_EXPANDED_BYTES) {
    throw new Error('Expanded .wsz contents exceed the 64 MB safety limit');
  }
  return entries;
}

async function extractZipEntry(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  if (entry.flags & 0x0001) throw new Error(`Encrypted skin entry is not supported: ${entry.name}`);

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localHeaderOffset;
  if (offset + 30 > bytes.length || view.getUint32(offset, true) !== 0x04034b50) {
    throw new Error(`Invalid ZIP local header: ${entry.name}`);
  }

  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataOffset = offset + 30 + nameLength + extraLength;
  const dataEnd = dataOffset + entry.compressedSize;
  if (dataEnd > bytes.length) throw new Error(`Truncated skin entry: ${entry.name}`);

  const compressed = bytes.subarray(dataOffset, dataEnd);
  let result: Uint8Array;

  if (entry.compression === 0) {
    result = compressed.slice();
  } else if (entry.compression === 8) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser does not support ZIP deflate decompression');
    }
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      result = new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
      throw new Error(`Unable to decompress skin entry: ${entry.name}`);
    }
  } else {
    throw new Error(`Unsupported ZIP compression method ${entry.compression}: ${entry.name}`);
  }

  if (result.byteLength !== entry.uncompressedSize) {
    throw new Error(`Unexpected expanded size for skin entry: ${entry.name}`);
  }
  return result;
}

function findLastEntry(entries: Map<string, Blob>, baseName: string): Blob | undefined {
  const target = baseName.toLowerCase();
  let found: Blob | undefined;
  entries.forEach((blob, path) => {
    if (path.split('/').pop()?.toLowerCase() === target) found = blob;
  });
  return found;
}

function parseIni(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  let section = '';
  for (const line of text.replace(/^\\uFEFF/, '').split(/[\\r\\n]+/)) {
    const sectionMatch = /^\\s*\\[([^\\]]+)\\]\\s*$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1].trim().toLowerCase();
      continue;
    }
    if (!section || /^\\s*[;#]/.test(line)) continue;
    const match = /^\\s*([^=]+?)\\s*=\\s*(.*?)\\s*$/.exec(line);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    const value = match[2].split('=')[0].trim().replace(/^["']|["']$/g, '');
    values[key] = value;
  }
  return values;
}

function normalizeSkinColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalized = value.startsWith('#') ? value : `#${value}`;
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
}

function parsePlaylistStyle(text: string | undefined): WinampSkinPlaylistStyle {
  if (!text) return DEFAULT_PLAYLIST_STYLE;
  const values = parseIni(text);
  return {
    normal: normalizeSkinColor(values.normal, DEFAULT_PLAYLIST_STYLE.normal),
    current: normalizeSkinColor(values.current, DEFAULT_PLAYLIST_STYLE.current),
    normalbg: normalizeSkinColor(values.normalbg, DEFAULT_PLAYLIST_STYLE.normalbg),
    selectedbg: normalizeSkinColor(values.selectedbg, DEFAULT_PLAYLIST_STYLE.selectedbg),
    mbfg: normalizeSkinColor(values.mbfg, DEFAULT_PLAYLIST_STYLE.mbfg),
    mbbg: normalizeSkinColor(values.mbbg, DEFAULT_PLAYLIST_STYLE.mbbg),
    font: (values.font || DEFAULT_PLAYLIST_STYLE.font).slice(0, 48),
  };
}

function parseVisualizerColors(text: string | undefined): string[] {
  if (!text) return DEFAULT_VISUALIZER_COLORS;
  const colors = [...DEFAULT_VISUALIZER_COLORS];
  const matcher = /^\\s*(\\d+)\\s*,?\\s*(\\d+)\\s*,?\\s*(\\d+)/;
  text.split(/[\\r\\n]+/).forEach((line, index) => {
    if (index >= colors.length) return;
    const match = matcher.exec(line);
    if (!match) return;
    const rgb = match.slice(1, 4).map((part) => Math.max(0, Math.min(255, Number(part))));
    colors[index] = `rgb(${rgb.join(',')})`;
  });
  return colors;
}

export async function parseWinampSkinArchive(file: Blob, fileName = 'custom.wsz'): Promise<WinampSkinArchive> {
  if (file.size === 0 || file.size > MAX_ARCHIVE_BYTES) {
    throw new Error('Skin archive must be between 1 byte and 24 MB');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = readZipDirectory(bytes);
  const extracted = new Map<string, Blob>();

  for (const entry of entries) {
    const baseName = entry.name.split('/').pop()?.toLowerCase() ?? '';
    const isSupportedAsset = /\\.(bmp|png|cur)$/i.test(baseName);
    const isSupportedConfig = /^(pledit|viscolor|region)\\.txt$/i.test(baseName);
    if (!isSupportedAsset && !isSupportedConfig) continue;

    const data = await extractZipEntry(bytes, entry);
    const type = baseName.endsWith('.png') ? 'image/png'
      : baseName.endsWith('.bmp') ? 'image/bmp'
        : baseName.endsWith('.cur') ? 'image/x-icon'
          : 'text/plain;charset=utf-8';
    extracted.set(entry.name, new Blob([data], { type }));
  }

  if (!findLastEntry(extracted, 'main.bmp') && !findLastEntry(extracted, 'main.png')) {
    throw new Error('This archive does not contain the required main.bmp skin sheet');
  }

  const textAsset = (name: string) => findLastEntry(extracted, name);
  const readText = async (blob: Blob | undefined) => blob ? blob.text() : undefined;

  return {
    fileName,
    assets: extracted,
    playlistStyle: parsePlaylistStyle(await readText(textAsset('pledit.txt'))),
    visualizerColors: parseVisualizerColors(await readText(textAsset('viscolor.txt'))),
    regionText: await readText(textAsset('region.txt')) ?? null,
  };
}

export function releaseWinampSkinArchive(skin: WinampSkinArchive): void {
  // Blob assets are retained by IndexedDB or the active skin state; no object URLs are created here.
  void skin;
}
