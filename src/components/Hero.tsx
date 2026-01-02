import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Layer - Slowest parallax */}
      <div
        className="absolute inset-0 bg-gradient-hero"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Mid Layer - Decorative shapes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-aero-sky/30 blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-aero-grass/20 blur-3xl animate-float animation-delay-200" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-aero-sun/20 blur-3xl animate-float animation-delay-400" />
        
        {/* Glass panels */}
        <div className="absolute top-20 right-20 w-32 h-32 glass rounded-3xl rotate-12 opacity-50" />
        <div className="absolute bottom-32 left-16 w-24 h-24 glass rounded-2xl -rotate-6 opacity-40" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 glass rounded-xl rotate-45 opacity-30" />
      </div>

      {/* Foreground Layer - Content */}
      <div
        className="relative z-10 text-center px-6 max-w-4xl"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
          opacity: Math.max(0, 1 - scrollY / 500),
        }}
      >
        <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-aero-sun" />
          <span className="text-sm font-medium text-foreground/80">
            Welcome to my digital space
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in animation-delay-100">
          <span className="gradient-text">{title.split(' ')[0]}</span>
          <br />
          <span className="text-foreground">{title.split(' ').slice(1).join(' ')}</span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 animate-fade-in animation-delay-200">
          {subtitle}
        </p>
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator text-foreground/50 hover:text-foreground transition-colors"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
