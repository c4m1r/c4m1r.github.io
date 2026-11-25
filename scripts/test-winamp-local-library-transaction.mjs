import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampLocalLibrary.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\\n')).join('\\n'));

let expectedWrites = 0;
let failAt = Number.POSITIVE_INFINITY;
let committed = [];
globalThis.indexedDB = {
  open() {
    const database = {
      objectStoreNames: { contains: () => false },
      createObjectStore() { return { createIndex() {} }; },
      transaction() {
        const staged = [];
        const tx = {
          error: new Error('QuotaExceededError'),
          oncomplete: null,
          onerror: null,
          onabort: null,
          objectStore() {
            return {
              add(record) {
                if (staged.length + 1 === failAt) throw new Error('QuotaExceededError');
                staged.push(record);
                if (staged.length === expectedWrites) {
                  queueMicrotask(() => {
                    committed.push(...staged);
                    tx.oncomplete?.();
                  });
                }
              },
            };
          },
          abort() {
            staged.length = 0;
            queueMicrotask(() => tx.onabort?.());
          },
        };
        return tx;
      },
      close() {},
    };
    const request = { result: database, onupgradeneeded: null, onsuccess: null, onerror: null, onblocked: null };
    queueMicrotask(() => {
      request.onupgradeneeded?.();
      request.onsuccess?.();
    });
    return request;
  },
};

const { importWinampLocalAudioAssets } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64')
);
const assets = [
  { path: 'audio/000001.mp3', name: 'one.mp3', type: 'audio/mpeg', lastModified: 1, blob: new Blob(['one']) },
  { path: 'audio/000002.mp3', name: 'two.mp3', type: 'audio/mpeg', lastModified: 2, blob: new Blob(['two']) },
];
const metadata = new Map();

test('aborts the whole IndexedDB import when a later asset write fails', async () => {
  expectedWrites = 2;
  failAt = 2;
  committed = [];
  await assert.rejects(() => importWinampLocalAudioAssets(assets, metadata), /QuotaExceededError/);
  assert.equal(committed.length, 0, 'no partially imported records may be committed');
});

test('commits all imported assets together after the transaction completes', async () => {
  expectedWrites = 2;
  failAt = Number.POSITIVE_INFINITY;
  committed = [];
  const imported = await importWinampLocalAudioAssets(assets, metadata);
  assert.equal(imported.length, 2);
  assert.equal(committed.length, 2);
  assert.deepEqual(imported.map(({ path }) => path), assets.map(({ path }) => path));
});
