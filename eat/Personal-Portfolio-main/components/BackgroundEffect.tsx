import React, { useEffect } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';

const BackgroundEffect: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the glow movement
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Center the glow on the cursor (assuming 600px width/height)
      mouseX.set(e.clientX - 300); 
      mouseY.set(e.clientY - 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50/50 dark:bg-background-dark/50 transition-colors duration-300">
      
      {/* Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Interactive Glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-40 dark:opacity-20"
        style={{
          x,
          y,
          background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.4) 50%, transparent 70%)',
        }}
      />
      
      {/* Secondary Ambient Glows (Static) for depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
    </div>
  );
};

export default BackgroundEffect;