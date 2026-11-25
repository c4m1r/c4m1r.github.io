import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampMilkPreset.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { convertSimpleMilkPreset } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

const basePreset = { baseVals: { zoom: 1, decay: 0.98, warp: 0.5, rot: 0, wave_a: 0 }, init_eqs_str: 'existing_init();', frame_eqs_str: 'existing_frame();', pixel_eqs_str: '', shapes: [], waves: [] };

test('converts scalar MilkDrop values without mutating the base preset', () => {
  const converted = convertSimpleMilkPreset('[preset00]\nzoom=1.25\ndecay=0.91\nrot=-0.2\n', basePreset);
  assert.equal(converted.baseVals.zoom, 1.25); assert.equal(converted.baseVals.decay, 0.91); assert.equal(converted.baseVals.rot, -0.2);
  assert.equal(basePreset.baseVals.zoom, 1); assert.equal(converted.frame_eqs_str, 'existing_frame();');
});
test('accepts case-insensitive scalar keys and boolean values', () => {
  const converted = convertSimpleMilkPreset('[preset00]\nZOOM=2\nWAVE_A=true\n', basePreset);
  assert.equal(converted.baseVals.zoom, 2); assert.equal(converted.baseVals.wave_a, 1);
});
test('rejects EEL code instead of silently dropping it', () => {
  assert.throws(() => convertSimpleMilkPreset('[preset00]\nper_frame_1=zoom=1.2;\n', basePreset), /EEL equations|shader code/i);
  assert.throws(() => convertSimpleMilkPreset('[preset00]\nwave_1_per_point= x=1;\n', basePreset), /EEL equations|shader code/i);
});
test('rejects custom wave, shape and shader sections', () => {
  for (const section of ['wave1', 'shape1', 'warp', 'comp']) assert.throws(() => convertSimpleMilkPreset('[preset00]\nzoom=1.2\n[' + section + ']\nenabled=1\n', basePreset), /custom waves, shapes or shader sections/i);
});
test('rejects missing preset section, empty scalar conversion and oversized files', () => {
  assert.throws(() => convertSimpleMilkPreset('zoom=1.2', basePreset), /preset00/i);
  assert.throws(() => convertSimpleMilkPreset('[preset00]\nunknown_key=1\n', basePreset), /No compatible scalar/i);
  assert.throws(() => convertSimpleMilkPreset('x'.repeat(2 * 1024 * 1024 + 1), basePreset), /2 MB/i);
});
