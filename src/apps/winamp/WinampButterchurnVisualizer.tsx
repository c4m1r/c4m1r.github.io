import { useEffect, useRef, useState } from 'react';
import { winampController } from '../../system/audio/winampController';
import { convertSimpleMilkPreset } from '../../system/audio/winampMilkPreset';
type ButterchurnPreset = Record<string, unknown>;

interface ButterchurnVisualizer {
  connectAudio(audioNode: AudioNode): void;
  disconnectAudio(audioNode: AudioNode): void;
  loadPreset(preset: ButterchurnPreset, blendTime: number): Promise<void> | void;
  setRendererSize(width: number, height: number, options?: { pixelRatio?: number; textureRatio?: number }): void;
  render(): void;
}

interface WinampButterchurnVisualizerProps {
  presetIndex: number;
}

interface ButterchurnRuntime {
  visualizer: ButterchurnVisualizer;
  audioNode: AudioNode;
  presetNames: string[];
  presets: Record<string, ButterchurnPreset>;
}

export default function WinampButterchurnVisualizer({ presetIndex }: WinampButterchurnVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const presetFileRef = useRef<HTMLInputElement | null>(null);
  const runtimeRef = useRef<ButterchurnRuntime | null>(null);
  const presetIndexRef = useRef(presetIndex);
  const [status, setStatus] = useState('LOADING MILKDROP ENGINE…');
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    presetIndexRef.current = presetIndex;
  }, [presetIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let visualizer: ButterchurnVisualizer | null = null;
    let connectedNode: AudioNode | null = null;
    let webglContext: WebGL2RenderingContext | null = null;
    let webglAttempted = false;
    let usingWindowResizeListener = false;

    const resize = () => {
      if (!visualizer || !canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      try {
        visualizer.setRendererSize(width, height, { pixelRatio, textureRatio: 1 });
      } catch (error) {
        console.warn('Butterchurn resize failed:', error);
      }
    };

    const stopRenderer = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopRenderer();
      else startRenderer();
    };

    const handleWebGLContextLost = (event: Event) => {
      event.preventDefault();
      stopRenderer();
      cleanup();
      if (!disposed) setStatus('WEBGL CONTEXT LOST — REOPEN MILKDROP TO RETRY');
    };

    const startRenderer = () => {
      if (disposed || !visualizer || animationFrame || document.visibilityState === 'hidden') return;
      const draw = () => {
        animationFrame = 0;
        if (disposed || !visualizer || document.visibilityState === 'hidden') return;
        try {
          visualizer.render();
          animationFrame = requestAnimationFrame(draw);
        } catch (error) {
          stopRenderer();
          console.error('Butterchurn render stopped:', error);
          if (!disposed) setStatus('MILKDROP RENDERER STOPPED');
        }
      };
      animationFrame = requestAnimationFrame(draw);
    };

    const cleanup = () => {
      stopRenderer();
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (usingWindowResizeListener) {
        window.removeEventListener('resize', resize);
        usingWindowResizeListener = false;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleWebGLContextLost);
      const active = runtimeRef.current;
      runtimeRef.current = null;
      if (active) {
        try {
          active.visualizer.disconnectAudio(active.audioNode);
        } catch (error) {
          console.warn('Butterchurn audio branch cleanup failed:', error);
        }
        active.presetNames.length = 0;
        active.presets = {};
      } else if (visualizer && connectedNode) {
        try { visualizer.disconnectAudio(connectedNode); } catch { /* best-effort teardown */ }
      }
      if (webglContext || webglAttempted) {
        try {
          const context = webglContext ?? canvas.getContext('webgl2');
          context?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (error) {
          console.warn('Butterchurn WebGL context release failed:', error);
        }
      }
      webglContext = null;
      visualizer = null;
      connectedNode = null;
      canvas.width = 0;
      canvas.height = 0;
    };

    const start = async () => {
      try {
        // Stable Butterchurn 2.6.7 creates its WebGL2 context directly on the
        // supplied canvas. Probe a temporary canvas first so an unsupported
        // browser fails before the live visualization surface is initialized.
        const probe = document.createElement('canvas');
        const probeContext = probe.getContext('webgl2');
        if (!probeContext) {
          if (!disposed) setStatus('WEBGL 2 IS NOT AVAILABLE');
          return;
        }
        probeContext.getExtension('WEBGL_lose_context')?.loseContext();

        const { ctx } = winampController.getWebAudio();
        const audioNode = winampController.getVisualizerAudioNode();
        if (!ctx || !audioNode) {
          if (!disposed) setStatus('WINAMP AUDIO GRAPH IS NOT READY');
          return;
        }

        const [engineModule, presetModule] = await Promise.all([
          import('butterchurn'),
          import('butterchurn-presets'),
        ]);
        if (disposed) return;

        const engine = engineModule.default;
        const presetPack = presetModule.default;
        const presets = presetPack.getPresets();
        const presetNames = Object.keys(presets).sort((a, b) => a.localeCompare(b));
        if (!presetNames.length) throw new Error('The local preset pack is empty.');

        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));

        webglAttempted = true;
        visualizer = engine.createVisualizer(ctx, canvas, {
          width,
          height,
          pixelRatio,
          textureRatio: 1,
          meshWidth: 48,
          meshHeight: 36,
        });
        webglContext = canvas.getContext('webgl2');
        connectedNode = audioNode;
        visualizer.connectAudio(audioNode);
        runtimeRef.current = { visualizer, audioNode, presetNames, presets };

        const firstIndex = ((presetIndexRef.current % presetNames.length) + presetNames.length) % presetNames.length;
        setPresetName(presetNames[firstIndex]);
        await visualizer.loadPreset(presets[presetNames[firstIndex]], 2.5);
        if (disposed) return;

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(canvas);
        } else {
          window.addEventListener('resize', resize);
          usingWindowResizeListener = true;
        }

        canvas.addEventListener('webglcontextlost', handleWebGLContextLost);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        setStatus('');
        startRenderer();
      } catch (error) {
        console.error('Unable to initialize Butterchurn:', error);
        if (!disposed) setStatus('MILKDROP COULD NOT BE INITIALIZED');
        cleanup();
      }
    };

    void start();
    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      cleanup();
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !runtime.presetNames.length) return;
    const index = ((presetIndex % runtime.presetNames.length) + runtime.presetNames.length) % runtime.presetNames.length;
    const name = runtime.presetNames[index];
    const preset = runtime.presets[name];
    setPresetName(name);
    void Promise.resolve(runtime.visualizer.loadPreset(preset, 2.5)).catch((error: unknown) => {
      console.error('Butterchurn preset switch failed:', error);
      setStatus('PRESET COULD NOT BE LOADED');
    });
  }, [presetIndex]);

  const importPresetFile = async (file?: File) => {
    if (!file) return;
    const runtime = runtimeRef.current;
    if (!runtime) {
      setStatus('WAIT FOR MILKDROP TO INITIALIZE');
      return;
    }
    try {
      const isMilkFile = /\.milk$/i.test(file.name);
      const rawText = await file.text();
      const parsed: unknown = isMilkFile
        ? convertSimpleMilkPreset(rawText, runtime.presets[runtime.presetNames[0]])
        : JSON.parse(rawText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Preset must be a Butterchurn JSON object or a supported scalar-only MilkDrop .milk file');
      }
      const baseName = file.name.replace(/\.(json|milk)$/i, '').trim().slice(0, 80) || 'Imported preset';
      let name = baseName;
      let suffix = 2;
      while (runtime.presets[name]) name = `${baseName} (${suffix++})`;
      const preset = parsed as ButterchurnPreset;
      await runtime.visualizer.loadPreset(preset, 2.5);
      runtime.presets[name] = preset;
      runtime.presetNames.push(name);
      presetIndexRef.current = runtime.presetNames.length - 1;
      setPresetName(name);
      setStatus(isMilkFile
        ? '.MILK IMPORTED: scalar parameters only; EEL equations, custom waves/shapes and shaders are not converted'
        : '');
    } catch (error) {
      console.error('Butterchurn preset import failed:', error);
      setStatus(error instanceof Error ? error.message : 'UNABLE TO IMPORT PRESET JSON');
    }
  };

  const advancePreset = () => {
    const runtime = runtimeRef.current;
    if (!runtime?.presetNames.length) return;
    const nextIndex = (presetIndexRef.current + 1) % runtime.presetNames.length;
    presetIndexRef.current = nextIndex;
    const name = runtime.presetNames[nextIndex];
    setPresetName(name);
    void Promise.resolve(runtime.visualizer.loadPreset(runtime.presets[name], 2.5)).catch((error: unknown) => {
      console.error('Butterchurn preset advance failed:', error);
      setStatus('PRESET COULD NOT BE LOADED');
    });
  };

  return (
    <div className="wa-butterchurn">
      {presetName && <div className="wa-butterchurn__preset" title={presetName}>{presetName}</div>}
      <canvas ref={canvasRef} aria-label="Genuine MilkDrop visualization" />
      <input ref={presetFileRef} type="file" accept=".json,.milk,application/json,text/plain" hidden onChange={(event) => { void importPresetFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
      <div className="wa-butterchurn__tools">
        <button type="button" className="wa-butterchurn__import" onClick={() => presetFileRef.current?.click()} title="Import Butterchurn JSON or a scalar-only legacy MilkDrop .milk preset">LOAD PRESET</button>
        <button type="button" className="wa-butterchurn__import" onClick={advancePreset} title="Advance through bundled and imported presets">NEXT PRESET</button>
      </div>
      {status && <div className="wa-butterchurn__status" role="status" aria-live="polite">{status}</div>}
    </div>
  );
}
