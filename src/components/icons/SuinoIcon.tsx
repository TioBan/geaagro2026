import React from 'react';

export const SuinoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
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
    {/* Head Outline */}
    <ellipse cx="12" cy="13.5" rx="7.5" ry="6.5" />
    {/* Left Flappy Ear */}
    <path d="M6.2 9.8 C 3.8 5.8 2.5 8 4.6 11.8" />
    {/* Right Flappy Ear */}
    <path d="M17.8 9.8 C 20.2 5.8 21.5 8 19.4 11.8" />
    {/* Pig Snout */}
    <ellipse cx="12" cy="15" rx="2.8" ry="1.8" />
    {/* Nostrils */}
    <circle cx="10.8" cy="15" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="13.2" cy="15" r="0.6" fill="currentColor" stroke="none" />
    {/* Eyes */}
    <circle cx="9" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export default SuinoIcon;
