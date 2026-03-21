import React, { useState, useEffect } from 'react';
import { Repeat, Quote, Zap, Heart, Share2, Timer, CheckCircle, Bell } from 'lucide-react';
import { GemaIcon } from './GemaIcon';
import { Gema } from '../data/gemas';
import { supabase } from '../lib/supabase';

interface GemaViewProps {
  currentGema: Gema;
  onNextGema: (category?: string) => void;
  userId?: string;
  categories: string[];
}

export function GemaView({ currentGema, onNextGema, userId, categories }: GemaViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);
  
  // Timer States
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (userId) {
      checkIfFavorite();
    }
    // Si cambia la gema, resetear temporizador
    setIsTimerRunning(false);
    setTimeLeft(duration);
    setShowDone(false);
  }, [currentGema, userId, duration]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowDone(true);
      // Bell Sound / Visual FeedBack (Subtle Meditation Bell)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2560/2560-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const checkIfFavorite = async () => {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('gema_id', String(currentGema.id))
      .single();
    
    setIsFavorite(!!data);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gema de Sabiduría - Alumbrar',
          text: `"${currentGema.phrase}" \n\nTe comparto esto desde mi app Alumbrar.com.ar que creo te puede interesar.`,
          url: 'https://alumbrar.com.ar',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!userId || loading) return;
    setLoading(true);

    try {
      if (isFavorite) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('gema_id', String(currentGema.id));
        setIsFavorite(false);
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            gema_id: String(currentGema.id)
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextWithFade = (category?: string) => {
    setIsFading(true);
    setTimeout(() => {
      onNextGema(category);
      setIsFading(false);
    }, 400); // Duración de la animación (.animate-fade-out)
  };

  return (
    <div className={`space-y-6 transition-all duration-400 ${isFading ? 'animate-fade-out' : 'animate-fade-in'}`}>
      {/* Selector de Categorías */}
      <div className="space-y-4 pt-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Filtrar por faceta</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => handleNextWithFade()} 
            className={`px-5 py-3 rounded-full text-[10px] font-bold transition-all border ${!currentGema.category ? 'bg-stone-900 text-[#D4AF37] border-stone-900' : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200'}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => handleNextWithFade(cat)} 
              className={`px-5 py-3 rounded-full text-[10px] font-bold transition-all border ${currentGema.category === cat ? 'bg-stone-900 text-[#D4AF37] border-stone-900' : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-[#D4AF37]">
            <GemaIcon size={14} />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">{currentGema.category || "Inspiración"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-3 rounded-full transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-300 hover:text-red-400'}`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-stone-50 rounded-full text-stone-300 hover:text-stone-900 transition-colors"
          >
            <Share2 size={18} />
          </button>
          <button onClick={() => handleNextWithFade()} className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
            <Repeat size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl space-y-8 relative group overflow-hidden">
        <Quote className="text-stone-50 absolute top-8 left-6 -z-10" size={80} />
        
        <div className="space-y-6 text-center">
          <p className="text-xl font-serif italic text-stone-900 leading-snug">"{currentGema.phrase}"</p>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">— {currentGema.author || "Un Curso de Milagros"}</p>
        </div>
        
        <div className="space-y-8">
          {currentGema.idea && (
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2">Idea Guía</span>
              <p className="text-sm text-stone-600 leading-relaxed">{currentGema.idea}</p>
            </div>
          )}
          {currentGema.action && (
            <div className={`p-6 rounded-2xl border transition-all duration-700 ${isTimerRunning ? 'bg-stone-900 border-stone-800 shadow-2xl scale-[1.02]' : showDone ? 'bg-green-50 border-green-100' : 'bg-stone-50 border-stone-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={14} className={isTimerRunning ? "text-[#D4AF37] animate-pulse" : "text-[#D4AF37]"} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isTimerRunning ? 'text-stone-300' : 'text-stone-900'}`}>{isTimerRunning ? 'Practicando...' : 'Microacción'}</span>
                </div>
                {showDone && <CheckCircle size={14} className="text-green-500 animate-bounce" />}
                {!isTimerRunning && !showDone && (
                  <div className="flex gap-1">
                    {[30, 60, 120].map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`w-8 h-8 rounded-full text-[8px] font-bold flex items-center justify-center transition-all ${duration === d ? 'bg-stone-900 text-[#D4AF37]' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'}`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed mb-6 ${isTimerRunning ? 'text-stone-400 italic' : 'text-stone-700 font-medium'}`}>{currentGema.action}</p>
              
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  isTimerRunning 
                    ? 'bg-stone-800 text-stone-300 border border-white/5' 
                    : showDone 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : 'bg-[#D4AF37] text-white shadow-lg shadow-amber-100 hover:shadow-cyan-200 hover:bg-stone-900'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Timer size={16} className="animate-spin-slow" />
                    <span className="text-xs font-black uppercase tracking-widest font-mono">{timeLeft}s restantes</span>
                  </>
                ) : showDone ? (
                  <>
                    <CheckCircle size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">¡Práctica Completada!</span>
                  </>
                ) : (
                  <>
                    <Timer size={16} />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Practicar ahora ({duration}s)</span>
                  </>
                )}
              </button>
            </div>
          )}
          {currentGema.mantra && !isTimerRunning && (
            <div className="pt-4 border-t border-stone-50">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block mb-1">Mantra del día</span>
              <p className="text-xs font-serif italic text-stone-400">"{currentGema.mantra}"</p>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => handleNextWithFade(currentGema.category)} className="w-full py-5 bg-stone-900 text-[#D4AF37] rounded-full text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
        Otra Gema de {currentGema.category || "Sabiduría"}
      </button>
    </div>
  );
}
