import React, { useState, useEffect } from 'react';
import { Repeat, Quote, Zap, Heart } from 'lucide-react';
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

  useEffect(() => {
    if (userId) {
      checkIfFavorite();
    }
  }, [currentGema, userId]);

  const checkIfFavorite = async () => {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('gema_id', currentGema.id)
      .single();
    
    setIsFavorite(!!data);
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
          .eq('gema_id', currentGema.id);
        setIsFavorite(false);
      } else {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            gema_id: currentGema.id
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Selector de Categorías */}
      <div className="space-y-4 pt-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Filtrar por faceta</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => onNextGema()} 
            className={`px-5 py-3 rounded-full text-[10px] font-bold transition-all border ${!currentGema.category ? 'bg-stone-900 text-[#D4AF37] border-stone-900' : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200'}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => onNextGema(cat)} 
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
          <button onClick={() => onNextGema()} className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-stone-900 transition-colors">
            <Repeat size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl space-y-8 relative group">
        <Quote className="text-stone-50 absolute top-8 left-6 -z-10" size={80} />
        <p className="text-xl font-serif italic text-stone-900 leading-snug">"{currentGema.phrase}"</p>
        
        <div className="space-y-8">
          {currentGema.idea && (
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2">Idea Guía</span>
              <p className="text-sm text-stone-600 leading-relaxed">{currentGema.idea}</p>
            </div>
          )}
          {currentGema.action && (
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-[#D4AF37]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">Microacción (30-120s)</span>
              </div>
              <p className="text-sm text-stone-700 font-medium">{currentGema.action}</p>
            </div>
          )}
          {currentGema.mantra && (
            <div className="pt-4 border-t border-stone-50">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block mb-1">Mantra</span>
              <p className="text-xs font-serif italic text-stone-400">"{currentGema.mantra}"</p>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => onNextGema(currentGema.category)} className="w-full py-5 bg-stone-900 text-[#D4AF37] rounded-full text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
        Otra Gema de {currentGema.category || "Sabiduría"}
      </button>
    </div>
  );
}
