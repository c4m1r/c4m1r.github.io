const HEADER = 'Winamp EQ library file v1.1';
const RECORD_SIZE = 257 + 11;
const BAND_COUNT = 10;

export interface WinampEqfPreset {
  name: string;
  preamp: number;
  bands: number[];
}

function toWinampValue(gainDb: number): number {
  const gain = Math.max(-12, Math.min(12, gainDb));
  return Math.round(gain >= 0 ? 32 + (gain / 12) * 32 : 32 + (gain / 12) * 31);
}

function fromWinampValue(value: number): number {
  return Math.max(-12, Math.min(12, value >= 32 ? ((value - 32) / 32) * 12 : ((value - 32) / 31) * 12));
}

export function parseWinampEqf(buffer: ArrayBuffer): WinampEqfPreset[] {
  const bytes = new Uint8Array(buffer);
  const headerBytes = new TextEncoder().encode(HEADER);
  if (bytes.length < headerBytes.length + 4 || headerBytes.some((value, index) => bytes[index] !== value)) {
    throw new Error('Invalid Winamp EQF header.');
  }
  let offset = headerBytes.length;
  if (bytes[offset] !== 26 || bytes[offset + 1] !== 33 || bytes[offset + 2] !== 45 || bytes[offset + 3] !== 45) {
    throw new Error('Invalid Winamp EQF signature.');
  }
  offset += 4;
  if ((bytes.length - offset) % RECORD_SIZE !== 0) {
    throw new Error('The EQF file contains an incomplete preset record.');
  }

  const presets: WinampEqfPreset[] = [];
  while (offset < bytes.length) {
    const nameBytes = bytes.subarray(offset, offset + 257);
    const terminator = nameBytes.indexOf(0);
    const visibleName = nameBytes.subarray(0, terminator < 0 ? nameBytes.length : terminator);
    const name = new TextDecoder('windows-1252').decode(visibleName).trim().slice(0, 32) || `Imported ${presets.length + 1}`;
    offset += 257;
    const values: number[] = [];
    for (let i = 0; i < 11; i += 1) {
      const signed = bytes[offset] > 127 ? bytes[offset] - 256 : bytes[offset];
      values.push(64 - signed);
      offset += 1;
    }
    presets.push({
      name,
      preamp: fromWinampValue(values[10]),
      bands: values.slice(0, BAND_COUNT).map(fromWinampValue),
    });
  }
  return presets;
}

export function createWinampEqf(presets: WinampEqfPreset[]): ArrayBuffer {
  if (!presets.length) throw new Error('At least one EQ preset is required.');
  const header = new TextEncoder().encode(HEADER);
  const bytes: number[] = [...header, 26, 33, 45, 45];
  presets.forEach((preset) => {
    const name = new TextEncoder().encode(preset.name.slice(0, 32));
    const nameBytes = new Uint8Array(257);
    nameBytes.set(name.subarray(0, 257));
    bytes.push(...nameBytes);
    const values = [...preset.bands.slice(0, BAND_COUNT), preset.preamp];
    values.forEach((gain) => {
      const encoded = 64 - toWinampValue(gain);
      bytes.push((encoded + 256) % 256);
    });
  });
  return new Uint8Array(bytes).buffer;
}
