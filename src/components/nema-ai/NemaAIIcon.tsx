import React, { useId } from 'react';

interface NemaAIIconProps {
  className?: string;
  size?: number;
}

export const NemaAIIcon: React.FC<NemaAIIconProps> = ({
  className = '',
  size = 36,
}) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `nema-bg-${uid}`;
  const leafId = `nema-leaf-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-label="Nema IA"
    >
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id={leafId} x1="20%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
      </defs>

      {/* Base Rounded Emblem */}
      <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        fill="none"
        stroke="#34d399"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {/* Precision Agronomic Leaf Silhouette */}
      <path
        d="M46 16C31 16 20 24.5 18.5 39.5C18 44 19.5 47.5 19.5 47.5C19.5 47.5 23 48.5 27.5 47.5C41.5 44.5 47.5 31.5 46 16Z"
        fill={`url(#${leafId})`}
        fillOpacity="0.18"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Neural Stem & Precision Branches */}
      <path
        d="M17 49C23 42.5 31.5 33.5 42 21.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M27.5 38.5L25 30.5M34.5 30.5L41 31.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Neural Intelligence Nodes */}
      <circle cx="42" cy="21.5" r="2.6" fill="#34d399" stroke="#ffffff" strokeWidth="1.4" />
      <circle cx="25" cy="30.5" r="2.2" fill="#34d399" stroke="#ffffff" strokeWidth="1.3" />
      <circle cx="41" cy="31.5" r="2.2" fill="#34d399" stroke="#ffffff" strokeWidth="1.3" />
    </svg>
  );
};
