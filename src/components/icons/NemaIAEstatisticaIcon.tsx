import React, { useId } from 'react';

export interface NemaIAEstatisticaIconProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'line';
}

export const NemaIAEstatisticaIcon: React.FC<NemaIAEstatisticaIconProps> = ({
  className = '',
  size,
  variant,
}) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `nema-est-bg-${uid}`;
  const curveId = `nema-est-curve-${uid}`;
  const barId = `nema-est-bar-${uid}`;

  // Use emblem mode when variant='emblem' or when size is explicitly >= 24 (unless variant='line')
  const isEmblem = variant === 'emblem' || (variant !== 'line' && typeof size === 'number' && size >= 24);

  if (!isEmblem) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || '1em'}
        height={size || '1em'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
        aria-label="Nema IA Estatística"
      >
        {/* Statistical Bars (ANOVA / Experimental Distribution) */}
        <path d="M5 19v-4" />
        <path d="M9.5 19v-8" />
        <path d="M14.5 19v-10" />
        <path d="M19 19v-5" />
        {/* Baseline */}
        <path d="M3 19h18" />
        {/* Gaussian Bell / Regression Curve */}
        <path d="M3.5 14.5C6.5 14 8.5 6 12 6s5.5 8 8.5 8.5" />
        {/* Neural Intelligence Node at Peak */}
        <circle cx="12" cy="6" r="1.6" fill="currentColor" />
      </svg>
    );
  }

  const finalSize = size || 44;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={finalSize}
      height={finalSize}
      className={`shrink-0 ${className}`}
      aria-label="Nema IA Estatística"
    >
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="55%" stopColor="#047857" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id={curveId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
        <linearGradient id={barId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
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
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />

      {/* Subtle Biometric Grid Lines */}
      <line x1="12" y1="49" x2="52" y2="49" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="24" x2="52" y2="24" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="12" y1="36" x2="52" y2="36" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 3" />

      {/* Experimental Treatment Bars (Tukey / ANOVA Columns) */}
      <rect x="15" y="38" width="5.5" height="11" rx="2" fill={`url(#${barId})`} />
      <rect x="24" y="29" width="5.5" height="20" rx="2" fill={`url(#${barId})`} />
      <rect x="33" y="22" width="5.5" height="27" rx="2" fill={`url(#${barId})`} />
      <rect x="42" y="33" width="5.5" height="16" rx="2" fill={`url(#${barId})`} />

      {/* Error Bar Whiskers on Peak Column */}
      <line x1="35.75" y1="18" x2="35.75" y2="22" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="33.5" y1="18" x2="38" y2="18" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />

      {/* Gaussian Normal / Dose-Response Regression Curve */}
      <path
        d="M11 44 C18 43, 22 18, 33.5 17 C43 16, 46 39, 53 42"
        fill="none"
        stroke={`url(#${curveId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neural Intelligence & Biometric Nodes */}
      <circle cx="24" cy="29" r="2.6" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="33.5" cy="17" r="3.2" fill="#10b981" stroke="#ffffff" strokeWidth="1.8" />
      <circle cx="44.5" cy="33" r="2.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />

      {/* AI Spark Accent in Top-Right */}
      <path
        d="M49 12 L50.2 15.3 L53.5 16.5 L50.2 17.7 L49 21 L47.8 17.7 L44.5 16.5 L47.8 15.3 Z"
        fill="#ffffff"
        fillOpacity="0.95"
      />
    </svg>
  );
};

export default NemaIAEstatisticaIcon;
