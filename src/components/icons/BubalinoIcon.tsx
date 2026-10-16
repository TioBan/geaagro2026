import React from 'react';

export const BubalinoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || "1em"}
    height={size || "1em"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Strong, wide-sweeping horns characteristic of water buffaloes */}
    <path d="M8 8 C5 5.5 1.5 7.5 1.5 11 C1.5 14 5 13 7.2 11.5" />
    <path d="M16 8 C19 5.5 22.5 7.5 22.5 11 C22.5 14 19 13 16.8 11.5" />
    {/* Ears pointing down and outward under the horns */}
    <path d="M7 11.5 C4.5 12.5 3.5 14.5 5 16 C6 15.5 6.5 14 7 13" />
    <path d="M17 11.5 C19.5 12.5 20.5 14.5 19 16 C18 15.5 17.5 14 17 13" />
    {/* Robust, wide Head structure */}
    <path d="M7.5 9.5 C7.5 8.5 16.5 8.5 16.5 9.5 L15 17.5 C14.5 19.5 9.5 19.5 9 17.5 Z" />
    {/* Strong, wide muzzle */}
    <path d="M9.5 16 C10.5 17.2 13.5 17.2 14.5 16" />
    {/* Eyes */}
    <circle cx="10.2" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="13.8" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export default BubalinoIcon;
