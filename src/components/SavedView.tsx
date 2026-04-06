import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Trash2 } from 'lucide-react';
import { GemaIcon } from './GemaIcon';
import { supabase } from '../lib/supabase';
import { GEMAS, Gema, GemaCategory } from '../data/gemas';

interface SavedViewProps {
  userId: string;
}

interface FavoriteEntry {
  id: string;
  gema_id: string;
  user_id: string;
  displayData?: Partial<Gema>;
  created_at?: string;
}

interface SnippetEntry {
  id: string;
  content: string;
  source: string;
  created_at: string;
}

export function SavedView({ userId }: SavedViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'gems' | 'snippets'>('gems');
  const [savedGems, setSavedGems] = useState<FavoriteEntry[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<SnippetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedData();
  }, [activeSubTab, userId]);

  const fetchSavedData = async () => {
    setIsLoading(true);
    try {
      if (activeSubTab === 'gems') {
        const { data: favorites, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;

        // 1. Identificar gemas locales y remotas
        const resolved: FavoriteEntry[] = [];
        const remoteIds: string[] = [];

        for (const fav of (favorites || [])) {
          const localGema = GEMAS.find((g: Gema) => String(g.id) === fav.gema_id);
          if (localGema) {
            resolved.push({ ...fav, displayData: localGema });
          } else {
            // Es remota, guardar ID para consulta masiva
            remoteIds.push(fav.gema_id);
            resolved.push({ ...fav }); // Placeholder momentáneo
          }
        }

        // 2. Fetch de gemas remotas si existen
        if (remoteIds.length > 0) {
          const { data: remoteGems } = await supabase
            .from('gems')
            .select('*')
            .in('id', remoteIds);

          if (remoteGems) {
            remoteGems.forEach(rg => {
              const favIndex = resolved.findIndex(f => f.gema_id === rg.id);
              if (favIndex !== -1) {
                resolved[favIndex].displayData = rg;
              }
            });
          }
        }

        // Finalizar resolución para los que aún no tengan data
        resolved.forEach(f => {
           if (!f.displayData) {
             f.displayData = { phrase: "Gema no encontrada", category: "Presencia" as GemaCategory };
           }
        });

        setSavedGems(resolved);
      } else {
        const { data, error } = await supabase
          .from('user_snippets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSavedSnippets(data || []);
      }
    } catch (err) {
      console.error("Error fetching saved data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    await supabase.from('user_favorites').delete().eq('id', id);
    setSavedGems(prev => prev.filter(g => g.id !== id));
  };

  const removeSnippet = async (id: string) => {
    await supabase.from('user_snippets').delete().eq('id', id);
    setSavedSnippets(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-[#D4AF37] italic">Tus Tesoros</h2>
        <p className="text-stone-400 text-xs uppercase tracking-widest font-black">Momentos de paz que has decidido conservar.</p>
      </div>

      {/* Selector de Sub-pestañas */}
      <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl max-w-xs mx-auto border border-white/5">
        <button 
          onClick={() => setActiveSubTab('gems')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'gems' ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
        >
          <Heart size={14} fill={activeSubTab === 'gems' ? "currentColor" : "none"} />
          Gemas
        </button>
        <button 
          onClick={() => setActiveSubTab('snippets')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'snippets' ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
        >
          <Bookmark size={14} fill={activeSubTab === 'snippets' ? "currentColor" : "none"} />
          Frases
        </button>
      </div>

      {userId === 'guest' ? (
        <div className="sacred-card p-12 text-center space-y-6 animate-fade-up">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
            <Heart size={40} className="animate-pulse-slow" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-serif font-bold text-white italic">Tus Tesoros te esperan</h3>
            <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
              En el modo invitado puedes explorar el Santuario, pero para conservar gemas y frases en tu historial sagrado, necesitas identificarte.
            </p>
          </div>
          <div className="pt-4">
             <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.3em]">Cierra sesión e inicia con Google para comenzar</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20 text-stone-300">
          <div className="animate-pulse font-serif italic text-lg">Sintonizando tus tesoros...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubTab === 'gems' ? (
            savedGems.length > 0 ? (
              savedGems.map((fav) => (
                <div key={fav.id} className="sacred-card p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <GemaIcon size={14} className="text-[#D4AF37]" />
                       <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{fav.displayData?.category}</span>
                    </div>
                    <button onClick={() => removeFavorite(fav.id)} className="p-2 text-stone-200 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="font-serif italic text-stone-100 mb-2">"{fav.displayData?.phrase}"</p>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest text-right">— {fav.displayData?.author || "Un Curso de Milagros"}</p>
                </div>
              ))
            ) : (
              <EmptyState message="Aún no has guardado ninguna gema." icon={<Heart size={40} />} />
            )
          ) : (
            savedSnippets.length > 0 ? (
              savedSnippets.map((snip) => (
                <div key={snip.id} className="sacred-card p-6 rounded-[2rem] border-white/5 relative group">
                  <button onClick={() => removeSnippet(snip.id)} className="absolute top-4 right-4 p-2 text-stone-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <Bookmark size={12} className="text-stone-400" />
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-black">{snip.source || "Marcador"}</span>
                  </div>
                  <p className="text-sm text-stone-200 leading-relaxed italic">"{snip.content}"</p>
                  <div className="mt-4 flex justify-end text-[8px] text-stone-300 uppercase tracking-tighter">
                    {new Date(snip.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="Aún no has marcado ninguna frase." icon={<Bookmark size={40} />} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-stone-200 space-y-4">
      {icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
