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
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* El Diamante (Más ancho y robusto) */}
      <path d="M4 9h16l-8 11-8-11z" />
      <path d="M4 9l3-4h10l3 4" />
      <path d="M7 5l5 4 5-4" />
      <line x1="12" y1="9" x2="12" y2="20" />
      
      {/* Destellos (Sparkles - Más notorios) */}
      <line x1="12" y1="1" x2="12" y2="2.5" />
      <line x1="6" y1="2" x2="8" y2="4" />
      <line x1="18" y1="2" x2="16" y2="4" />
    </svg>
  );
}
