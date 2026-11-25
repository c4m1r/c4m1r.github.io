import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampM3u.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { createM3uPlaylist, parseM3uPlaylist } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

test('parses BOM-prefixed extended M3U with Unicode metadata and fractional duration', () => {
  const parsed = parseM3uPlaylist('\uFEFF#EXTM3U\r\n#EXTINF:125.9,Исполнитель - Трек, часть 2\r\nhttps://example.com/music%20file.mp3\r\n');
  assert.equal(parsed.skippedEntries, 0);
  assert.equal(parsed.tracks.length, 1);
  assert.equal(parsed.tracks[0].artist, 'Исполнитель');
  assert.equal(parsed.tracks[0].title, 'Трек, часть 2');
  assert.equal(parsed.tracks[0].durationLabel, '02:05');
  assert.equal(parsed.tracks[0].src, 'https://example.com/music%20file.mp3');
});

test('skips relative paths and transient or unsupported URL schemes', () => {
  const parsed = parseM3uPlaylist([
    '#EXTM3U',
    '#EXTINF:60,Artist - Relative',
    '../relative.mp3',
    'blob:session-only',
    'file:///music/local.mp3',
    'ftp://example.com/audio.mp3',
    'https://example.com/valid.mp3',
  ].join('\n'));
  assert.equal(parsed.tracks.length, 1);
  assert.equal(parsed.skippedEntries, 4);
  assert.equal(parsed.tracks[0].title, 'valid.mp3');
});

test('rejects HLS manifests instead of treating segments as playlist tracks', () => {
  assert.throws(() => parseM3uPlaylist('#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:10,\nsegment.ts'), /HLS streaming manifests are not supported/i);
});

test('exports only HTTP(S) tracks and sanitizes metadata line breaks', () => {
  const result = createM3uPlaylist([
    { id: 'remote', title: 'Title\ncontinued', artist: 'Artist\rName', durationLabel: '03:21', src: 'https://example.com/song.mp3?x=1' },
    { id: 'local', title: 'Local', artist: 'Local artist', durationLabel: '00:10', src: 'blob:temporary' },
    { id: 'relative', title: 'Relative', artist: 'Artist', durationLabel: '00:10', src: '../relative.mp3' },
  ]);
  assert.equal(result.skippedEntries, 2);
  assert.equal(result.content, '#EXTM3U\n#EXTINF:201,Artist Name - Title continued\nhttps://example.com/song.mp3?x=1\n');
  const roundTrip = parseM3uPlaylist(result.content);
  assert.equal(roundTrip.tracks.length, 1);
  assert.equal(roundTrip.tracks[0].artist, 'Artist Name');
  assert.equal(roundTrip.tracks[0].title, 'Title continued');
  assert.equal(roundTrip.tracks[0].durationLabel, '03:21');
});
