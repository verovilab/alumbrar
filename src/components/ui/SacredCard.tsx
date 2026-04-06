import React from 'react';

interface SacredCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function SacredCard({ children, className = '', glow = false }: SacredCardProps) {
  return (
    <div className={`sacred-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group ${glow ? 'glow-amber' : ''} ${className}`}>
      {/* Decorative inner glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-[60px] group-hover:scale-110 transition-transform duration-1000"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-[60px] group-hover:scale-110 transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
