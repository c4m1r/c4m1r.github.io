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
let expectedDeletes = 0;
let failAt = Number.POSITIVE_INFINITY;
let failureMode = 'async';
let committed = [];
let abortEvents = 0;
let abortCalls = 0;
let completeEvents = 0;

globalThis.indexedDB = {
  open() {
    const database = {
      objectStoreNames: { contains: () => false },
      createObjectStore() { return { createIndex() {} }; },
      transaction() {
        const staged = [];
        const stagedDeletes = [];
        let finished = false;
        const tx = {
          error: null,
          oncomplete: null,
          onerror: null,
          onabort: null,
          objectStore() {
            return {
              delete(id) {
                stagedDeletes.push(id);
                if (stagedDeletes.length === expectedDeletes) {
                  queueMicrotask(() => {
                    if (finished) return;
                    finished = true;
                    committed = committed.filter((record) => !stagedDeletes.includes(record.id));
                    completeEvents += 1;
                    tx.oncomplete?.();
                  });
                }
              },
              add(record) {
                const nextWrite = staged.length + 1;
                if (nextWrite === failAt && failureMode === 'sync') {
                  throw new Error('Synchronous quota failure');
                }
                staged.push(record);
                if (nextWrite === failAt && failureMode === 'async') {
                  queueMicrotask(() => {
                    if (finished) return;
                    finished = true;
                    tx.error = new Error('QuotaExceededError');
                    staged.length = 0;
                    tx.onerror?.();
                    tx.onabort?.();
                    abortEvents += 1;
                  });
                } else if (staged.length === expectedWrites && failAt > expectedWrites) {
                  queueMicrotask(() => {
                    if (finished) return;
                    finished = true;
                    committed.push(...staged);
                    completeEvents += 1;
                    tx.oncomplete?.();
                  });
                }
              },
            };
          },
          abort() {
            abortCalls += 1;
            if (finished) throw new Error('Transaction is already finished');
            finished = true;
            staged.length = 0;
            queueMicrotask(() => {
              abortEvents += 1;
              tx.onabort?.();
            });
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

test('aborts the entire IndexedDB import after an asynchronous quota failure', async () => {
  expectedWrites = 2;
  failAt = 2;
  failureMode = 'async';
  committed = [];
  abortEvents = 0;
  abortCalls = 0;
  completeEvents = 0;

  await assert.rejects(() => importWinampLocalAudioAssets(assets, metadata), /QuotaExceededError/);
  assert.equal(committed.length, 0, 'no partially imported records may be committed');
  assert.equal(abortEvents, 1, 'the IndexedDB transaction must emit abort');
  assert.equal(completeEvents, 0, 'the failed transaction must never complete');
});

test('aborts the entire IndexedDB import after a synchronous object-store failure', async () => {
  expectedWrites = 2;
  failAt = 2;
  failureMode = 'sync';
  committed = [];
  abortEvents = 0;
  abortCalls = 0;
  completeEvents = 0;

  await assert.rejects(() => importWinampLocalAudioAssets(assets, metadata), /Synchronous quota failure/);
  assert.equal(committed.length, 0);
  assert.equal(abortEvents, 1);
  assert.equal(completeEvents, 0);
  assert.equal(abortCalls, 1);
});

test('commits all imported assets together only after transaction completion', async () => {
  expectedWrites = 2;
  failAt = Number.POSITIVE_INFINITY;
  failureMode = 'async';
  committed = [];
  abortEvents = 0;
  abortCalls = 0;
  completeEvents = 0;

  const imported = await importWinampLocalAudioAssets(assets, metadata);
  assert.equal(imported.length, 2);
  assert.equal(committed.length, 2);
  assert.equal(completeEvents, 1);
  assert.equal(abortEvents, 0);
  assert.deepEqual(imported.map(({ path }) => path), assets.map(({ path }) => path));
});

test('rolls back committed local records and revokes every temporary object URL', async () => {
  expectedWrites = 2;
  expectedDeletes = 2;
  failAt = Number.POSITIVE_INFINITY;
  failureMode = 'async';
  committed = [];
  abortEvents = 0;
  abortCalls = 0;
  completeEvents = 0;
  const imported = await importWinampLocalAudioAssets(assets, metadata);
  assert.equal(committed.length, 2);

  const revoked = [];
  const errors = await rollbackWinampLocalAudioImport(
    imported.map(({ record }) => record.id),
    ['blob:temporary-one', 'blob:temporary-two'],
    (url) => revoked.push(url),
  );

  assert.deepEqual(errors, []);
  assert.equal(committed.length, 0, 'committed records must be deleted after playlist publication fails');
  assert.deepEqual(revoked, ['blob:temporary-one', 'blob:temporary-two']);
  assert.equal(completeEvents, 2, 'the insert and rollback transactions must both complete');
});
