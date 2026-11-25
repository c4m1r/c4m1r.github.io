declare module 'butterchurn' {
  export interface ButterchurnVisualizer {
    connectAudio(audioNode: AudioNode): void;
    disconnectAudio(audioNode: AudioNode): void;
    loadPreset(preset: ButterchurnPreset, blendTime: number): Promise<void> | void;
    setRendererSize(width: number, height: number, options?: { pixelRatio?: number; textureRatio?: number }): void;
    render(): void;
  }

  export interface ButterchurnPreset {
    [key: string]: unknown;
  }

  const butterchurn: {
    createVisualizer(
      audioContext: AudioContext,
      canvas: HTMLCanvasElement,
      options: {
        width: number;
        height: number;
        pixelRatio?: number;
        textureRatio?: number;
        meshWidth?: number;
        meshHeight?: number;
      },
    ): ButterchurnVisualizer;
  };

  export default butterchurn;
}

declare module 'butterchurn-presets' {
  import type { ButterchurnPreset } from 'butterchurn';

  const butterchurnPresets: {
    getPresets(): Record<string, ButterchurnPreset>;
  };

  export default butterchurnPresets;
}
