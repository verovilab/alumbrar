import React from 'react';

interface GemaIconProps {
  size?: number;
  className?: string;
  fill?: string;
}

export function GemaIcon({ size = 24, className = "", fill = "none" }: GemaIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* El Diamante */}
      <path d="M6 9h12l-6 11-6-11z" />
      <path d="M6 9l2-4h8l2 4" />
      <path d="M8 5l4 4 4-4" />
      <line x1="12" y1="9" x2="12" y2="20" />
      
      {/* Destellos (Sparkles) */}
      <line x1="12" y1="2" x2="12" y2="3" />
      <line x1="7" y1="3" x2="8" y2="4" />
      <line x1="17" y1="3" x2="16" y2="4" />
    </svg>
  );
}
