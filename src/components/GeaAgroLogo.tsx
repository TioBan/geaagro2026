import React from 'react';
import { handleAgroLogoClick } from '../utils/agroEasterEgg';

interface GeaAgroLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  onClick?: (e: React.MouseEvent) => void;
}

export const GeaAgroLogo: React.FC<GeaAgroLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  showSubtitle = false,
  onClick,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4', text: 'text-sm', badge: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', text: 'text-lg', badge: 'text-[10px]' },
    lg: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6', text: 'text-xl', badge: 'text-xs' },
    xl: { box: 'w-16 h-16 rounded-3xl', icon: 'w-9 h-9', text: 'text-2xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const handleClick = (e: React.MouseEvent) => {
    handleAgroLogoClick(e);
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}
      onClick={handleClick}
    >
      {/* GeaAgro Precision Agricultural Brand Icon */}
      <div
        className={`${currentSize.box} bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-700/25 border border-emerald-400/30 relative overflow-hidden group select-none shrink-0 transition-transform duration-200 active:scale-95`}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Custom Vector GeaAgro Symbol: Earth/Gea Globe Curves + Stylized Sprout + Furrow Field Lines */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.icon} relative z-10 transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Furrow / Soil Contour Curve */}
          <path
            d="M4 24C9 21 16 21 28 25"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 27C11 24.5 17 24.5 26 28"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Plant Stem & Roots Anchor */}
          <path
            d="M16 23V11"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Left Leaf - Precision Curved */}
          <path
            d="M16 17C12 17 9 14 10 9C14 9 16 12 16 17Z"
            fill="#a7f3d0"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Right Leaf - Elevated Sun Angle */}
          <path
            d="M16 13C20 13 23 10 22 5C18 5 16 8 16 13Z"
            fill="#6ee7b7"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Golden Sun / Gea Energy Point */}
          <circle
            cx="8.5"
            cy="7.5"
            r="2"
            fill="#fef08a"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold ${currentSize.text} tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight`}>
            GeaAgro
            <span className={`${currentSize.badge} font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/60`}>
              CRM do Agro
            </span>
          </span>
          {showSubtitle && (
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium mt-0.5">
              Gestão Técnica &amp; Inteligência Agronômica
            </p>
          )}
        </div>
      )}
    </div>
  );
};
