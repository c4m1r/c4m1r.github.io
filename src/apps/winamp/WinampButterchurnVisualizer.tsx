import { useEffect, useRef, useState } from 'react';
import { winampController } from '../../system/audio/winampController';
import type { ButterchurnPreset, ButterchurnVisualizer } from './butterchurn';

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
  const runtimeRef = useRef<ButterchurnRuntime | null>(null);
  const presetIndexRef = useRef(presetIndex);
  const [status, setStatus] = useState('LOADING MILKDROP ENGINE…');

  presetIndexRef.current = presetIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let visualizer: ButterchurnVisualizer | null = null;
    let connectedNode: AudioNode | null = null;

    const resize = () => {
      if (!visualizer || !canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
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

    const cleanup = () => {
      stopRenderer();
      resizeObserver?.disconnect();
      resizeObserver = null;
      const active = runtimeRef.current;
      runtimeRef.current = null;
      if (active) {
        try {
          active.visualizer.disconnectAudio(active.audioNode);
        } catch (error) {
          console.warn('Butterchurn audio branch cleanup failed:', error);
        }
        try {
          active.visualizer.loseGLContext?.();
        } catch (error) {
          console.warn('Butterchurn WebGL cleanup failed:', error);
        }
        active.presetNames.length = 0;
        active.presets = {};
      } else if (visualizer) {
        if (connectedNode) {
          try { visualizer.disconnectAudio(connectedNode); } catch { /* best-effort teardown */ }
        }
        try { visualizer.loseGLContext?.(); } catch { /* best-effort teardown */ }
      }
      visualizer = null;
      connectedNode = null;
      canvas.width = 0;
      canvas.height = 0;
    };

    const start = async () => {
      try {
        // Butterchurn renders WebGL to an internal canvas and copies it to this
        // visible 2D canvas. Probe a separate canvas so we do not lock this one
        // to a WebGL context before Butterchurn requests its 2D output context.
        const probe = document.createElement('canvas');
        if (!probe.getContext('webgl2')) {
          if (!disposed) setStatus('WEBGL 2 IS NOT AVAILABLE');
          return;
        }

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
        const width = Math.max(1, Math.round(bounds.width * pixelRatio));
        const height = Math.max(1, Math.round(bounds.height * pixelRatio));

        visualizer = engine.createVisualizer(ctx, canvas, {
          width,
          height,
          pixelRatio,
          textureRatio: 1,
          meshWidth: 48,
          meshHeight: 36,
        });
        connectedNode = audioNode;
        visualizer.connectAudio(audioNode);
        runtimeRef.current = { visualizer, audioNode, presetNames, presets };

        const firstIndex = ((presetIndexRef.current % presetNames.length) + presetNames.length) % presetNames.length;
        await visualizer.loadPreset(presets[presetNames[firstIndex]], 2.5);
        if (disposed) return;

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(canvas);
        } else {
          window.addEventListener('resize', resize);
        }

        setStatus('');
        const draw = () => {
          if (disposed || !visualizer) return;
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
    const preset = runtime.presets[runtime.presetNames[index]];
    void Promise.resolve(runtime.visualizer.loadPreset(preset, 2.5)).catch((error: unknown) => {
      console.error('Butterchurn preset switch failed:', error);
      setStatus('PRESET COULD NOT BE LOADED');
    });
  }, [presetIndex]);

  return (
    <div className="wa-butterchurn">
      <canvas ref={canvasRef} aria-label="Genuine MilkDrop visualization" />
      {status && <div className="wa-butterchurn__status" role="status" aria-live="polite">{status}</div>}
    </div>
  );
}
