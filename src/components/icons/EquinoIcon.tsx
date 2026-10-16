import React from 'react';

export const EquinoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-5 h-5", size }) => (
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
    {/* Horse Head Contour & Muzzle */}
    <path d="M4.5 16.5 C3.5 15 4 13.5 5.5 13 L8 12.5 L9.5 7 L12 4.5 C12.5 3.5 14 3.5 14.5 5 L14 7.5 C15.5 7.5 17 9 18 11.5 C19.5 15 20.5 18 21 21 L16.5 21 C15 18.5 13.5 16.5 11 16.5 L7.5 17.5 L4.5 16.5 Z" />
    {/* Horse Ear */}
    <path d="M12 4.5 L14 2 L15 5" />
    {/* Horse Mane strands */}
    <path d="M14.5 7.5 C16 7 18 7.5 19 9" />
    <path d="M16.5 11 C18 10.5 19.5 11.5 20.5 13" />
    {/* Horse Eye */}
    <circle cx="9.5" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
    {/* Nostril */}
    <path d="M5.5 15 C5.8 15.2 6.2 15.2 6.5 15" />
  </svg>
);

export default EquinoIcon;
