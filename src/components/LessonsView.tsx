import React, { useMemo } from 'react';
import { ChevronLeft, RefreshCw, Bookmark, Share2, Wind, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { supabase } from '../lib/supabase';

interface LessonsViewProps {
  selectedLesson: number | null;
  setSelectedLesson: (num: number | null) => void;
  dayOfYear: number;
  loadLesson: (num: number) => void;
  isLoadingLesson: boolean;
  lessonContent: string | null;
  userId?: string;
}

export function LessonsView({ 
  selectedLesson, 
  setSelectedLesson, 
  dayOfYear, 
  loadLesson, 
  isLoadingLesson, 
  lessonContent,
  userId
}: LessonsViewProps) {
  const extractLessonParts = (content: string | null) => {
    if (!content) return { intro: '', concept: 'Cargando...', explanation: '', practice: '' };
    
    const parts = {
      intro: '',
      concept: '',
      explanation: '',
      practice: ''
    };

    // 1. Extraer Intro (todo lo previo al punto 1)
    const introMatch = content.match(/^([\s\S]*?)(?=(?:\*\*|#|)\s*1\.)/i);
    parts.intro = introMatch ? introMatch[1].trim() : '';

    // 2. Extraer Concepto (sección 1)
    const conceptMatch = content.match(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?[\s\S]*?(?=(?:\*\*|#|)\s*2\.|$)/i);
    if (conceptMatch) {
      parts.concept = conceptMatch[0].replace(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?\s*/i, '').trim();
    }

    // 3. Extraer Explicación (sección 2)
    const explanationMatch = content.match(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda[\s\S]*?(?=(?:\*\*|#|)\s*3\.|$)/i);
    if (explanationMatch) {
      parts.explanation = explanationMatch[0].replace(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda.*?:?\s*/i, '').trim();
    }

    // 4. Extraer Práctica (sección 3)
    const practiceMatch = content.match(/(?:\*\*|#|)\s*3\.\s*Una Práctica Concreta[\s\S]*?$/i);
    if (practiceMatch) {
      parts.practice = practiceMatch[0].replace(/(?:\*\*|#|)\s*3\.\s*Una Práctica Concreta.*?:?\s*/i, '').trim();
    }

    return parts;
  };

  const lessonParts = useMemo(() => extractLessonParts(lessonContent), [lessonContent]);

  const saveSnippet = async () => {
    if (!userId || !lessonContent) return;
    try {
      await supabase.from('user_snippets').insert({
        user_id: userId,
        content: lessonContent.substring(0, 500) + (lessonContent.length > 500 ? '...' : ''),
        source: `Lección ${selectedLesson}`
      });
      alert('Lección guardada en tus tesoros ✨');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && lessonContent) {
      try {
        await navigator.share({
          title: `Lección ${selectedLesson} - Alumbrar`,
          text: `Te comparto la Lección ${selectedLesson} de Un Curso de Milagros desde Alumbrar.com.ar. \n\n"${lessonContent.substring(0, 200)}..."`,
          url: 'https://alumbrar.com.ar',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };
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
            <div className="mb-6 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] block mb-1">Un Curso de Milagros</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 italic">Lección {selectedLesson}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleShare}
                  className="p-3 bg-stone-50 rounded-full text-stone-300 hover:text-stone-900 transition-colors"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={saveSnippet}
                  className="p-3 bg-stone-50 rounded-full text-stone-300 hover:text-stone-900 transition-colors"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
            {isLoadingLesson ? (
              <div className="py-20 flex flex-col items-center gap-4 text-stone-200">
                <RefreshCw className="animate-spin" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Buscando la Luz...</p>
              </div>
            ) : (
              (!lessonParts.explanation && !lessonParts.practice) ? (
                <FormattedText text={lessonContent || ''} />
              ) : (
                <div className="space-y-6">
                  {lessonParts.intro && (
                    <LessonSection 
                      title="Apertura" 
                      content={lessonParts.intro} 
                      icon={<Wind size={18} />} 
                      color="bg-white border-stone-100 text-stone-600"
                      eyebrow="El Camino de la Paz"
                    />
                  )}

                  <LessonSection 
                    title="1. El Concepto Central" 
                    content={lessonParts.concept} 
                    icon={<Sparkles size={18} />} 
                    color="bg-stone-900 border-stone-800 text-[#FFF9F0]"
                    accent="text-[#D4AF37]"
                    eyebrow={`Lección ${selectedLesson}`}
                    highlight
                  />

                  {lessonParts.explanation && (
                    <LessonSection 
                      title="2. Explicación Profunda" 
                      content={lessonParts.explanation} 
                      icon={<BrainCircuit size={18} />} 
                      color="bg-emerald-50/30 border-emerald-100 text-emerald-900"
                      eyebrow="Sabiduría Diaria"
                    />
                  )}

                  {lessonParts.practice && (
                    <LessonSection 
                      title="3. Una Práctica Concreta" 
                      content={lessonParts.practice} 
                      icon={<Zap size={18} />} 
                      color="bg-amber-50/40 border-amber-100 text-amber-900"
                      eyebrow="Acción Consciente"
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonSection({ title, content, icon, color, eyebrow, accent = "text-inherit", highlight = false }: { 
  title: string, 
  content: string, 
  icon: React.ReactNode, 
  color: string, 
  eyebrow: string,
  accent?: string,
  highlight?: boolean
}) {
  return (
    <div className={`${color} border rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md group relative overflow-hidden`}>
      {highlight && (
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[60px] group-hover:scale-110 transition-transform duration-1000"></div>
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${accent} opacity-60`}>
            {eyebrow}
          </span>
          <div className={`${highlight ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-stone-500/10 opacity-40'} p-2 rounded-xl`}>
            {icon}
          </div>
        </div>
        <h4 className="text-xl font-serif font-bold italic mb-4 leading-tight group-hover:translate-x-1 transition-transform">
          {title}
        </h4>
        <div className={`h-[1px] w-12 ${highlight ? 'bg-[#D4AF37]/30' : 'bg-current opacity-10'} mb-6`}></div>
        <p className={`text-sm leading-relaxed ${highlight ? 'opacity-90' : 'opacity-70'} font-medium whitespace-pre-line`}>
          {content}
        </p>
      </div>
    </div>
  );
}
