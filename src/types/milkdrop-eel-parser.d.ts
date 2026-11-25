declare module 'milkdrop-eel-parser' {
  interface MilkdropBasicPresetResult {
    perFrameInitEQs?: string | null;
    perFrameEQs?: string | null;
    perPixelEQs?: string | null;
  }
  interface MilkdropWaveResult {
    perFrameInitEQs?: string | null;
    perFrameEQs?: string | null;
    perPointEQs?: string | null;
  }
  interface MilkdropShapeResult {
    perFrameInitEQs?: string | null;
    perFrameEQs?: string | null;
  }
  interface MilkdropEelParser {
    convert_basic_preset(version: number, init: string, frame: string, pixel: string): MilkdropBasicPresetResult;
    make_wave_map(version: number, input: { init_eqs_str: string; frame_eqs_str: string; point_eqs_str: string }): MilkdropWaveResult;
    make_shape_map(version: number, input: { init_eqs_str: string; frame_eqs_str: string }): MilkdropShapeResult;
  }
  const parser: MilkdropEelParser;
  export default parser;
}


declare module 'hlslparser-js' {
  export function convertHLSLShader(source: string, entryName: string, shaderType: 'fs' | 'vs'): Promise<string>;
}

declare module 'milkdrop-preset-utils' {
  export function prepareShader(source: string): string;
  export function processUnOptimizedShader(source: string): string;
}
