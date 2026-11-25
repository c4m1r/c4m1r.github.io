import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampMediaQueue.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\\n')).join('\\n'));
const api = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));
const { normalizeWinampMediaOrder, moveWinampMediaOrder, moveWinampMediaKey, readWinampMediaOrder, writeWinampMediaOrder } = api;

test('normalizes persisted order, drops stale/duplicate keys and appends new media', () => {
  assert.deepEqual(normalizeWinampMediaOrder(['video:x', 'audio:b', 'audio:b', 'removed'], ['audio:a', 'audio:b', 'video:x']), ['video:x', 'audio:b', 'audio:a']);
});
test('moves a selected mixed item in either direction without mutating source', () => {
  const keys = ['audio:a', 'video:x', 'audio:b'];
  assert.deepEqual(moveWinampMediaOrder(keys, 1, -1), ['video:x', 'audio:a', 'audio:b']);
  assert.deepEqual(moveWinampMediaOrder(keys, 1, 1), ['audio:a', 'audio:b', 'video:x']);
  assert.deepEqual(keys, ['audio:a', 'video:x', 'audio:b']);
});
test('keeps out-of-range moves unchanged', () => {
  const keys = ['a', 'b'];
  assert.equal(moveWinampMediaOrder(keys, 0, -1), keys);
  assert.equal(moveWinampMediaOrder(keys, 1, 1), keys);
});
test('reads and writes through storage and recovers from invalid persisted JSON', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(writeWinampMediaOrder(['audio:a', 'video:x'], storage), true);
  assert.deepEqual(readWinampMediaOrder(['video:x', 'audio:a'], storage), ['audio:a', 'video:x']);
  values.set('webos.winamp.mixed-media-order.v1', '{bad');
  assert.deepEqual(readWinampMediaOrder(['audio:a'], storage), ['audio:a']);
});
test('handles unavailable or throwing browser storage', () => {
  const storage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
  assert.deepEqual(readWinampMediaOrder(['audio:a'], storage), ['audio:a']);
  assert.equal(writeWinampMediaOrder(['audio:a'], storage), false);
});

test('moves a mixed audio/video queue item directly to a drop target', () => {
  const keys = ['audio:a', 'video:x', 'audio:b', 'video:y'];
  assert.deepEqual(moveWinampMediaKey(keys, 0, 3), ['video:x', 'audio:b', 'video:y', 'audio:a']);
  assert.deepEqual(moveWinampMediaKey(keys, 3, 1), ['audio:a', 'video:y', 'video:x', 'audio:b']);
  assert.deepEqual(keys, ['audio:a', 'video:x', 'audio:b', 'video:y']);
  assert.equal(moveWinampMediaKey(keys, -1, 2), keys);
  assert.equal(moveWinampMediaKey(keys, 0, 9), keys);
});
