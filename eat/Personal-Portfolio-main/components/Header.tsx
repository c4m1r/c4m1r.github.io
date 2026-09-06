import React from 'react';
import { Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl mx-auto p-4 flex justify-between items-center z-50">
      {/* Status Pill */}
      <div className="flex items-center space-x-2 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm transition-colors duration-300">
        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
        </span>
        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          Open to Work
        </span>
      </div>

      {/* Github Button */}
      <a
        href="https://github.com/menansali/Personal-Portfolio"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1.5 sm:space-x-2 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 transition px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Star</span>
      </a>
    </header>
  );
};

export default Header;