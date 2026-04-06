import React from 'react';
import { Sparkles, Sun, Moon, Wind, CheckCircle2 } from 'lucide-react';

interface AltarProps {
  steps: {
    id: string;
    label: string;
    completed: boolean;
    icon: React.ReactNode;
  }[];
  activeStep: number;
}

export function Altar({ steps, activeStep }: AltarProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="relative py-12 flex flex-col items-center">
      {/* Visual Altar Core */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
        {/* Outer Glow Halo */}
        <div className={`absolute inset-0 rounded-full blur-[70px] transition-all duration-1000 opacity-80 ${progress === 100 ? 'bg-[#D4AF37] scale-150' : 'bg-black/60 scale-110'}`} />
        
        {/* Altar base / Circle */}
        <div className="absolute inset-0 border-2 border-[#D4AF37]/30 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-1 border border-[#D4AF37]/10 rounded-full rotate-45"></div>
        
        {/* Central Icon */}
        <div className="relative z-10 flex flex-col items-center gap-1 animate-fade-in">
          {progress === 100 ? (
            <>
              <Sparkles className="text-[#D4AF37] animate-pulse drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" size={56} />
              <span className="text-sm font-black uppercase tracking-[0.5em] gold-text drop-shadow-2xl">Santuario Iluminado</span>
            </>
          ) : (
            <>
              <Sun className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" size={40} />
              <span className="text-xs font-black uppercase tracking-[0.5em] text-[#D4AF37] mt-3 drop-shadow-lg">Ritual de Hoy</span>
            </>
          )}
        </div>

        {/* Floating Steps / Orbs */}
        {steps.map((step, i) => {
          const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div 
              key={step.id}
              className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-700 border-2 ${
                step.completed 
                ? 'bg-[#D4AF37] border-white/20 text-white shadow-[0_0_25px_rgba(212,175,55,0.5)]' 
                : 'bg-white/95 dark:bg-black/80 border-[#D4AF37]/20 text-stone-600 shadow-xl'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 20
              }}
              title={step.label}
            >
              {step.completed ? <CheckCircle2 size={24} /> : step.icon}
            </div>
          );
        })}
      </div>

      {/* Progress Bar Label */}
      <div className="mt-12 text-center space-y-4">
        <div className="flex gap-2 justify-center">
            {steps.map((s, i) => (
                <div key={s.id} className={`h-1 rounded-full transition-all duration-700 ${s.completed ? 'w-8 bg-[#D4AF37]' : 'w-4 bg-stone-100 dark:bg-stone-800'}`} />
            ))}
        </div>
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span className="text-[#D4AF37]">{completedCount}</span> de {steps.length} pasos hacia la paz
        </p>
      </div>
    </div>
  );
}
