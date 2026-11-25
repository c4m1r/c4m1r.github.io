import type { MediaTrack } from '../../apps/mediaplayer/playlist';

export type EmbeddedAudioMetadata = Partial<Pick<MediaTrack, 'title' | 'artist' | 'album' | 'trackNumber'>>;

function decodeTextFrame(bytes: Uint8Array): string {
  if (!bytes.length) return '';
  const encoding = bytes[0];
  const payload = bytes.subarray(1);
  try {
    let decoded = '';
    if (encoding === 0) decoded = new TextDecoder('windows-1252').decode(payload);
    else if (encoding === 1) decoded = new TextDecoder('utf-16').decode(payload);
    else if (encoding === 2) decoded = new TextDecoder('utf-16be').decode(payload);
    else if (encoding === 3) decoded = new TextDecoder('utf-8').decode(payload);
    else return '';
    return decoded.replace(/\0.*$/s, '').replace(/\u0000/g, '').trim();
  } catch {
    return '';
  }
}

function parseSynchsafe(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] & 0x7f) << 21)
    | ((bytes[offset + 1] & 0x7f) << 14)
    | ((bytes[offset + 2] & 0x7f) << 7)
    | (bytes[offset + 3] & 0x7f);
}

function removeUnsynchronization(bytes: Uint8Array): Uint8Array {
  const output = new Uint8Array(bytes.length);
  let length = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    output[length] = bytes[index];
    length += 1;
    if (bytes[index] === 0xff && bytes[index + 1] === 0x00) index += 1;
  }
  return output.subarray(0, length);
}

function decodeId3v1(bytes: Uint8Array): EmbeddedAudioMetadata {
  if (bytes.length < 128) return {};
  const start = bytes.length - 128;
  if (String.fromCharCode(...bytes.subarray(start, start + 3)) !== 'TAG') return {};
  const decode = (from: number, length: number) =>
    new TextDecoder('windows-1252').decode(bytes.subarray(start + from, start + from + length))
      .replace(/\0/g, '').trim();
  const title = decode(3, 30);
  const artist = decode(33, 30);
  const album = decode(63, 30);
  const track = bytes[start + 125] === 0 ? bytes[start + 126] : 0;
  return {
    ...(title ? { title } : {}),
    ...(artist ? { artist } : {}),
    ...(album ? { album } : {}),
    ...(track > 0 ? { trackNumber: String(track) } : {}),
  };
}

/** Read common ID3v2.2/2.3/2.4 and ID3v1 tags from a local MP3 without uploading it. */
export async function readEmbeddedAudioMetadata(file: Blob): Promise<EmbeddedAudioMetadata> {
  const header = new Uint8Array(await file.slice(0, 10).arrayBuffer());
  let metadata: EmbeddedAudioMetadata = {};

  if (header.length === 10 && String.fromCharCode(...header.subarray(0, 3)) === 'ID3') {
    const majorVersion = header[3];
    const tagSize = parseSynchsafe(header, 6);
    const tagEnd = Math.min(file.size, 10 + tagSize, 16 * 1024 * 1024);
    const tagFlags = header[5];
    if (majorVersion >= 2 && majorVersion <= 4 && tagEnd > 10 && !(majorVersion === 2 && (tagFlags & 0x40))) {
      const tag = new Uint8Array(await file.slice(10, tagEnd).arrayBuffer());
      const ids: Record<string, keyof EmbeddedAudioMetadata> = {
        TIT2: 'title', TPE1: 'artist', TALB: 'album', TRCK: 'trackNumber',
        TT2: 'title', TP1: 'artist', TAL: 'album', TRK: 'trackNumber',
      };
      let offset = 0;
      const headerSize = majorVersion === 2 ? 6 : 10;
      if (majorVersion === 3 && (tagFlags & 0x40)) {
        if (tag.length < 4) offset = tag.length;
        else offset = Math.min(tag.length, 4 + (((tag[0] << 24) | (tag[1] << 16) | (tag[2] << 8) | tag[3]) >>> 0));
      } else if (majorVersion === 4 && (tagFlags & 0x40)) {
        offset = Math.min(tag.length, parseSynchsafe(tag, 0));
      }
      while (offset + headerSize <= tag.length) {
        const idLength = majorVersion === 2 ? 3 : 4;
        const id = String.fromCharCode(...tag.subarray(offset, offset + idLength));
        if (!id.trim() || /^\0+$/.test(id)) break;
        const frameSize = majorVersion === 2
          ? ((tag[offset + 3] << 16) | (tag[offset + 4] << 8) | tag[offset + 5])
          : majorVersion === 4
            ? parseSynchsafe(tag, offset + 4)
            : ((tag[offset + 4] << 24) | (tag[offset + 5] << 16) | (tag[offset + 6] << 8) | tag[offset + 7]) >>> 0;
        if (!frameSize || offset + headerSize + frameSize > tag.length) break;
        const flagsOffset = majorVersion === 2 ? -1 : offset + 8;
        const frameFormatFlags = flagsOffset >= 0 ? tag[flagsOffset + 1] : 0;
        const compressedOrEncrypted = majorVersion === 3
          ? (frameFormatFlags & 0xc0) !== 0
          : majorVersion === 4 && (frameFormatFlags & 0x0c) !== 0;
        const key = ids[id];
        let payloadStart = offset + headerSize;
        let payload = tag.subarray(payloadStart, payloadStart + frameSize);
        if (majorVersion === 3 && (frameFormatFlags & 0x20)) payload = payload.subarray(1);
        if (majorVersion === 4) {
          if (frameFormatFlags & 0x40) payload = payload.subarray(1);
          if (frameFormatFlags & 0x01) payload = payload.subarray(4);
          if (frameFormatFlags & 0x02) payload = removeUnsynchronization(payload);
        }
        if (key && !compressedOrEncrypted && metadata[key] === undefined) {
          const value = decodeTextFrame(payload);
          if (value) metadata = { ...metadata, [key]: value };
        }
        offset += headerSize + frameSize;
      }
    }
  }

  if (!metadata.title || !metadata.artist || !metadata.album) {
    const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 128)).arrayBuffer());
    const legacy = decodeId3v1(tail);
    metadata = {
      ...legacy,
      ...metadata,
      ...(metadata.title ? {} : legacy.title ? { title: legacy.title } : {}),
      ...(metadata.artist ? {} : legacy.artist ? { artist: legacy.artist } : {}),
      ...(metadata.album ? {} : legacy.album ? { album: legacy.album } : {}),
      ...(metadata.trackNumber ? {} : legacy.trackNumber ? { trackNumber: legacy.trackNumber } : {}),
    };
  }
  return metadata;
}
