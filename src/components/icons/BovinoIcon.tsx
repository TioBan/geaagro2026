import React from 'react';

export const BovinoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
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
    {/* Left Horn */}
    <path d="M7.5 8 C6 4.5 3.5 4 2.5 5.5 C4 6.5 5.5 7.5 6.5 8.5" />
    {/* Right Horn */}
    <path d="M16.5 8 C18 4.5 20.5 4 21.5 5.5 C20 6.5 18.5 7.5 17.5 8.5" />
    {/* Left Ear */}
    <path d="M6.5 10 C3.5 10.5 2 12.5 4 14.5 C5 14 6 13 6.5 12" />
    {/* Right Ear */}
    <path d="M17.5 10 C20.5 10.5 22 12.5 20 14.5 C19 14 18 13 17.5 12" />
    {/* Head Outline */}
    <path d="M7.5 9 C7.5 8 16.5 8 16.5 9 L15 17 C14.5 19.5 9.5 19.5 9 17 Z" />
    {/* Muzzle / Nose */}
    <path d="M10 16 C11 17 13 17 14 16" />
    {/* Eyes */}
    <circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export default BovinoIcon;
