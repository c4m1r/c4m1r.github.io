import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampArchive.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const archiveApi = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));
const { createWinampArchive, readWinampArchive } = archiveApi;
const encoder = new TextEncoder();

function track(id, src, title = 'Track') {
  return { id, title, artist: 'Test Artist', durationLabel: '03:21', src };
}
function record(overrides = {}) {
  const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5, 6])], { type: 'audio/mpeg' });
  return {
    id: 'local-audio-1', name: 'музыка №1.mp3', type: 'audio/mpeg', size: blob.size,
    lastModified: 1700000000000, title: 'Тест', artist: 'Исполнитель', durationLabel: '00:01',
    addedAt: 1700000000000, blob, ...overrides,
  };
}
async function archiveBytes(playlist, records) {
  return new Uint8Array(await (await createWinampArchive(playlist, records)).arrayBuffer());
}
function findLocalEntry(bytes, entryName) {
  const signature = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  for (let offset = 0; offset + 30 < bytes.length; offset += 1) {
    if (signature.every((value, index) => bytes[offset + index] === value)) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const nameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
      if (name === entryName) return { offset, dataOffset: offset + 30 + nameLength + extraLength };
    }
  }
  throw new Error('ZIP entry not found: ' + entryName);
}

const zipCrcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    table[index] = value >>> 0;
  }
  return table;
})();
function zipCrc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ zipCrcTable[(crc ^ byte) & 255];
  return (crc ^ 0xffffffff) >>> 0;
}
function makeStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = zipCrc32(data);
    const method = entry.method ?? 0;
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true); localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, method, true); localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true); localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    local.set(name, 30); local.set(data, 30 + name.length);
    localParts.push(local);
    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true); centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true); centralView.setUint16(10, method, true);
    centralView.setUint32(16, crc, true); centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true); centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true); central.set(name, 46);
    centralParts.push(central);
    offset += local.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entries.length, true); view.setUint16(10, entries.length, true);
  view.setUint32(12, centralSize, true); view.setUint32(16, offset, true);
  const all = [...localParts, ...centralParts, end];
  const result = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of all) { result.set(part, cursor); cursor += part.length; }
  return result;
}

test('round-trips an empty local library', async () => {
  const archive = await createWinampArchive([], []);
  const restored = await readWinampArchive(archive);
  assert.equal(restored.manifest.tracks.length, 0);
  assert.equal(restored.assets.length, 0);
});

test('preserves playlist order, duplicate local references, remote URLs and Unicode metadata', async () => {
  const local = track('local-entry-1', 'blob:session-only', 'Тестовая композиция');
  const duplicate = { ...local, id: 'local-entry-2', localAssetId: 'local-audio-1' };
  const remote = track('remote-1', 'https://example.com/audio.mp3', 'Remote');
  const restored = await readWinampArchive(await createWinampArchive([
    { ...local, localAssetId: 'local-audio-1' }, remote, duplicate,
  ], [record()]));
  assert.deepEqual(restored.manifest.tracks.map((item) => item.title), ['Тестовая композиция', 'Remote', 'Тестовая композиция']);
  assert.notEqual(restored.manifest.tracks[0].id, restored.manifest.tracks[2].id);
  assert.equal(restored.manifest.tracks[0].assetPath, restored.manifest.tracks[2].assetPath);
  assert.equal(restored.manifest.tracks[1].src, 'https://example.com/audio.mp3');
  assert.equal(restored.assets.length, 1);
  assert.equal(restored.assets[0].name, 'музыка №1.mp3');
  assert.equal(restored.assets[0].blob.size, 6);
});

test('does not export object URLs as portable remote links', async () => {
  const restored = await readWinampArchive(await createWinampArchive([track('session', 'blob:temporary')], []));
  assert.equal(restored.manifest.tracks[0].src, undefined);
  assert.equal(restored.manifest.tracks[0].assetPath, undefined);
});

