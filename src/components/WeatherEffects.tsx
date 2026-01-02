import { useCallback, useEffect, useRef, useState } from 'react';
import { useWeather, type WeatherEffect } from '../contexts/WeatherContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation?: number;
  rotationSpeed?: number;
  color?: string;
  type?: string;
}

export function WeatherEffects() {
  const { effect } = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const createParticles = useCallback((current: WeatherEffect, width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    switch (current) {
      case 'snow':
        for (let i = 0; i < 100; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 1 + 0.5,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.6 + 0.4,
          });
        }
        break;
      case 'rain':
        for (let i = 0; i < 150; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0.5,
            vy: Math.random() * 8 + 12,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.2,
          });
        }
        break;
      case 'spring': {
        const colors = ['#FFB7C5', '#FFDAB9', '#E6E6FA', '#FFF0F5'];
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 1 + 0.3,
            size: Math.random() * 12 + 8,
            opacity: Math.random() * 0.7 + 0.3,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 2 - 1,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
        break;
      }
      case 'halloween':
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 2 - 1,
            vy: Math.sin(Math.random() * Math.PI) * 0.5,
            size: Math.random() * 20 + 15,
            opacity: Math.random() * 0.6 + 0.4,
            rotation: 0,
            rotationSpeed: Math.random() * 0.02 - 0.01,
            type: Math.random() > 0.5 ? 'bat' : 'pumpkin',
          });
        }
        break;
      case 'heat':
        for (let i = 0; i < 30; i++) {
          particles.push({
            x: Math.random() * width,
            y: height + Math.random() * 100,
            vx: Math.random() * 0.5 - 0.25,
            vy: -(Math.random() * 0.5 + 0.2),
            size: Math.random() * 40 + 20,
            opacity: Math.random() * 0.1 + 0.05,
            color: Math.random() > 0.5 ? '#FFD700' : '#FF8C00',
          });
        }
        break;
      case 'fireworks':
        break;
    }
    return particles;
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, current: WeatherEffect) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    switch (current) {
      case 'snow':
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        break;
      case 'rain':
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + particle.vx * 2, particle.y + particle.vy * 2);
        ctx.stroke();
        break;
      case 'spring':
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation || 0) * Math.PI / 180);
        ctx.fillStyle = particle.color || '#FFB7C5';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(0, -particle.size / 2, particle.size / 4, particle.size / 2, (i * 72) * Math.PI / 180, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FFE4B5';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'halloween':
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation || 0);
        ctx.font = `${particle.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.type === 'bat' ? '🦇' : '🎃', 0, 0);
        break;
      case 'heat': {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
        gradient.addColorStop(0, `${particle.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'fireworks':
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color || 'white';
        ctx.fill();
        break;
    }
    ctx.restore();
  }, []);

  const updateParticle = useCallback((particle: Particle, current: WeatherEffect, width: number, height: number): boolean => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.rotation !== undefined && particle.rotationSpeed) {
      particle.rotation += particle.rotationSpeed;
    }
    switch (current) {
      case 'snow':
        particle.vx = Math.sin(particle.y * 0.01) * 0.5;
        if (particle.y > height) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }
        break;
      case 'rain':
        if (particle.y > height) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }
        break;
      case 'spring':
        particle.vx = Math.sin(particle.y * 0.02) * 1.5;
        if (particle.y > height + 20) {
          particle.y = -20;
          particle.x = Math.random() * width;
        }
        break;
      case 'halloween':
        particle.vx = Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 2;
        particle.vy = Math.cos(Date.now() * 0.002 + particle.x * 0.01) * 0.5;
        if (particle.x < -50) particle.x = width + 50;
        if (particle.x > width + 50) particle.x = -50;
        break;
      case 'heat':
        if (particle.y < -50) {
          particle.y = height + 50;
          particle.x = Math.random() * width;
        }
        break;
      case 'fireworks':
        particle.vy += 0.05;
        particle.opacity -= 0.015;
        particle.size *= 0.98;
        return particle.opacity > 0;
    }
    return true;
  }, []);

  useEffect(() => {
    if (effect === 'none' || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    particlesRef.current = createParticles(effect, dimensions.width, dimensions.height);

    let lastFirework = 0;
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      if (effect === 'fireworks' && timestamp - lastFirework > 800) {
        lastFirework = timestamp;
        const x = Math.random() * dimensions.width;
        const y = dimensions.height * 0.3 + Math.random() * dimensions.height * 0.3;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 2;
          const speed = Math.random() * 3 + 2;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 2,
            opacity: 1,
            color,
          });
        }
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        const alive = updateParticle(particle, effect, dimensions.width, dimensions.height);
        if (alive) {
          drawParticle(ctx, particle, effect);
        }
        return alive;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [effect, dimensions, createParticles, updateParticle, drawParticle]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
