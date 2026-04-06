import React from 'react';
import { Wind, BookOpen, MessageCircle, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { Altar } from './ui/Altar';
import { SacredCard } from './ui/SacredCard';
import { GemaIcon } from './GemaIcon';
import { Gema } from '../types';

interface HomeViewProps {
  dayOfYear: number;
  onLoadLesson: (num: number) => void;
  onSetTab: (tab: any) => void;
  currentGema: Gema | null;
  ritualState: {
    zen: boolean;
    lesson: boolean;
    practice: boolean;
    chat: boolean;
  };
  setRitualState: React.Dispatch<React.SetStateAction<any>>;
}

export function HomeView({ 
  dayOfYear, 
  onLoadLesson, 
  onSetTab, 
  currentGema, 
  ritualState, 
  setRitualState 
}: HomeViewProps) {
  
  const steps = [
    { id: 'zen', label: 'Silencio', icon: <Wind size={18} />, completed: ritualState.zen },
    { id: 'lesson', label: 'La Verdad', icon: <BookOpen size={18} />, completed: ritualState.lesson },
    { id: 'practice', label: 'Entrega', icon: <Activity size={18} />, completed: ritualState.practice },
    { id: 'chat', label: 'Guía', icon: <MessageCircle size={18} />, completed: ritualState.chat },
  ];

  const handleStepClick = (stepId: string) => {
    if (stepId === 'zen') {
      window.dispatchEvent(new CustomEvent('toggle-zen-audio', { detail: { action: 'play' } }));
      setRitualState((prev: any) => ({ ...prev, zen: true }));
    } else if (stepId === 'lesson') {
      onLoadLesson(dayOfYear);
      setRitualState((prev: any) => ({ ...prev, lesson: true }));
    } else if (stepId === 'practice') {
      onSetTab('practice');
      // La marca de completanza se hará en PracticeView al guardar
    } else if (stepId === 'chat') {
      onSetTab('qa');
      setRitualState((prev: any) => ({ ...prev, chat: true }));
    }
  };

  const quote = currentGema?.phrase || "Nada real puede ser amenazado. Nada irreal existe.";

  return (
    <div className="space-y-12 pb-32 animate-fade-in bg-ethereal min-h-screen">
      
      {/* 1. EL ALTAR DE BIENVENIDA */}
      <section className="pt-8">
        <Altar steps={steps} activeStep={0} />
      </section>

      {/* 2. CARTA DE IMPACTO: LA GEMA DIARIA */}
      <section className="px-2">
        <SacredCard glow className="text-center py-16">
          <Sparkles className="mx-auto text-[#D4AF37] mb-8" size={40} />
          <h2 className="text-2xl md:text-3xl font-serif italic text-stone-900 dark:text-stone-100 leading-relaxed mb-10 px-4">
            "{quote}"
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-[#D4AF37]/20"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-black">Sintonía Sagrada</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]/20"></div>
          </div>
        </SacredCard>
      </section>

      {/* 3. EL RITUAL PASO A PASO */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <div className="h-[1px] flex-1 bg-stone-100 dark:bg-stone-800"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Tu Camino de Hoy</h3>
          <div className="h-[1px] flex-1 bg-stone-100 dark:bg-stone-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          {/* Paso 1: Silencio */}
          <StepButton 
            title="Habitar el Silencio"
            desc="Respiración y sonido Zen"
            icon={<Wind size={24} />}
            completed={ritualState.zen}
            onClick={() => handleStepClick('zen')}
          />

          {/* Paso 2: La Verdad */}
          <StepButton 
            title={`Lección ${dayOfYear}`}
            desc="Escuchar la Verdad hoy"
            icon={<BookOpen size={24} />}
            completed={ritualState.lesson}
            onClick={() => handleStepClick('lesson')}
          />

          {/* Paso 3: Entrega */}
          <StepButton 
            title="Ceremonia de Entrega"
            desc="Revisión de tu sentir"
            icon={<Activity size={24} />}
            completed={ritualState.practice}
            onClick={() => handleStepClick('practice')}
          />

          {/* Paso 4: El Guía */}
          <StepButton 
            title="Consultar al Guía"
            desc="Claridad en el diálogo"
            icon={<MessageCircle size={24} />}
            completed={ritualState.chat}
            onClick={() => handleStepClick('chat')}
          />
        </div>
      </section>

      {/* Footer / Seed of Thought */}
      <footer className="text-center py-12 opacity-40">
        <p className="text-[10px] font-serif italic text-stone-500">
          "Solo la Verdad es verdad. No hay nada más."
        </p>
      </footer>
    </div>
  );
}

function StepButton({ title, desc, icon, completed, onClick }: { title: string, desc: string, icon: React.ReactNode, completed: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] text-left transition-all group relative overflow-hidden flex flex-col h-full sacred-card ${
        completed 
        ? 'border-[#D4AF37]/50 shadow-inner scale-[0.98]' 
        : 'hover:border-[#D4AF37]/40 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <div className={`p-4 rounded-2xl mb-6 inline-flex transition-all duration-500 ${completed ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/40 ring-4 ring-[#D4AF37]/10' : 'bg-white/5 text-stone-400 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10'}`}>
        {icon}
      </div>
      
      <div className="space-y-1">
        <h4 className={`text-sm md:text-base font-bold transition-colors ${completed ? 'text-[#D4AF37]' : 'text-stone-900 dark:text-stone-100'}`}>
          {title}
        </h4>
        <p className="text-[10px] md:text-xs text-stone-400 font-medium uppercase tracking-widest">{desc}</p>
      </div>

      <div className="mt-8 flex justify-end">
        {completed ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">Completado ✨</div>
        ) : (
          <ArrowRight className="text-stone-200 group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" size={20} />
        )}
      </div>
    </button>
  );
}
