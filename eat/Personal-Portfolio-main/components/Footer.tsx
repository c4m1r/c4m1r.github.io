import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="fixed bottom-0 w-full flex justify-center pointer-events-none select-none z-0 overflow-hidden">
      <h1 className="text-[18vw] sm:text-[18rem] md:text-[22rem] leading-none font-bold bg-text-outline opacity-20 dark:opacity-10 translate-y-[35%] tracking-tighter">
        MENAN
      </h1>
    </div>
  );
};

export default Footer;