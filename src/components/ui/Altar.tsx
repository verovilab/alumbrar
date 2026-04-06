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
        <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 opacity-60 ${progress === 100 ? 'bg-[#D4AF37] scale-125' : 'bg-[#D4AF37]/20 scale-100'}`} />
        
        {/* Altar base / Circle */}
        <div className="absolute inset-0 border-2 border-[#D4AF37]/10 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-4 border border-[#D4AF37]/5 rounded-full rotate-45"></div>
        
        {/* Central Icon */}
        <div className="relative z-10 flex flex-col items-center gap-1 animate-fade-in">
          {progress === 100 ? (
            <>
              <Sparkles className="text-[#D4AF37] animate-pulse" size={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] gold-text">Santuario Iluminado</span>
            </>
          ) : (
            <>
              <Sun className="text-stone-300 dark:text-stone-700" size={32} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 mt-2">Ritual de Hoy</span>
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
              className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-700 border ${
                step.completed 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'bg-white/80 dark:bg-stone-900/80 border-stone-100 dark:border-stone-800 text-stone-300'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 20
              }}
              title={step.label}
            >
              {step.completed ? <CheckCircle2 size={16} /> : step.icon}
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
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
            {completedCount} de {steps.length} pasos hacia la paz
        </p>
      </div>
    </div>
  );
}
