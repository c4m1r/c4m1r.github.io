import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavCardProps {
  label: string;
  icon: LucideIcon;
  path: string;
  colorClass: string; // Tailwind text color class
  delay?: number;
}

const NavCard: React.FC<NavCardProps> = ({ label, icon: Icon, path, colorClass, delay = 0 }) => {
  return (
    <Link to={path} className="block h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className="group h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 cursor-pointer min-h-[110px] sm:min-h-[140px]"
      >
        <div className={`p-2.5 sm:p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
           <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colorClass}`} strokeWidth={1.5} />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      </motion.div>
    </Link>
  );
};

export default NavCard;