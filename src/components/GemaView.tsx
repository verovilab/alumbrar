import React from 'react';
import { Star, Repeat, Quote, Zap } from 'lucide-react';
import { Gema } from '../data/gemas';

interface GemaViewProps {
  currentGema: Gema;
  onNextGema: () => void;
}

export function GemaView({ currentGema, onNextGema }: GemaViewProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white">
            <Star size={14} />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">{currentGema.category}</h3>
        </div>
        <button onClick={onNextGema} className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
          <Repeat size={18} />
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl space-y-8 relative group">
        <Quote className="text-stone-50 absolute top-8 left-6 -z-10" size={80} />
        <p className="text-xl font-serif italic text-stone-900 leading-snug">"{currentGema.phrase}"</p>
        
        <div className="space-y-8">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2">Idea Guía</span>
            <p className="text-sm text-stone-600 leading-relaxed">{currentGema.idea}</p>
          </div>
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-[#D4AF37]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">Microacción (30-120s)</span>
            </div>
            <p className="text-sm text-stone-700 font-medium">{currentGema.action}</p>
          </div>
          <div className="pt-4 border-t border-stone-50">
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block mb-1">Mantra</span>
            <p className="text-xs font-serif italic text-stone-400">"{currentGema.mantra}"</p>
          </div>
        </div>
      </div>

      <button onClick={onNextGema} className="w-full py-5 bg-stone-900 text-[#D4AF37] rounded-full text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
        Otra Gema
      </button>
    </div>
  );
}
