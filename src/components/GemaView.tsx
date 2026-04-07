import React, { useState, useEffect } from 'react';
import { Repeat, Quote, Zap, Heart, Share2, Timer, CheckCircle, Bell } from 'lucide-react';
import { GemaIcon } from './GemaIcon';
import { Gema } from '../types';
import { supabase } from '../lib/supabase';

interface GemaViewProps {
  currentGema: Gema | null;
  onNextGema: (category?: string) => void;
  userId?: string;
  categories: string[];
}

export function GemaView({ currentGema, onNextGema, userId, categories }: GemaViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  if (!currentGema) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse">
        <GemaIcon size={40} className="text-stone-200 mb-4" />
        <p className="text-stone-400 font-serif italic">Sintonizando sabiduría...</p>
      </div>
    );
  }
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
    if (userId === 'guest') {
      alert("🕊️ Modo Invitado: Debes iniciar sesión con Google para guardar gemas en tus favoritos.");
      setLoading(false);
      return;
    }

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
      <div className="space-y-4 pt-4">
        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#D4AF37]">Filtrar por faceta</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => handleNextWithFade()} 
            className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${!currentGema.category ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 text-stone-400 border-white/5 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => handleNextWithFade(cat)} 
              className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${currentGema.category === cat ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 text-stone-400 border-white/5 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <GemaIcon size={18} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white italic">{currentGema.category || "Inspiración"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-3 rounded-full transition-all border border-white/5 ${isFavorite ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-stone-400 hover:text-red-400 hover:bg-white/10'}`}
            title="Guardar en favoritos"
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-[#D4AF37] hover:bg-white/10 transition-all border border-white/5"
            title="Compartir gema"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => handleNextWithFade()} 
            className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-[#D4AF37] hover:bg-white/10 transition-all border border-white/5"
            title="Otra gema"
          >
            <Repeat size={18} />
          </button>
        </div>
      </div>

      <div className="sacred-card p-10 rounded-[3rem] shadow-xl space-y-8 relative group overflow-hidden">
        <Quote className="text-stone-900/5 absolute top-8 left-6 -z-10" size={80} />
        
        <div className="lg:sticky lg:top-24">
          <div className="sacred-card p-12 text-stone-100 shadow-2xl relative overflow-hidden group border-white/10">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
            <p className="text-2xl md:text-3xl font-serif italic text-white leading-snug mb-6">"{currentGema.phrase}"</p>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-[0.3em]">— {currentGema.author || "Un Curso de Milagros"}</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {currentGema.idea && (
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-2">Idea Guía</span>
              <p className="text-base text-stone-200 leading-relaxed font-medium">{currentGema.idea}</p>
            </div>
          )}
          {currentGema.action && (
            <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${isTimerRunning ? 'bg-stone-900/40 border-[#D4AF37]/30 shadow-2xl scale-[1.02]' : showDone ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap size={16} className={isTimerRunning ? "text-[#D4AF37] animate-pulse" : "text-[#D4AF37]"} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isTimerRunning ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`}>{isTimerRunning ? 'Sintonizando...' : 'Microacción'}</span>
                </div>
                {showDone && <CheckCircle size={16} className="text-green-500 animate-bounce" />}
                {!isTimerRunning && !showDone && (
                  <div className="flex gap-1">
                    {[30, 60, 120].map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`w-9 h-9 rounded-full text-[9px] font-black flex items-center justify-center transition-all border ${duration === d ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 text-stone-400 border-white/5 hover:bg-white/10'}`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed mb-8 ${isTimerRunning ? 'text-stone-200 italic font-serif' : 'text-stone-100 font-medium'}`}>{currentGema.action}</p>
              
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
            <div className="pt-6 border-t border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-2">Mantra del día</span>
              <p className="text-sm font-serif italic text-stone-300">"{currentGema.mantra}"</p>
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
