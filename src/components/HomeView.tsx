import React from 'react';
import { Wind, BookOpen, Star } from 'lucide-react';

interface HomeViewProps {
  dayOfYear: number;
  onLoadLesson: (num: number) => void;
  onSetTab: (tab: 'home' | 'gems' | 'qa' | 'lessons') => void;
  categories: string[];
}

export function HomeView({ dayOfYear, onLoadLesson, onSetTab, categories }: HomeViewProps) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <Wind className="text-[#D4AF37] mb-6" size={24} />
        <h2 className="text-xl font-serif italic leading-relaxed">"Nada real puede ser amenazado. Nada irreal existe."</h2>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-black">Tu guía espiritual</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onLoadLesson(dayOfYear)} className="bg-white border border-stone-100 p-8 rounded-[2rem] text-left hover:shadow-lg transition-all group">
          <BookOpen className="text-[#D4AF37] mb-4 transition-transform group-hover:scale-110" size={20} />
          <span className="text-xs font-bold text-stone-900 block">Lección {dayOfYear}</span>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Sugerida hoy</p>
        </button>
        <button onClick={() => onSetTab('gems')} className="bg-[#FAF8F5] p-8 rounded-[2rem] text-left hover:shadow-lg transition-all group">
          <Star className="text-[#D4AF37] mb-4 transition-transform group-hover:scale-110" size={20} />
          <span className="text-xs font-bold text-stone-900 block">Gema Diaria</span>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Inspiración</p>
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Explorar Categorías</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => onSetTab('gems')} className="px-5 py-3 bg-white border border-stone-100 rounded-full text-[10px] font-bold text-stone-500 whitespace-nowrap hover:border-[#D4AF37] hover:text-stone-900 transition-all">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
