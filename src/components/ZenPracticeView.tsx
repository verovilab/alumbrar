import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';
import { SacredCard } from './ui/SacredCard';

interface ZenPracticeViewProps {
  onSetTab: (tab: any) => void;
  setRitualState: React.Dispatch<React.SetStateAction<any>>;
}

export function ZenPracticeView({ onSetTab, setRitualState }: ZenPracticeViewProps) {
  const [duration, setDuration] = useState(60); // Default 60s
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive) {
      // Start audio
      window.dispatchEvent(new CustomEvent('toggle-zen-audio', { detail: { action: 'play' } }));
    } else {
      // Pause audio is handled manually by user in ZenPlayer if they want, 
      // but here we just pause the timer.
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setIsFinished(false);
  };

  const handleDurationChange = (secs: number) => {
    setDuration(secs);
    setTimeLeft(secs);
    setIsActive(false);
    setIsFinished(false);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsFinished(true);
    setRitualState((prev: any) => ({ ...prev, zen: true }));
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onSetTab('home')}
          className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-[#D4AF37] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-serif italic text-white">Práctica de Hoy</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Habitar el Silencio</p>
        </div>
      </div>

      <SacredCard glow className="p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background Sparkle */}
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles className="text-[#D4AF37]" size={120} />
        </div>

        {/* Sand Clock Timer Visual */}
        <div className="relative w-48 h-64 mx-auto mb-12 flex flex-col items-center justify-center">
          {/* Hourglass Frame SVG */}
          <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            {/* Top Chamber */}
            <path 
              d="M10 10 L90 10 L50 80 Z" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="2" 
              strokeOpacity="0.3"
            />
            {/* Top Sand (Empties) */}
            <path 
              d="M10 10 L90 10 L50 80 Z" 
              fill="#D4AF37" 
              fillOpacity="0.6"
              style={{
                clipPath: `inset(${progress}% 0 0 0)`
              }}
            />
            
            {/* Bottom Chamber */}
            <path 
              d="M50 80 L10 150 L90 150 Z" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="2" 
              strokeOpacity="0.3"
            />
            {/* Bottom Sand (Fills) */}
            <path 
              d="M50 80 L10 150 L90 150 Z" 
              fill="#D4AF37" 
              fillOpacity="0.8"
              style={{
                clipPath: `inset(${100 - progress}% 0 0 0)`
              }}
            />

            {/* Connecting Neck */}
            <line x1="50" y1="78" x2="50" y2="82" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2,2" className={isActive ? 'animate-pulse' : ''} />
          </svg>

          {/* Time Display Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pt-4">
             <span className="text-4xl md:text-5xl font-serif text-white drop-shadow-lg tracking-widest">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
             </span>
          </div>
        </div>

        {/* Duration Selectors */}
        <div className="flex justify-center gap-3 mb-10">
          {[30, 60, 90, 120, 300].map((s) => (
            <button
              key={s}
              onClick={() => handleDurationChange(s)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                duration === s 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-lg' 
                : 'bg-white/5 border-white/10 text-stone-400 hover:border-[#D4AF37]/50'
              }`}
            >
              {s >= 60 ? `${s/60}m` : `${s}s`}
            </button>
          ))}
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <button
            onClick={toggleTimer}
            className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
              isActive 
              ? 'bg-stone-800 text-stone-200 border border-white/10' 
              : 'bg-[#D4AF37] text-white'
            }`}
          >
            {isActive ? (
              <><Pause size={20} /> Pausar Silencio</>
            ) : (
              <><Play size={20} /> Iniciar Silencio ({duration}S)</>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={resetTimer}
              className="py-4 rounded-3xl bg-white/5 border border-white/10 text-stone-400 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>

            <button 
              onClick={handleComplete}
              className="py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <CheckCircle2 size={16} /> Marcar Hecho
            </button>
          </div>
        </div>

        {isFinished && (
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in">
             <p className="text-emerald-300 text-sm font-medium italic">
                El silencio ha florecido en tu interior. Microacción completada ✨
             </p>
          </div>
        )}
      </SacredCard>

      {/* Guide/Tip */}
      <div className="text-center px-8 opacity-60">
        <Wind className="mx-auto text-stone-400 mb-4" size={24} />
        <p className="text-xs md:text-sm text-stone-300 italic font-serif leading-relaxed">
          "En la quietud total, la voz del Espíritu se vuelve inconfundible. <br/> No busques nada, solo permite que lo que es, sea."
        </p>
      </div>
    </div>
  );
}
