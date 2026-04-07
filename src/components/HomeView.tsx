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
    gems: boolean;
    journey: boolean;
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
    { id: 'lesson', label: 'Verdad', icon: <BookOpen size={18} />, completed: ritualState.lesson },
    { id: 'practice', label: 'Entrega', icon: <Activity size={18} />, completed: ritualState.practice },
    { id: 'chat', label: 'Guía', icon: <MessageCircle size={18} />, completed: ritualState.chat },
    { id: 'gems', label: 'Gema', icon: <Sparkles size={18} />, completed: ritualState.gems },
    { id: 'journey', label: 'Recorrido', icon: <Activity size={18} />, completed: ritualState.journey },
  ];

  const handleStepClick = (stepId: string) => {
    if (stepId === 'zen') {
      onSetTab('zen-practice');
    } else if (stepId === 'lesson') {
      onLoadLesson(dayOfYear);
      setRitualState((prev: any) => ({ ...prev, lesson: true }));
    } else if (stepId === 'practice') {
      onSetTab('practice');
    } else if (stepId === 'chat') {
      onSetTab('qa');
      setRitualState((prev: any) => ({ ...prev, chat: true }));
    } else if (stepId === 'gems') {
      onSetTab('gems');
      setRitualState((prev: any) => ({ ...prev, gems: true }));
    } else if (stepId === 'journey') {
      onSetTab('profile');
      setRitualState((prev: any) => ({ ...prev, journey: true }));
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
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#F5F5F4] leading-relaxed mb-12 px-6 drop-shadow-2xl">
            "{quote}"
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="h-[1px] w-16 bg-[#D4AF37]/30"></div>
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-black underline underline-offset-8 decoration-[#D4AF37]/20">Sintonía Sagrada</span>
            <div className="h-[1px] w-16 bg-[#D4AF37]/30"></div>
          </div>
        </SacredCard>
      </section>

      {/* 3. EL RITUAL PASO A PASO */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#D4AF37] opacity-80">Tu Camino de Hoy</h3>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
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

          {/* Paso 5: Gema */}
          <StepButton 
            title="Extraer una Gema"
            desc="Inspiración del alma"
            icon={<Sparkles size={24} />}
            completed={ritualState.gems}
            onClick={() => handleStepClick('gems')}
          />

          {/* Paso 6: Recorrido */}
          <StepButton 
            title="Ver mi recorrido"
            desc="Tu evolución sagrada"
            icon={<Activity size={24} />}
            completed={ritualState.journey}
            onClick={() => handleStepClick('journey')}
          />
        </div>
      </section>

      {/* Footer / Seed of Thought */}
      <footer className="text-center py-16 opacity-80 border-t border-white/5 mx-8">
        <p className="text-xs md:text-sm font-serif italic text-stone-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
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
      
      <div className="space-y-2">
        <h4 className={`text-lg md:text-xl font-bold transition-colors ${completed ? 'text-[#D4AF37]' : 'text-[#F5F5F4]'}`}>
          {title}
        </h4>
        <p className="text-xs md:text-sm text-stone-300 font-medium uppercase tracking-widest opacity-80">{desc}</p>
      </div>

      <div className="mt-8 flex justify-end">
        {completed ? (
          <div className="bg-emerald-500/20 text-emerald-300 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">Completado ✨</div>
        ) : (
          <ArrowRight className="text-[#D4AF37]/60 group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" size={24} />
        )}
      </div>
    </button>
  );
}
