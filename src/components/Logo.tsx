import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Brand Hexagon Symbol with Lime-Cyan Gradient Border */}
      <div className={`relative flex items-center justify-center shrink-0 ${containerSizes[size]}`}>
        <img
          src="/logo.svg"
          alt="StudySync Logo"
          className="w-full h-full object-contain drop-shadow-md"
          onError={(e) => {
            // Fallback SVG if image loading has issues
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent font-black ${textSizes[size]}`}>
            Study<span className="text-lime-500 dark:text-lime-400">Sync</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
        </div>
        {size !== 'sm' && (
          <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 -mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-0.5 bg-lime-500 rounded-full"></span>
            <span>Productivity & Placement</span>
            <span className="w-1.5 h-0.5 bg-cyan-500 rounded-full"></span>
          </span>
        )}
      </div>
    </div>
  );
};