test('rejects payload bytes with a CRC mismatch', async () => {
  const bytes = await archiveBytes([track('local-audio-1', 'blob:temporary')], [record()]);
  const entry = findLocalEntry(bytes, 'audio/000001.mp3');
  bytes[entry.dataOffset] ^= 0xff;
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /CRC check failed/);
});

test('rejects path traversal in ZIP entry names', async () => {
  const bytes = await archiveBytes([], []);
  const unsafeName = new TextEncoder().encode('../ifest.json');
  const safeName = new TextEncoder().encode('manifest.json');
  assert.equal(unsafeName.length, safeName.length);
  for (let offset = 0; offset + safeName.length <= bytes.length; offset += 1) {
    if (safeName.every((value, index) => bytes[offset + index] === value)) bytes.set(unsafeName, offset);
  }
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /unsafe ZIP entry/i);
});

test('rejects local and central ZIP header disagreement', async () => {
  const bytes = await archiveBytes([], []);
  const entry = findLocalEntry(bytes, 'manifest.json');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(entry.offset + 22, 1, true);
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /headers do not match/i);
});

test('rejects truncated ZIP files', async () => {
  const bytes = await archiveBytes([], []);
  await assert.rejects(() => readWinampArchive(new Blob([bytes.slice(0, -8)])), /end record not found/i);
});

test('rejects invalid local file metadata before export', async () => {
  await assert.rejects(
    () => createWinampArchive([track('local-audio-1', 'blob:temporary')], [record({ type: 'not a mime type' })]),
    /invalid file metadata/i,
  );
});

test('rejects a manifest that exceeds the import safety limit during export', async () => {
  const playlist = Array.from({ length: 5000 }, (_, index) => track('remote-' + index, 'https://example.com/' + index, 'x'.repeat(1000)));
  await assert.rejects(() => createWinampArchive(playlist, []), /manifest exceeds the 4 MB safety limit/i);
});

test('rejects duplicate ZIP entry paths even when the payload is valid', async () => {
  const manifest = JSON.stringify({ format: 'wampack', version: 1, exportedAt: new Date(0).toISOString(), tracks: [] });
  const bytes = makeStoredZip([
    { name: 'manifest.json', data: manifest },
    { name: 'manifest.json', data: manifest },
  ]);
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /duplicate|unsafe ZIP entry/i);
});

test('rejects archive asset paths that disagree with the original filename extension', async () => {
  const payload = Uint8Array.of(1, 2, 3);
  const manifest = JSON.stringify({
    format: 'wampack',
    version: 1,
    exportedAt: new Date(0).toISOString(),
    tracks: [{
      id: 'local-1', title: 'Track', artist: 'Artist', durationLabel: '00:01',
      assetPath: 'audio/000001.mp3', assetName: 'track.wav', assetType: 'audio/mpeg',
      assetLastModified: 0, assetSize: payload.length,
    }],
  });
  const bytes = makeStoredZip([
    { name: 'manifest.json', data: manifest },
    { name: 'audio/000001.mp3', data: payload },
  ]);
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /invalid original audio-file metadata/i);
});

test('rejects unreferenced payload files', async () => {
  const manifest = JSON.stringify({ format: 'wampack', version: 1, exportedAt: new Date(0).toISOString(), tracks: [] });
  const bytes = makeStoredZip([
    { name: 'manifest.json', data: manifest },
    { name: 'audio/000001.mp3', data: Uint8Array.of(1, 2, 3) },
  ]);
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /unreferenced payload/i);
});

test('rejects compressed ZIP methods rather than treating compressed bytes as audio', async () => {
  const manifest = JSON.stringify({ format: 'wampack', version: 1, exportedAt: new Date(0).toISOString(), tracks: [] });
  const bytes = makeStoredZip([{ name: 'manifest.json', data: manifest, method: 8 }]);
  await assert.rejects(() => readWinampArchive(new Blob([bytes])), /unsupported, encrypted or unsafe ZIP entry/i);
});
