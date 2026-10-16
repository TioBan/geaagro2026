import React from 'react';

export const CaprinoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
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
    {/* Left Horn curving up & back */}
    <path d="M8.5 7.5 C7 3.5 4.5 3 3.5 4.5 C4.5 6.5 6.5 8 8 9" />
    {/* Right Horn curving up & back */}
    <path d="M15.5 7.5 C17 3.5 19.5 3 20.5 4.5 C19.5 6.5 17.5 8 16 9" />
    {/* Left Ear */}
    <path d="M7 9.5 C4 9 2.5 11 4.5 13.5 C5.5 13 6.5 12 7.2 11" />
    {/* Right Ear */}
    <path d="M17 9.5 C20 9 21.5 11 19.5 13.5 C18.5 13 17.5 12 16.8 11" />
    {/* Head Outline / Face */}
    <path d="M8 8.5 C8 7.5 16 7.5 16 8.5 L15 16 C14.5 17.5 9.5 17.5 9 16 Z" />
    {/* Muzzle / Nose */}
    <path d="M10.5 15.5 C11.2 16 12.8 16 13.5 15.5" />
    {/* Goat Beard */}
    <path d="M10.5 17 L12 21 L13.5 17" />
    {/* Eyes */}
    <circle cx="10" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export default CaprinoIcon;
