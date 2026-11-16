import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Briefcase, Layers, PartyPopper, Mail } from 'lucide-react';
import NavCard from '../components/NavCard';
import Avatar3D from '../components/Avatar3D';

const Home: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 mt-4 sm:mt-4 pb-24 min-h-[80vh]"
    >
      {/* Intro Text */}
      <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-12 z-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 flex items-center justify-center gap-2"
        >
          Hey, I'm Menan Sali <span className="animate-bounce inline-block">👋</span>
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-sm px-2"
        >
          Personal portfolio
        </motion.h1>
      </div>

      {/* 3D Avatar - Increased Size */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative w-64 h-64 sm:w-96 sm:h-96 md:w-[30rem] md:h-[30rem] mb-6 sm:mb-10 -mt-4 sm:-mt-8 z-10"
      >
        <Avatar3D />
      </motion.div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-4xl z-20">
        <NavCard
          label="Me"
          icon={Smile}
          path="/me"
          colorClass="text-teal-500"
          delay={0.5}
        />
        <NavCard
          label="Projects"
          icon={Briefcase}
          path="/projects"
          colorClass="text-green-500"
          delay={0.6}
        />
        <NavCard
          label="Skills"
          icon={Layers}
          path="/skills"
          colorClass="text-indigo-500"
          delay={0.7}
        />
        <NavCard
          label="Fun"
          icon={PartyPopper}
          path="/fun"
          colorClass="text-pink-500"
          delay={0.8}
        />
        <div className="col-span-2 sm:col-span-1">
          <NavCard
            label="Contact"
            icon={Mail}
            path="/contact"
            colorClass="text-orange-500"
            delay={0.9}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;