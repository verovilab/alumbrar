import React from 'react';
import { Wind, BookOpen, Star } from 'lucide-react';

interface HomeViewProps {
  dayOfYear: number;
  onLoadLesson: (num: number) => void;
  onSetTab: (tab: 'home' | 'gems' | 'qa' | 'lessons') => void;
  categories: string[];
  currentGema: any;
}

export function HomeView({ dayOfYear, onLoadLesson, onSetTab, categories, currentGema }: HomeViewProps) {
  const quote = currentGema?.phrase || "Nada real puede ser amenazado. Nada irreal existe.";
  
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-stone-900 rounded-[2.5rem] p-10 lg:p-16 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <Wind className="text-[#D4AF37] mb-6 lg:mb-8" size={32} />
        <h2 className="text-xl lg:text-3xl lg:leading-relaxed font-serif italic leading-relaxed">"{quote}"</h2>
        <div className="mt-8 flex items-center gap-3">
          <span className="text-[8px] lg:text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">Tu guía espiritual</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:gap-8">
        <button onClick={() => onLoadLesson(dayOfYear)} className="bg-white border border-stone-100 p-8 lg:p-12 rounded-[2rem] text-left hover:shadow-lg transition-all group">
          <BookOpen className="text-[#D4AF37] mb-4 lg:mb-6 transition-transform group-hover:scale-110" size={24} />
          <span className="text-xs lg:text-sm font-bold text-stone-900 block">Lección {dayOfYear}</span>
          <p className="text-[10px] lg:text-xs text-stone-400 uppercase tracking-widest mt-1">Sugerida hoy</p>
        </button>
        <button onClick={() => onSetTab('gems')} className="bg-[#FAF8F5] p-8 lg:p-12 rounded-[2rem] text-left hover:shadow-lg transition-all group">
          <Star className="text-[#D4AF37] mb-4 lg:mb-6 transition-transform group-hover:scale-110" size={24} />
          <span className="text-xs lg:text-sm font-bold text-stone-900 block">Gema Diaria</span>
          <p className="text-[10px] lg:text-xs text-stone-400 uppercase tracking-widest mt-1">Inspiración</p>
        </button>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-stone-300">Explorar Categorías</h4>
        <div className="flex gap-2 lg:gap-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => onSetTab('gems')} className="px-5 py-3 lg:px-8 lg:py-4 bg-white border border-stone-100 rounded-full text-[10px] lg:text-xs font-bold text-stone-500 whitespace-nowrap hover:border-[#D4AF37] hover:text-stone-900 transition-all">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
