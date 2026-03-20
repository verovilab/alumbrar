import React from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface LessonsViewProps {
  selectedLesson: number | null;
  setSelectedLesson: (num: number | null) => void;
  dayOfYear: number;
  loadLesson: (num: number) => void;
  isLoadingLesson: boolean;
  lessonContent: string | null;
}

export function LessonsView({ 
  selectedLesson, 
  setSelectedLesson, 
  dayOfYear, 
  loadLesson, 
  isLoadingLesson, 
  lessonContent 
}: LessonsViewProps) {
  return (
    <div className="animate-fade-up">
      {!selectedLesson ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif font-bold text-stone-900 text-center">Libro de Ejercicios</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] text-center font-bold">365 Lecciones de Transformación</p>
          </div>
          <div className="grid grid-cols-5 gap-2 pb-10 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 custom-scrollbar">
            {Array.from({ length: 365 }, (_, i) => (
              <button 
                key={i} 
                onClick={() => loadLesson(i + 1)} 
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold border transition-all hover:scale-105 active:scale-90 ${i+1 === dayOfYear ? 'bg-stone-900 text-[#D4AF37] border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedLesson(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-stone-900 transition-colors">
            <ChevronLeft size={14} /> Volver al Índice
          </button>
          <div className="bg-white p-10 rounded-[2.5rem] border border-stone-50 shadow-lg min-h-[400px]">
            <div className="mb-6">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] block mb-1">Un Curso de Milagros</span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 italic">Lección {selectedLesson}</h3>
            </div>
            {isLoadingLesson ? (
              <div className="py-20 flex flex-col items-center gap-4 text-stone-200">
                <RefreshCw className="animate-spin" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Buscando la Luz...</p>
              </div>
            ) : (
              <FormattedText text={lessonContent || ''} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
