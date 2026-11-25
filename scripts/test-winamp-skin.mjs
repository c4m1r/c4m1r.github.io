import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampSkin.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { parseWinampSkinArchive } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

const encoder = new TextEncoder();
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    table[index] = value >>> 0;
  }
  return table;
})();
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
  return (crc ^ 0xffffffff) >>> 0;
}
function u16(view, offset, value) { view.setUint16(offset, value, true); }
function u32(view, offset, value) { view.setUint32(offset, value, true); }
function zipStore(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = entry.data instanceof Uint8Array ? entry.data : encoder.encode(entry.data);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    u32(localView, 0, 0x04034b50); u16(localView, 4, 20); u16(localView, 6, 0x0800);
    u16(localView, 8, 0); u32(localView, 14, crc); u32(localView, 18, data.length); u32(localView, 22, data.length);
    u16(localView, 26, name.length); u16(localView, 28, 0);
    local.set(name, 30); local.set(data, 30 + name.length);
    localParts.push(local);
    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    u32(centralView, 0, 0x02014b50); u16(centralView, 4, 20); u16(centralView, 6, 20);
    u16(centralView, 8, 0x0800); u16(centralView, 10, 0);
    u32(centralView, 16, crc); u32(centralView, 20, data.length); u32(centralView, 24, data.length);
    u16(centralView, 28, name.length); u16(centralView, 30, 0); u16(centralView, 32, 0);
    u16(centralView, 34, 0); u16(centralView, 36, 0); u32(centralView, 38, 0); u32(centralView, 42, offset);
    central.set(name, 46); centralParts.push(central);
    offset += local.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  u32(view, 0, 0x06054b50); u16(view, 4, 0); u16(view, 6, 0);
  u16(view, 8, entries.length); u16(view, 10, entries.length);
  u32(view, 12, centralSize); u32(view, 16, offset); u16(view, 20, 0);
  return new Uint8Array([...localParts, ...centralParts, end].reduce((all, part) => {
    const next = new Uint8Array(all.length + part.length);
    next.set(all); next.set(part, all.length); return next;
  }, new Uint8Array()));
}
function localEntry(bytes, name) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 0; offset + 30 < bytes.length; offset += 1) {
    if (view.getUint32(offset, true) !== 0x04034b50) continue;
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const decoded = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    if (decoded === name) return offset + 30 + nameLength + extraLength;
  }
  throw new Error('Entry not found: ' + name);
}
const baseEntries = () => [
  { name: 'skins/SKIN/MAIN.BMP', data: Uint8Array.of(1, 2, 3, 4) },
  { name: 'skins/SKIN/PLEDIT.TXT', data: '[Text]\nNormal=#11AA22\nCurrent=#FFFFFF\nNormalBG=#000000\nSelectedBG=#0000FF\nFont=Tahoma' },
  { name: 'skins/SKIN/VISCOLOR.TXT', data: '1,2,3\n4,5,6' },
  { name: 'skins/SKIN/REGION.TXT', data: '[Normal]\nNumPoints=1\nPointList=0,0,275,0,275,116' },
];

test('parses nested, case-insensitive .wsz assets and optional configuration', async () => {
  const archive = await parseWinampSkinArchive(new Blob([zipStore(baseEntries())]), 'classic.wsz');
  assert.equal(archive.fileName, 'classic.wsz');
  assert.equal(archive.assets.size, 4);
  assert.equal(archive.playlistStyle.normal, '#11AA22');
  assert.equal(archive.playlistStyle.font, 'Tahoma');
  assert.equal(archive.visualizerColors[0], 'rgb(1,2,3)');
  assert.match(archive.regionText, /PointList=0,0,275,0,275,116/);
});

test('skips a corrupt optional sheet while keeping a valid Main sheet', async () => {
  const bytes = zipStore([...baseEntries(), { name: 'skins/SKIN/TITLEBAR.BMP', data: Uint8Array.of(9, 8, 7, 6) }]);
  bytes[localEntry(bytes, 'skins/SKIN/TITLEBAR.BMP')] ^= 0xff;
  const archive = await parseWinampSkinArchive(new Blob([bytes]));
  assert.equal(archive.assets.size, 4);
  assert.equal([...archive.assets.keys()].some((name) => name.toLowerCase().endsWith('titlebar.bmp')), false);
});

test('rejects a corrupt required Main sheet', async () => {
  const bytes = zipStore(baseEntries());
  bytes[localEntry(bytes, 'skins/SKIN/MAIN.BMP')] ^= 0xff;
  await assert.rejects(() => parseWinampSkinArchive(new Blob([bytes])), /required main\.bmp/i);
});

test('rejects archives without a Main sheet', async () => {
  await assert.rejects(() => parseWinampSkinArchive(new Blob([zipStore([
    { name: 'skins/SKIN/PLEDIT.TXT', data: '[Text]\nNormal=#00FF00' },
  ])])), /required main\.bmp/i);
});

test('rejects traversal paths before extracting skin data', async () => {
  await assert.rejects(() => parseWinampSkinArchive(new Blob([zipStore([
    { name: '../MAIN.BMP', data: Uint8Array.of(1, 2, 3) },
  ])])), /unsafe path/i);
});

test('rejects truncated .wsz ZIP data', async () => {
  const bytes = zipStore(baseEntries());
  await assert.rejects(() => parseWinampSkinArchive(new Blob([bytes.slice(0, -10)])), /ZIP directory not found|malformed ZIP end record/i);
});
