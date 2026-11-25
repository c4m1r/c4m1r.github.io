import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import milkdropParser from 'milkdrop-eel-parser';
import hlslParserModule from 'hlslparser-js';
import presetUtilsModule from 'milkdrop-preset-utils';

const source = await readFile(new URL('../src/system/audio/winampMilkPreset.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { convertMilkPreset, convertSimpleMilkPreset } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

const basePreset = {
  baseVals: { zoom: 9, decay: 0.1, gammaadj: 8, wave_mode: 6, wave_a: 0.1, echo_zoom: 8, echo_alpha: 1, echo_orient: 3, wrap: 0, red_blue: 1, seed_only: 123 },
  init_eqs_str: 'seed-init();', frame_eqs_str: 'seed-frame();', pixel_eqs_str: 'seed-pixel();',
  shapes: Array.from({ length: 4 }, () => ({ baseVals: { enabled: 0, sides: 4, x: 0.5, y: 0.5 }, init_eqs_str: 'seed-shape-init();', frame_eqs_str: 'seed-shape-frame();' })),
  waves: Array.from({ length: 4 }, () => ({ baseVals: { enabled: 0, samples: 512, sep: 0, scaling: 1, smoothing: 0.5, r: 1, g: 1, b: 1, a: 1 }, init_eqs_str: 'seed-wave-init();', frame_eqs_str: 'seed-wave-frame();', point_eqs_str: 'seed-wave-point();' })),
};
const fakeShaderConverter = async (source, stage) => {
  if (!source.includes('shader_body') || !source.includes('{') || !source.includes('}')) {
    throw new Error('fixture shader is malformed');
  }
  return `shader_body { ret = vec3(${stage === 'warp' ? '0.5' : '1.0'}); }`;
};
const convert = (text) => convertMilkPreset(text, basePreset, milkdropParser, fakeShaderConverter);

test('converts MilkDrop scalar aliases without mutating or inheriting Butterchurn seed values', async () => {
  const result = await convert('[preset00]\nfDecay=0.91\nfZoom=1.25\nnWaveMode=7\nfVideoEchoZoom=1.4\nfRating=4.5\nfWaveParam=0.7\nbMaximizeWaveColor=1\n');
  assert.equal(result.preset.baseVals.decay, 0.91);
  assert.equal(result.preset.baseVals.zoom, 1.25);
  assert.equal(result.preset.baseVals.wave_mode, 7);
  assert.equal(result.preset.baseVals.echo_zoom, 1.4);
  assert.equal(result.preset.baseVals.rating, 4.5);
  assert.equal(result.preset.baseVals.wave_mystery, 0.7);
  assert.equal(result.preset.baseVals.wave_brighten, 1);
  assert.equal(result.preset.baseVals.seed_only, undefined);
  assert.equal(basePreset.baseVals.zoom, 9);
  assert.equal(result.preset.init_eqs_str, '');
  assert.equal(result.preset.shapes[3].init_eqs_str, '');
  assert.equal(result.preset.waves[3].point_eqs_str, '');
  assert.ok(result.preset.warp.includes('shader_body'));
  assert.ok(result.preset.comp.includes('shader_body'));
  assert.deepEqual(result.warnings, ['This preset contains no EEL equations or custom wave/shape programs; only mapped scalar parameters were imported.']);
});

test('transpiles EEL2 init, frame and per-pixel equations into Butterchurn JavaScript', async () => {
  const result = await convert('[preset00]\nper_frame_init_2=q1=0.5;\nper_frame_init_1=q2=1;\nper_frame_2=zoom=1+bass*0.02;\nper_frame_1=rot=sin(time);\nper_pixel_1=warp=rad*0.2;\n');
  assert.match(result.preset.init_eqs_str, /a\['q2'\]\s*=\s*1/);
  assert.match(result.preset.init_eqs_str, /a\['q1'\]\s*=\s*0\.5/);
  assert.match(result.preset.frame_eqs_str, /Math\.sin/);
  assert.match(result.preset.frame_eqs_str, /a\['zoom'\]/);
  assert.match(result.preset.pixel_eqs_str, /a\['warp'\]/);
  assert.equal('init_eqs_eel' in result.preset, false);
  assert.equal(result.converted.frameEquations, 4);
  assert.equal(result.converted.pixelEquations, 1);
});

test('transpiles custom wave init/frame/per-point EEL and legacy wavecode fields', async () => {
  const result = await convert('[preset00]\nwave_0_enabled=1\nwave_0_samples=256\nwavecode_0_bDrawThick=1\nwave_0_init_1=q1=0;\nwave_0_per_frame1=x=0.5;\nwave_0_per_point1=y=sample;\n');
  const wave = result.preset.waves[0];
  assert.equal(wave.baseVals.enabled, 1);
  assert.equal(wave.baseVals.samples, 256);
  assert.equal(wave.baseVals.thick, 1);
  assert.match(wave.init_eqs_str, /a\['q1'\]\s*=\s*0/);
  assert.match(wave.frame_eqs_str, /a\['x'\]\s*=\s*0\.5/);
  assert.match(wave.point_eqs_str, /a\['y'\]/);
  assert.equal(result.converted.customWaves, 1);
});

test('transpiles custom shape init/frame EEL and legacy shapecode fields', async () => {
  const result = await convert('[preset00]\nshape_1_enabled=1\nshape_1_sides=8\nshapecode_0_bAdditive=1\nshape_1_init_1=q1=0;\nshape_1_per_frame1=x=0.4;\n');
  const shape = result.preset.shapes[0];
  assert.equal(shape.baseVals.enabled, 1);
  assert.equal(shape.baseVals.sides, 8);
  assert.equal(shape.baseVals.additive, 1);
  assert.match(shape.init_eqs_str, /a\['q1'\]\s*=\s*0/);
  assert.match(shape.frame_eqs_str, /a\['x'\]\s*=\s*0\.4/);
  assert.equal(result.converted.customShapes, 1);
});

test('reports malformed MilkDrop 2 shaders and unmapped fields instead of silently discarding them', async () => {
  const result = await convert('[preset00]\nzoom=1.2\nwarp_1=shader_body\nunknown_future_field=1\n');
  assert.ok(result.warnings.some((warning) => /warp shader could not be translated/i.test(warning)));
  assert.ok(result.warnings.some((warning) => /Unmapped MilkDrop field/i.test(warning)));
  assert.equal(result.preset.baseVals.zoom, 1.2);
});


test('translates numbered MilkDrop 2 warp and composite HLSL shader blocks', async () => {
  const result = await convert('[preset00]\nwarp_2=\x60{\nwarp_1=\x60shader_body\nwarp_3=\x60ret = tex2D(sampler_main, uv).rgb;\nwarp_4=\x60}\ncomp_1=\x60shader_body\ncomp_2=\x60{\ncomp_3=\x60ret = tex2D(sampler_main, uv).rgb;\ncomp_4=\x60}\n');
  assert.match(result.preset.warp, /vec3\(0\.5\)/);
  assert.match(result.preset.comp, /vec3\(1\.0\)/);
  assert.equal(result.converted.shaderStages, 2);
  assert.equal(result.warnings.some((warning) => /could not be translated/i.test(warning)), false);
});


test('runs the upstream HLSL parser against a minimal real MilkDrop shader', async () => {
  const actualShaderConverter = async (source) => {
    const hlslParser = hlslParserModule.default ?? hlslParserModule;
    const presetUtils = presetUtilsModule.default ?? presetUtilsModule;
    const entryName = 'milkdrop_shader_entry';
    const prepared = presetUtils.prepareShader(source).replace('float4 shader_body (', `float4 ${entryName} (`);
    const translated = await hlslParser.convertHLSLShader(prepared, entryName, 'fs');
    assert.equal(/^(parsing failed|code generation failed)$/i.test(translated.trim()), false);
    return presetUtils.processUnOptimizedShader(translated);
  };
  const result = await convertMilkPreset(
    '[preset00]\nwarp_1=\x60shader_body\nwarp_2=\x60{\nwarp_3=\x60ret = float3(0.1, 0.2, 0.3);\nwarp_4=\x60}\n',
    basePreset,
    milkdropParser,
    actualShaderConverter,
  );
  assert.match(result.preset.warp, /shader_body\s*\{/);
  assert.equal(result.converted.shaderStages, 1);
  assert.equal(result.warnings.some((warning) => /warp shader could not be translated/i.test(warning)), false);
  assert.equal(result.warnings.some((warning) => /only mapped scalar parameters/i.test(warning)), false);
});

test('warns when only scalar parameters can be converted and keeps the async compatibility helper', async () => {
  const result = await convert('[preset00]\nzoom=1.2\n');
  assert.ok(result.warnings.some((warning) => /no EEL equations/i.test(warning)));
  assert.equal((await convertSimpleMilkPreset('[preset00]\nzoom=1.4\n', basePreset, milkdropParser)).baseVals.zoom, 1.4);
});

test('rejects missing preset section, oversized files and incomplete Butterchurn base presets', async () => {
  await assert.rejects(() => convert('zoom=1.2'), /preset00/i);
  await assert.rejects(() => convert('x'.repeat(2 * 1024 * 1024 + 1)), /2 MB/i);
  await assert.rejects(() => convertMilkPreset('[preset00]\nzoom=1\n', { baseVals: {} }, milkdropParser), /incomplete/i);
});

test('counts enabled custom wave/shape slots even when they contain no EEL blocks', async () => {
  const result = await convert('[preset00]\nwave_0_enabled=1\nshape_1_enabled=1\n');
  assert.equal(result.converted.customWaves, 1);
  assert.equal(result.converted.customShapes, 1);
  assert.equal(result.warnings.length, 0);
});
