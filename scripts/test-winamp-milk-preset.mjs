import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampMilkPreset.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { convertMilkPreset, convertSimpleMilkPreset } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

const basePreset = {
  baseVals: { zoom: 1, decay: 0.98, gammaadj: 2, wave_mode: 0, wave_a: 0.8, echo_zoom: 2, echo_alpha: 0, echo_orient: 0, wrap: 1, red_blue: 0 },
  init_eqs_eel: '', frame_eqs_eel: '', pixel_eqs_eel: '',
  shapes: Array.from({ length: 4 }, () => ({ baseVals: { enabled: 0, sides: 4, x: 0.5, y: 0.5 }, init_eqs_eel: '', frame_eqs_eel: '' })),
  waves: Array.from({ length: 4 }, () => ({ baseVals: { enabled: 0, samples: 512, sep: 0, scaling: 1, smoothing: 0.5, r: 1, g: 1, b: 1, a: 1 }, init_eqs_eel: '', frame_eqs_eel: '', point_eqs_eel: '' })),
};

test('converts MilkDrop scalar aliases without mutating Butterchurn base preset', () => {
  const result = convertMilkPreset('[preset00]\nfDecay=0.91\nfZoom=1.25\nnWaveMode=7\nfVideoEchoZoom=1.4\n', basePreset);
  assert.equal(result.preset.baseVals.decay, 0.91);
  assert.equal(result.preset.baseVals.zoom, 1.25);
  assert.equal(result.preset.baseVals.wave_mode, 7);
  assert.equal(result.preset.baseVals.echo_zoom, 1.4);
  assert.equal(basePreset.baseVals.zoom, 1);
  assert.equal(result.warnings.length, 0);
});

test('preserves EEL2 init, frame and per-pixel source for Butterchurn WASM', () => {
  const result = convertMilkPreset('[preset00]\nper_frame_init_2=q1=0.5;\nper_frame_init_1=q2=1;\nper_frame_2=zoom=1+bass*0.02;\nper_frame_1=rot=sin(time);\nper_pixel_1=warp=rad*0.2;\n', basePreset);
  assert.equal(result.preset.init_eqs_eel, 'q2=1;\nq1=0.5;');
  assert.equal(result.preset.frame_eqs_eel, 'rot=sin(time);\nzoom=1+bass*0.02;');
  assert.equal(result.preset.pixel_eqs_eel, 'warp=rad*0.2;');
  assert.equal(result.converted.frameEquations, 4);
  assert.equal(result.converted.pixelEquations, 1);
});

test('converts custom wave fields and all three EEL2 equation stages', () => {
  const result = convertMilkPreset('[preset00]\nwave_1_enabled=1\nwave_1_samples=256\nwave_1_init_1=q1=0;\nwave_1_per_frame1=x=0.5;\nwave_1_per_point1=y=sample;\n', basePreset);
  const wave = result.preset.waves[0];
  assert.equal(wave.baseVals.enabled, 1);
  assert.equal(wave.baseVals.samples, 256);
  assert.equal(wave.init_eqs_eel, 'q1=0;');
  assert.equal(wave.frame_eqs_eel, 'x=0.5;');
  assert.equal(wave.point_eqs_eel, 'y=sample;');
  assert.equal(result.converted.customWaves, 1);
});

test('converts custom shape fields and init/frame equations', () => {
  const result = convertMilkPreset('[preset00]\nshape_2_enabled=1\nshape_2_sides=8\nshape_2_init_1=q1=0;\nshape_2_per_frame1=x=0.4;\n', basePreset);
  const shape = result.preset.shapes[1];
  assert.equal(shape.baseVals.enabled, 1);
  assert.equal(shape.baseVals.sides, 8);
  assert.equal(shape.init_eqs_eel, 'q1=0;');
  assert.equal(shape.frame_eqs_eel, 'x=0.4;');
  assert.equal(result.converted.customShapes, 1);
});

test('reports MilkDrop 2 shaders and unmapped fields instead of silently discarding them', () => {
  const result = convertMilkPreset('[preset00]\nzoom=1.2\nwarp_1=shader_body\nunknown_future_field=1\n', basePreset);
  assert.ok(result.warnings.some((warning) => /shaders are not executed/i.test(warning)));
  assert.ok(result.warnings.some((warning) => /Unmapped MilkDrop field/i.test(warning)));
  assert.equal(result.preset.baseVals.zoom, 1.2);
});

test('warns when only scalar parameters can be converted and preserves scalar-only API', () => {
  const result = convertMilkPreset('[preset00]\nzoom=1.2\n', basePreset);
  assert.ok(result.warnings.some((warning) => /no EEL equations/i.test(warning)));
  assert.equal(convertSimpleMilkPreset('[preset00]\nzoom=1.4\n', basePreset).baseVals.zoom, 1.4);
});

test('rejects missing preset section, oversized files and incomplete Butterchurn base presets', () => {
  assert.throws(() => convertMilkPreset('zoom=1.2', basePreset), /preset00/i);
  assert.throws(() => convertMilkPreset('x'.repeat(2 * 1024 * 1024 + 1), basePreset), /2 MB/i);
  assert.throws(() => convertMilkPreset('[preset00]\nzoom=1\n', { baseVals: {} }), /incomplete/i);
});
