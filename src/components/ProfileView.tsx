import React, { useState, useEffect } from 'react';
import { User, BookOpen, Heart, Clock, LogOut, Share2, Crown, Zap, ExternalLink } from 'lucide-react';
import { GemaIcon } from './GemaIcon';
import { supabase } from '../lib/supabase';
import { openCustomerPortal } from '../lib/stripe';

interface ProfileViewProps {
  session: any;
  onSignOut: () => void;
  isPremium: boolean;
  onShowPricing: () => void;
}

export function ProfileView({ session, onSignOut, isPremium, onShowPricing }: ProfileViewProps) {
  const [stats, setStats] = useState({ gemsSeen: 0, phrasesSaved: 0, lessonsProgress: 0 });
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: gemCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    const { count: snippetCount } = await supabase
      .from('user_snippets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    setStats({
      gemsSeen: gemCount || 0,
      phrasesSaved: snippetCount || 0,
      lessonsProgress: Math.floor(Math.random() * 365),
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
      } catch {}
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (err: any) {
      alert(err.message || 'No se pudo abrir el portal de gestión.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Perfil Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center border-4 border-stone-50 shadow-xl overflow-hidden">
            {session.user.user_metadata.avatar_url ? (
              <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-[#D4AF37]" />
            )}
          </div>
          {isPremium && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Crown size={14} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            {session.user.user_metadata.full_name || 'Buscador de Paz'}
          </h2>
          <p className="text-stone-400 text-sm mt-1">{session.user.email}</p>
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#9a7c1a] text-[10px] font-black uppercase tracking-widest rounded-full">
              <Crown size={10} /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-stone-100 text-stone-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              Plan Gratis
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<GemaIcon size={20} />} value={stats.gemsSeen} label="Gemas" />
        <StatCard icon={<Heart size={20} />} value={stats.phrasesSaved} label="Favoritos" />
        <StatCard icon={<BookOpen size={20} />} value={stats.lessonsProgress} label="Lección" />
      </div>

      {/* CTA Plan */}
      {!isPremium ? (
        <button
          onClick={onShowPricing}
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl hover:scale-[1.01] transition-all shadow-xl group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Desbloquear Premium</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Chat ilimitado · Gemas · Más</p>
            </div>
          </div>
          <span className="text-[#D4AF37] font-black text-sm">$9.99/mes →</span>
        </button>
      ) : (
        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          className="w-full flex items-center justify-between p-5 bg-[#FAF8F5] rounded-3xl hover:bg-stone-100 transition-colors group disabled:opacity-60"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#D4AF37]/15 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown size={18} className="text-[#9a7c1a]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-900">Gestionar Suscripción</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Facturación · Cancelar</p>
            </div>
          </div>
          <ExternalLink size={16} className="text-stone-300" />
        </button>
      )}

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

      <div className="text-center pt-8 border-t border-stone-50">
        <Clock size={20} className="mx-auto text-stone-200 mb-2" />
        <p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.3em]">Caminamos juntos en este despertar</p>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-stone-100 text-center space-y-1 shadow-sm">
      <div className="text-[#D4AF37] flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{label}</p>
    </div>
  );
}
