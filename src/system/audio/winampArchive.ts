import type { MediaTrack } from '../../apps/mediaplayer/playlist';
import type { WinampLocalAudioRecord } from './winampLocalLibrary';

const ARCHIVE_VERSION = 1;
const MAX_ENTRIES = 1002;
const MAX_TOTAL_BYTES = 512 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 4 * 1024 * 1024;
const MAX_TRACKS = 10000;

export interface WinampArchiveTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  trackNumber?: string;
  durationLabel: string;
  src?: string;
  assetPath?: string;
  assetName?: string;
  assetType?: string;
  assetLastModified?: number;
  assetSize?: number;
}
export interface WinampArchiveManifest {
  format: 'wampack';
  version: 1;
  exportedAt: string;
  tracks: WinampArchiveTrack[];
}
export interface ImportedWinampArchive {
  manifest: WinampArchiveManifest;
  assets: Array<{ path: string; name: string; type: string; lastModified: number; blob: Blob }>;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (-(value & 1) & 0xedb88320);
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}
function u16(view: DataView, offset: number, value: number): void { view.setUint16(offset, value, true); }
function u32(view: DataView, offset: number, value: number): void { view.setUint32(offset, value, true); }
function safePath(path: string): boolean {
  return path.length > 0 && path.length <= 240 && !path.startsWith('/') &&
    !/[\\\u0000-\u001f\u007f]/.test(path) &&
    path.split('/').every((part) => part !== '..' && part !== '.' && part.length > 0);
}
function safeAssetName(name: string): boolean {
  return name.length > 0 && name.length <= 255 && name !== '.' && name !== '..' &&
    !/[\/\\\u0000-\u001f\u007f]/.test(name);
}
function safeMimeType(type: string): boolean {
  return type === '' || /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(type);
}
function localAssetPath(index: number, name: string): string {
  const extension = name.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase() ?? 'bin';
  return `audio/${String(index + 1).padStart(6, '0')}.${extension}`;
}

export async function createWinampArchive(
  playlist: MediaTrack[],
  localRecords: WinampLocalAudioRecord[],
): Promise<Blob> {
  if (playlist.length > MAX_TRACKS) throw new Error('Playlist contains too many entries for a portable backup');
  const byId = new Map(localRecords.map((record) => [record.id, record]));
  const used = new Map<string, string>();
  const entries: Array<{ name: string; bytes: Uint8Array }> = [];
  const tracks: WinampArchiveTrack[] = [];
  let assetIndex = 0;
  let payloadBytes = 0;
  for (const track of playlist) {
    const record = byId.get(track.localAssetId ?? track.id);
    if (record) {
      let assetPath = used.get(record.id);
      if (!assetPath) {
        if (!safeAssetName(record.name) || !safeMimeType(record.type) ||
          !Number.isSafeInteger(record.lastModified) || record.lastModified < 0 ||
          !Number.isSafeInteger(record.size) || record.size < 0 || record.blob.size !== record.size) {
          throw new Error('Local library contains invalid file metadata');
        }
        payloadBytes += record.blob.size;
        if (payloadBytes > MAX_TOTAL_BYTES) throw new Error('Archive exceeds the 512 MB safety limit');
        assetPath = localAssetPath(assetIndex++, record.name);
        used.set(record.id, assetPath);
        entries.push({ name: assetPath, bytes: new Uint8Array(await record.blob.arrayBuffer()) });
      }
      tracks.push({
        id: track.id, title: track.title, artist: track.artist, durationLabel: track.durationLabel,
        ...(track.album ? { album: track.album } : {}),
        ...(track.trackNumber ? { trackNumber: track.trackNumber } : {}),
        assetPath, assetName: record.name, assetType: record.type,
        assetLastModified: record.lastModified, assetSize: record.size,
      });
      continue;
    }
    let source: URL | null = null;
    try { source = new URL(track.src); } catch { /* session-only or invalid source */ }
    tracks.push({
      id: track.id, title: track.title, artist: track.artist, durationLabel: track.durationLabel,
      ...(track.album ? { album: track.album } : {}),
      ...(track.trackNumber ? { trackNumber: track.trackNumber } : {}),
      ...(source && (source.protocol === 'http:' || source.protocol === 'https:') ? { src: source.href } : {}),
    });
  }
  const manifest: WinampArchiveManifest = {
    format: 'wampack', version: ARCHIVE_VERSION, exportedAt: new Date().toISOString(), tracks,
  };
  const manifestBytes = encoder.encode(JSON.stringify(manifest, null, 2));
  if (manifestBytes.byteLength > MAX_MANIFEST_BYTES) throw new Error('Playlist manifest exceeds the 4 MB safety limit');
  entries.unshift({ name: 'manifest.json', bytes: manifestBytes });
  if (entries.length > MAX_ENTRIES) throw new Error('Library contains too many archive entries');
  const total = entries.reduce((sum, entry) => sum + entry.bytes.byteLength, 0);
  if (total > MAX_TOTAL_BYTES) throw new Error('Archive exceeds the 512 MB safety limit');
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    if (!safePath(entry.name)) throw new Error('Unsafe archive path');
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.bytes);
    const local = new Uint8Array(30 + name.length + entry.bytes.length);
    const lv = new DataView(local.buffer);
    u32(lv, 0, 0x04034b50); u16(lv, 4, 20); u16(lv, 6, 0x0800);
    u16(lv, 8, 0); u32(lv, 14, crc); u32(lv, 18, entry.bytes.length); u32(lv, 22, entry.bytes.length);
    u16(lv, 26, name.length); u16(lv, 28, 0);
    local.set(name, 30); local.set(entry.bytes, 30 + name.length);
    localParts.push(local);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    u32(cv, 0, 0x02014b50); u16(cv, 4, 20); u16(cv, 6, 20); u16(cv, 8, 0x0800);
    u16(cv, 10, 0); u32(cv, 16, crc); u32(cv, 20, entry.bytes.length); u32(cv, 24, entry.bytes.length);
    u16(cv, 28, name.length); u16(cv, 30, 0); u16(cv, 32, 0); u16(cv, 34, 0); u16(cv, 36, 0);
    u32(cv, 38, 0); u32(cv, 42, offset); central.set(name, 46);
    centralParts.push(central);
    offset += local.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50); u16(ev, 4, 0); u16(ev, 6, 0);
  u16(ev, 8, entries.length); u16(ev, 10, entries.length);
  u32(ev, 12, centralSize); u32(ev, 16, offset); u16(ev, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/vnd.winamp.wampack' });
}

