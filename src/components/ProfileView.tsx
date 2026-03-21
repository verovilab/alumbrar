import React, { useState, useEffect } from 'react';
import { User, Award, BookOpen, Heart, Clock, LogOut, Settings, Share2 } from 'lucide-react';
import { GemaIcon } from './GemaIcon';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  session: any;
  onSignOut: () => void;
}

export function ProfileView({ session, onSignOut }: ProfileViewProps) {
  const [stats, setStats] = useState({
    gemsSeen: 0,
    phrasesSaved: 0,
    lessonsProgress: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Simular o traer de DB
    const { count: gemCount } = await supabase.from('user_favorites').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
    const { count: snippetCount } = await supabase.from('user_snippets').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
    
    setStats({
      gemsSeen: gemCount || 0,
      phrasesSaved: snippetCount || 0,
      lessonsProgress: Math.floor(Math.random() * 365) // Demo hasta implementar progreso real
    });
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Alumbrar - Un Espacio de Quietud',
          text: 'Te comparto esta App para estudiar Un Curso de Milagros. Me está ayudando mucho a encontrar paz.',
          url: 'https://alumbrar.com.ar',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Perfil Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center border-4 border-stone-50 shadow-xl overflow-hidden">
          {session.user.user_metadata.avatar_url ? (
            <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-[#D4AF37]" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">{session.user.user_metadata.full_name || "Buscador de Paz"}</h2>
          <p className="text-stone-400 text-sm mt-1">{session.user.email}</p>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<GemaIcon size={20} />} value={stats.gemsSeen} label="Gemas" />
        <StatCard icon={<Heart size={20} />} value={stats.phrasesSaved} label="Favoritos" />
        <StatCard icon={<BookOpen size={20} />} value={stats.lessonsProgress} label="Lección" />
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <button 
          onClick={handleShareApp}
          className="w-full flex items-center justify-between p-5 bg-[#FAF8F5] rounded-3xl hover:bg-stone-100 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-900 group-hover:scale-110 transition-transform">
              <Share2 size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-900">Compartir Alumbrar</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Invita a otros a la paz</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onSignOut}
          className="w-full flex items-center justify-between p-5 bg-stone-50 rounded-3xl hover:bg-red-50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-300 group-hover:text-red-500 group-hover:scale-110 transition-transform">
              <LogOut size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-900">Cerrar Sesión</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Hasta pronto</p>
            </div>
          </div>
        </button>
      </div>

      {/* Footer Motivacional */}
      <div className="text-center pt-8 border-t border-stone-50">
        <Clock size={20} className="mx-auto text-stone-200 mb-2" />
        <p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.3em]">Caminamos juntos en este despertar</p>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-stone-100 text-center space-y-1 shadow-sm">
      <div className="text-[#D4AF37] flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{label}</p>
    </div>
  );
}
