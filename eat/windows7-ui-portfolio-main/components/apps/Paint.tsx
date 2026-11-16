"use client";

import { useRef, useState, useEffect } from "react";
import { ClipboardPaste, Scissors, Copy, Pencil, Eraser, PaintBucket, Type, Search, Pipette, Minus, Square, Circle, Save, Undo, Redo } from "lucide-react";
import Image from "next/image";

type Tool = 'pencil' | 'eraser' | 'line' | 'rect' | 'circle' | 'fill';

const RibbonBtn = ({ children, disabled = false, active = false, onClick, title }: { children: React.ReactNode, disabled?: boolean, active?: boolean, onClick?: () => void, title?: string }) => (
  <div 
    onClick={disabled ? undefined : onClick}
    title={title}
    style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '4px', borderRadius: '3px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, minWidth: '40px', gap: '2px', border: active ? '1px solid #ffb700' : '1px solid transparent',
      background: active ? 'linear-gradient(to bottom, #ffe8a1, #ffd05c)' : 'transparent',
    }}
    onMouseEnter={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #f2f8fc, #d5e5f5)', (e.currentTarget as HTMLDivElement).style.borderColor = '#b6cae0')}
    onMouseLeave={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'transparent', (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {children}
  </div>
);

const RibbonSmallBtn = ({ children, disabled = false, active = false, onClick, title }: { children: React.ReactNode, disabled?: boolean, active?: boolean, onClick?: () => void, title?: string }) => (
  <div 
    onClick={disabled ? undefined : onClick}
    title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 4px', borderRadius: '2px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, border: active ? '1px solid #ffb700' : '1px solid transparent',
      background: active ? 'linear-gradient(to bottom, #ffe8a1, #ffd05c)' : 'transparent',
    }}
    onMouseEnter={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #f2f8fc, #d5e5f5)', (e.currentTarget as HTMLDivElement).style.borderColor = '#b6cae0')}
    onMouseLeave={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'transparent', (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {children}
  </div>
);

const COLORS = [
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4',
  '#FFFFFF', '#C3C3C3', '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7'
];

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#FFFFFF');
  const [strokeSize, setStrokeSize] = useState(3);
  
  // For shapes drawing preview
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set fixed canvas size (A4-ish size for a default blank canvas)
    canvas.width = 800;
    canvas.height = 600;
    
    const context = canvas.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      contextRef.current = context;
    }
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === 'rect' || tool === 'circle' || tool === 'line') {
      setStartPos({ x, y });
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    
    setIsDrawing(true);
    // Draw initial dot for pencil/eraser
    if (tool === 'pencil' || tool === 'eraser') {
      draw(e);
    }
  };

  const endDrawing = () => {
    if (tool === 'pencil' || tool === 'eraser') {
      contextRef.current?.closePath();
    }
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);
    
    // Check if right click (button 2) is used, then use color2, else color1
    const isRightClick = e.buttons === 2;
    const drawColor = tool === 'eraser' ? color2 : (isRightClick ? color2 : color1);
    
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = strokeSize;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if ((tool === 'rect' || tool === 'circle' || tool === 'line') && snapshot && startPos) {
      // Restore previous state before drawing new shape preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
      } else if (tool === 'rect') {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.rect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Untitled.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' }}>
      
      {/* ── RIBBON AREA ── */}
      <div style={{ background: '#f5f6f7', borderBottom: '1px solid #b6cae0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        {/* Quick Access Toolbar & Tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 4px', background: 'linear-gradient(to bottom, #e4eff8, #c9dff0)' }}>
          {/* Menu Button */}
          <div style={{ 
            background: 'linear-gradient(to bottom, #4f8ecc, #1a5fa8)', 
            padding: '2px 12px 2px 8px', borderRadius: '4px 4px 0 0', 
            display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #143869', borderBottom: 'none',
            marginRight: '6px', cursor: 'pointer', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
          }}>
            <img src="/win7/Imaging Devices/WLXPhotoAcq_1075.ico" alt="Paint" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '10px', color: '#fff' }}>▼</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 8px', marginBottom: '4px' }}>
            <div title="Save" onClick={handleSave} style={{ cursor: 'pointer', display: 'flex' }}>
              <Save size={14} color="#1a5fa8" />
            </div>
            <div title="Undo" style={{ cursor: 'not-allowed', opacity: 0.5, display: 'flex' }}>
              <Undo size={14} color="#1a5fa8" />
            </div>
            <div title="Redo" style={{ cursor: 'not-allowed', opacity: 0.5, display: 'flex' }}>
              <Redo size={14} color="#1a5fa8" />
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ 
              padding: '4px 16px', background: '#f5f6f7', border: '1px solid #b6cae0', 
              borderBottom: 'none', borderRadius: '3px 3px 0 0', fontSize: '12px', 
              position: 'relative', top: '1px', zIndex: 10, color: '#1a5fa8' 
            }}>
              Home
            </div>
            <div style={{ padding: '4px 16px', fontSize: '12px', color: '#1a5fa8', cursor: 'pointer' }}>View</div>
          </div>
        </div>

        {/* Ribbon Content */}
        <div style={{ display: 'flex', padding: '4px 2px', gap: '2px', height: '90px', overflowX: 'auto', overflowY: 'hidden' }}>
          
          {/* Clipboard Group */}
          <div style={{ display: 'flex', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <RibbonBtn>
              <ClipboardPaste size={32} color="#cca300" strokeWidth={1} />
              <span style={{ fontSize: '11px', color: '#333' }}>Paste</span>
            </RibbonBtn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
              <RibbonSmallBtn disabled><Scissors size={14} color="#444" /> <span style={{ fontSize: '11px', color: '#333' }}>Cut</span></RibbonSmallBtn>
              <RibbonSmallBtn disabled><Copy size={14} color="#444" /> <span style={{ fontSize: '11px', color: '#333' }}>Copy</span></RibbonSmallBtn>
            </div>
          </div>

          {/* Tools Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', flex: 1, alignItems: 'center' }}>
              <RibbonSmallBtn active={tool === 'pencil'} onClick={() => setTool('pencil')}><Pencil size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn disabled title="Fill not implemented"><PaintBucket size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn disabled><Type size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn active={tool === 'eraser'} onClick={() => setTool('eraser')}><Eraser size={16} color="#e04e9c" /></RibbonSmallBtn>
              <RibbonSmallBtn disabled><Pipette size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn disabled><Search size={16} color="#333" /></RibbonSmallBtn>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Tools</div>
          </div>

          {/* Shapes Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100px', gap: '2px', padding: '2px', background: '#fff', border: '1px solid #ccc', height: '56px', overflowY: 'auto' }}>
              <RibbonSmallBtn active={tool === 'line'} onClick={() => setTool('line')}><Minus size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn active={tool === 'rect'} onClick={() => setTool('rect')}><Square size={16} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn active={tool === 'circle'} onClick={() => setTool('circle')}><Circle size={16} color="#333" /></RibbonSmallBtn>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Shapes</div>
          </div>
          
          {/* Size Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '60px', flex: 1, justifyContent: 'center' }}>
              <select 
                value={strokeSize} 
                onChange={e => setStrokeSize(Number(e.target.value))}
                style={{ width: '100%', fontSize: '11px', padding: '2px' }}
              >
                <option value="1">1px</option>
                <option value="3">3px</option>
                <option value="5">5px</option>
                <option value="8">8px</option>
              </select>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Size</div>
          </div>

          {/* Colors Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9', flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
              {/* Color 1 & 2 */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px', background: '#e5f3fb', border: '1px solid #d9ebf9', borderRadius: '3px' }}>
                  <div style={{ width: 24, height: 24, background: color1, border: '1px solid #ccc' }} />
                  <span style={{ fontSize: '9px', color: '#333', marginTop: '2px' }}>Color 1</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px', border: '1px solid transparent' }}>
                  <div style={{ width: 24, height: 24, background: color2, border: '1px solid #ccc' }} />
                  <span style={{ fontSize: '9px', color: '#333', marginTop: '2px' }}>Color 2</span>
                </div>
              </div>

              {/* Palette */}
              <div style={{ display: 'flex', flexWrap: 'wrap', width: '150px', gap: '2px' }}>
                {COLORS.map(c => (
                  <div 
                    key={c}
                    onClick={() => setColor1(c)}
                    onContextMenu={(e) => { e.preventDefault(); setColor2(c); }}
                    style={{ width: 12, height: 12, background: c, border: '1px solid #ccc', cursor: 'pointer' }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Colors</div>
          </div>

        </div>
      </div>

      {/* ── CANVAS AREA ── */}
      <div style={{ flex: 1, background: '#d5e1f0', overflow: 'auto', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ 
          background: '#fff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1)',
          display: 'flex',
        }}>
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={endDrawing}
            onPointerLeave={endDrawing}
            onContextMenu={e => e.preventDefault()}
            style={{ 
              touchAction: 'none', // Prevents scrolling while drawing on touch devices
              cursor: tool === 'pencil' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'crosshair'
            }}
          />
        </div>
      </div>
      
      {/* Status Bar */}
      <div style={{ height: '22px', background: '#f0f0f0', borderTop: '1px solid #d9d9d9', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '11px', color: '#555', flexShrink: 0, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>For Help, click Help Topics on the Help Menu.</span>
          {startPos && <span>Starting at: {Math.round(startPos.x)}, {Math.round(startPos.y)}px</span>}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>800 × 600 px</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>100%</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 12, height: 12, background: 'linear-gradient(to bottom, #fff, #e0e0e0)', border: '1px solid #ccc' }} /> 
              <div style={{ width: 12, height: 12, background: 'linear-gradient(to bottom, #fff, #e0e0e0)', border: '1px solid #ccc' }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
