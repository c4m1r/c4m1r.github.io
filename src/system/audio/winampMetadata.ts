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
    const terminator = decoded.indexOf(String.fromCharCode(0));
    return (terminator >= 0 ? decoded.slice(0, terminator) : decoded).trim();
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

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function parseVorbisComments(bytes: Uint8Array, offset = 0): EmbeddedAudioMetadata {
  if (offset + 8 > bytes.length) return {};
  let cursor = offset;
  const vendorLength = readUint32LE(bytes, cursor);
  cursor += 4 + vendorLength;
  if (cursor + 4 > bytes.length) return {};
  const commentCount = Math.min(readUint32LE(bytes, cursor), 10000);
  cursor += 4;
  const metadata: EmbeddedAudioMetadata = {};
  const decoder = new TextDecoder('utf-8');
  for (let index = 0; index < commentCount && cursor + 4 <= bytes.length; index += 1) {
    const length = readUint32LE(bytes, cursor);
    cursor += 4;
    if (!length || cursor + length > bytes.length) break;
    const comment = decoder.decode(bytes.subarray(cursor, cursor + length));
    cursor += length;
    const separator = comment.indexOf('=');
    if (separator < 1) continue;
    const key = comment.slice(0, separator).toUpperCase();
    const value = comment.slice(separator + 1).trim();
    if (!value) continue;
    if (key === 'TITLE' && !metadata.title) metadata.title = value;
    else if (key === 'ARTIST' && !metadata.artist) metadata.artist = value;
    else if (key === 'ALBUM' && !metadata.album) metadata.album = value;
    else if ((key === 'TRACKNUMBER' || key === 'TRACK') && !metadata.trackNumber) metadata.trackNumber = value;
  }
  return metadata;
}

function parseFlacMetadata(bytes: Uint8Array): EmbeddedAudioMetadata {
  if (bytes.length < 8 || String.fromCharCode(...bytes.subarray(0, 4)) !== 'fLaC') return {};
  let offset = 4;
  while (offset + 4 <= bytes.length) {
    const header = bytes[offset];
    const blockType = header & 0x7f;
    const isLast = (header & 0x80) !== 0;
    const length = (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    const start = offset + 4;
    const end = start + length;
    if (end > bytes.length) break;
    if (blockType === 4) return parseVorbisComments(bytes.subarray(start, end));
    offset = end;
    if (isLast) break;
  }
  return {};
}

function parseOggMetadata(bytes: Uint8Array): EmbeddedAudioMetadata {
  let pageOffset = 0;
  let packet: number[] = [];
  while (pageOffset + 27 <= bytes.length) {
    if (String.fromCharCode(...bytes.subarray(pageOffset, pageOffset + 4)) !== 'OggS') {
      pageOffset += 1;
      continue;
    }
    const segmentCount = bytes[pageOffset + 26];
    const segmentStart = pageOffset + 27;
    const payloadStart = segmentStart + segmentCount;
    if (payloadStart > bytes.length) break;
    let payloadOffset = payloadStart;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const segmentLength = bytes[segmentStart + segment];
      if (payloadOffset + segmentLength > bytes.length) return {};
      for (let byte = payloadOffset; byte < payloadOffset + segmentLength; byte += 1) packet.push(bytes[byte]);
      payloadOffset += segmentLength;
      if (segmentLength < 255) {
        const packetBytes = Uint8Array.from(packet);
        const vorbisPrefix = packetBytes.length >= 7 && packetBytes[0] === 3
          && String.fromCharCode(...packetBytes.subarray(1, 7)) === 'vorbis';
        const opusPrefix = packetBytes.length >= 8 && String.fromCharCode(...packetBytes.subarray(0, 8)) === 'OpusTags';
        if (vorbisPrefix) return parseVorbisComments(packetBytes, 7);
        if (opusPrefix) return parseVorbisComments(packetBytes, 8);
        packet = [];
      }
    }
    pageOffset = payloadOffset;
  }
  return {};
}

function parseWavInfo(bytes: Uint8Array): EmbeddedAudioMetadata {
  if (bytes.length < 12 || String.fromCharCode(...bytes.subarray(0, 4)) !== 'RIFF'
    || String.fromCharCode(...bytes.subarray(8, 12)) !== 'WAVE') return {};
  let offset = 12;
  const metadata: EmbeddedAudioMetadata = {};
  while (offset + 8 <= bytes.length) {
    const id = String.fromCharCode(...bytes.subarray(offset, offset + 4));
    const length = readUint32LE(bytes, offset + 4);
    const start = offset + 8;
    const end = start + length;
    if (end > bytes.length) break;
    if (id === 'LIST' && length >= 4 && String.fromCharCode(...bytes.subarray(start, start + 4)) === 'INFO') {
      let infoOffset = start + 4;
      while (infoOffset + 8 <= end) {
        const infoId = String.fromCharCode(...bytes.subarray(infoOffset, infoOffset + 4));
        const infoLength = readUint32LE(bytes, infoOffset + 4);
        const valueStart = infoOffset + 8;
        const valueEnd = Math.min(end, valueStart + infoLength);
        if (valueEnd > valueStart) {
          const value = new TextDecoder('windows-1252').decode(bytes.subarray(valueStart, valueEnd)).replace(/\0/g, '').trim();
          if (infoId === 'INAM' && value) metadata.title = value;
          else if (infoId === 'IART' && value) metadata.artist = value;
          else if ((infoId === 'IPRD' || infoId === 'IALB') && value) metadata.album = value;
          else if (infoId === 'ITRK' && value) metadata.trackNumber = value;
        }
        infoOffset = valueStart + infoLength + (infoLength % 2);
      }
    }
    offset = end + (length % 2);
  }
  return metadata;
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
      let tag = new Uint8Array(await file.slice(10, tagEnd).arrayBuffer());
      if (majorVersion === 3 && (tagFlags & 0x80)) tag = removeUnsynchronization(tag);
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
          if ((frameFormatFlags & 0x02) || (tagFlags & 0x80)) payload = removeUnsynchronization(payload);
        }
        if (key && !compressedOrEncrypted && metadata[key] === undefined) {
          const value = decodeTextFrame(payload);
          if (value) metadata = { ...metadata, [key]: value };
        }
        offset += headerSize + frameSize;
      }
    }
  }

  if (!metadata.title || !metadata.artist || !metadata.album || !metadata.trackNumber) {
    const containerBytes = new Uint8Array(await file.slice(0, Math.min(file.size, 16 * 1024 * 1024)).arrayBuffer());
    const containerMetadata = parseFlacMetadata(containerBytes);
    const oggMetadata = Object.keys(containerMetadata).length ? {} : parseOggMetadata(containerBytes);
    const wavMetadata = Object.keys(containerMetadata).length || Object.keys(oggMetadata).length ? {} : parseWavInfo(containerBytes);
    metadata = { ...containerMetadata, ...oggMetadata, ...wavMetadata, ...metadata };
  }

  if (!metadata.title || !metadata.artist || !metadata.album || !metadata.trackNumber) {
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