export async function readWinampArchive(file: Blob): Promise<ImportedWinampArchive> {
  if (file.size < 22 || file.size > MAX_TOTAL_BYTES + 16 * 1024 * 1024) throw new Error('Archive size is outside the supported limit');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const searchStart = Math.max(0, bytes.length - 65557);
  let endOffset = -1;
  for (let i = bytes.length - 22; i >= searchStart; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      const commentLength = view.getUint16(i + 20, true);
      if (i + 22 + commentLength === bytes.length) { endOffset = i; break; }
    }
  }
  if (endOffset < 0) throw new Error('Invalid ZIP archive: end record not found');
  const diskNumber = view.getUint16(endOffset + 4, true);
  const centralDisk = view.getUint16(endOffset + 6, true);
  const diskCount = view.getUint16(endOffset + 8, true);
  const count = view.getUint16(endOffset + 10, true);
  const centralSize = view.getUint32(endOffset + 12, true);
  const centralOffset = view.getUint32(endOffset + 16, true);
  const centralEnd = centralOffset + centralSize;
  if (diskNumber !== 0 || centralDisk !== 0 || diskCount !== count || !count || count > MAX_ENTRIES ||
    centralEnd !== endOffset || centralEnd > bytes.length) throw new Error('Invalid or multi-disk ZIP directory');
  const files = new Map<string, Uint8Array>();
  const localRanges: Array<{ start: number; end: number }> = [];
  const localOffsets = new Set<number>();
  let cursor = centralOffset;
  let expandedTotal = 0;
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > centralEnd || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Malformed ZIP central directory');
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const crc = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const diskStart = view.getUint16(cursor + 34, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const recordEnd = cursor + 46 + nameLength + extraLength + commentLength;
    if (recordEnd > centralEnd) throw new Error('Malformed ZIP central directory entry bounds');
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    cursor = recordEnd;
    if (!safePath(name) || files.has(name) || (flags & ~0x0800) !== 0 || method !== 0 ||
      compressedSize !== size || diskStart !== 0 || size === 0xffffffff || compressedSize === 0xffffffff ||
      localOffsets.has(localOffset)) throw new Error('Unsupported, encrypted or unsafe ZIP entry');
    expandedTotal += size;
    if (expandedTotal > MAX_TOTAL_BYTES || localOffset + 30 > centralOffset ||
      view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Archive exceeds limits or has an invalid local entry');
    const localFlags = view.getUint16(localOffset + 6, true);
    const localMethod = view.getUint16(localOffset + 8, true);
    const localCrc = view.getUint32(localOffset + 14, true);
    const localCompressedSize = view.getUint32(localOffset + 18, true);
    const localSize = view.getUint32(localOffset + 22, true);
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const localHeaderEnd = localOffset + 30 + localNameLength + localExtraLength;
    if (localHeaderEnd > centralOffset) throw new Error('ZIP local header exceeds the data area');
    const localName = decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength));
    if (localFlags !== flags || localMethod !== method || localName !== name ||
      localCrc !== crc || localCompressedSize !== compressedSize || localSize !== size) {
      throw new Error('ZIP local and central entry headers do not match');
    }
    const dataStart = localHeaderEnd;
    const dataEnd = dataStart + size;
    if (dataEnd > centralOffset) throw new Error('ZIP entry overlaps the central directory');
    localOffsets.add(localOffset);
    localRanges.push({ start: localOffset, end: dataEnd });
    const data = bytes.slice(dataStart, dataEnd);
    if (crc32(data) !== crc) throw new Error('CRC check failed for ' + name);
    files.set(name, data);
  }
  if (cursor !== centralEnd) throw new Error('ZIP central directory size does not match its entries');
  localRanges.sort((a, b) => a.start - b.start);
  for (let index = 1; index < localRanges.length; index += 1) {
    if (localRanges[index].start < localRanges[index - 1].end) throw new Error('ZIP local entries overlap');
  }
  const manifestBytes = files.get('manifest.json');
  if (!manifestBytes || manifestBytes.byteLength > MAX_MANIFEST_BYTES) throw new Error('Archive manifest is missing or too large');
  let manifest: WinampArchiveManifest;
  try { manifest = JSON.parse(decoder.decode(manifestBytes)) as WinampArchiveManifest; } catch { throw new Error('Archive manifest is not valid JSON'); }
  if (manifest.format !== 'wampack' || manifest.version !== ARCHIVE_VERSION || !Array.isArray(manifest.tracks) || manifest.tracks.length > MAX_TRACKS) {
    throw new Error('Unsupported archive format or manifest version');
  }
  const referenced = new Set<string>();
  const assetMetadata = new Map<string, { name: string; type: string; lastModified: number; size: number }>();
  if (typeof manifest.exportedAt !== 'string' || !Number.isFinite(Date.parse(manifest.exportedAt))) {
    throw new Error('Archive contains an invalid export timestamp');
  }
  for (const track of manifest.tracks) {
    if (!track || typeof track.id !== 'string' || !track.id || track.id.length > 256 ||
      typeof track.title !== 'string' || track.title.length > 1024 ||
      typeof track.artist !== 'string' || track.artist.length > 1024 ||
      typeof track.durationLabel !== 'string' || track.durationLabel.length > 32 ||
      (track.album !== undefined && (typeof track.album !== 'string' || track.album.length > 1024)) ||
      (track.trackNumber !== undefined && (typeof track.trackNumber !== 'string' || track.trackNumber.length > 32)) ||
      (track.src !== undefined && typeof track.src !== 'string') ||
      (track.assetPath !== undefined && (typeof track.assetPath !== 'string' ||
        !/^audio\/[0-9]{6}\.[a-z0-9]{1,8}$/i.test(track.assetPath) || !safePath(track.assetPath)))) {
      throw new Error('Archive contains an invalid playlist entry');
    }
    if (track.src) {
      let url: URL;
      try { url = new URL(track.src); } catch { throw new Error('Archive contains an invalid remote URL'); }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Archive contains an unsupported remote URL');
    }
    if (track.assetPath) {
      const assetBytes = files.get(track.assetPath);
      if (!assetBytes) throw new Error('Archive references a missing audio asset');
      referenced.add(track.assetPath);
      const metadata = {
        name: track.assetName ?? '',
        type: track.assetType ?? '',
        lastModified: track.assetLastModified ?? -1,
        size: track.assetSize ?? -1,
      };
      if (!safeAssetName(metadata.name) || !safeMimeType(metadata.type) ||
        !Number.isSafeInteger(metadata.lastModified) || metadata.lastModified < 0 ||
        !Number.isSafeInteger(metadata.size) || metadata.size !== assetBytes.byteLength) {
        throw new Error('Archive contains invalid original audio-file metadata');
      }
      const existing = assetMetadata.get(track.assetPath);
      if (existing && (existing.name !== metadata.name || existing.type !== metadata.type ||
        existing.lastModified !== metadata.lastModified || existing.size !== metadata.size)) {
        throw new Error('Playlist references disagree about shared audio asset metadata');
      }
      assetMetadata.set(track.assetPath, metadata);
    }
  }
  if ([...files.keys()].some((path) => path !== 'manifest.json' && !referenced.has(path))) throw new Error('Archive contains unreferenced payload files');
  const assets = [...referenced].map((path) => ({
    path, name: assetMetadata.get(path)!.name, type: assetMetadata.get(path)!.type,
    lastModified: assetMetadata.get(path)!.lastModified,
    blob: new Blob([files.get(path)!], { type: assetMetadata.get(path)!.type || 'application/octet-stream' }),
  }));
  return { manifest, assets };
}
