import React from 'react';
import { Home, BookOpen, Activity, MessageCircle, Heart, User } from 'lucide-react';

interface FloatingPortalProps {
  activeTab: string;
  onSetTab: (tab: any) => void;
}

export function FloatingPortal({ activeTab, onSetTab }: FloatingPortalProps) {
  const navItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Inicio' },
    { id: 'gems', icon: <Heart size={20} />, label: 'Gemas' },
    { id: 'practice', icon: <Activity size={20} />, label: 'Práctica' },
    { id: 'qa', icon: <MessageCircle size={20} />, label: 'Guía' },
    { id: 'profile', icon: <User size={20} />, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-md">
      <div className="floating-nav rounded-full py-4 px-8 flex items-center justify-between gap-2 overflow-hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetTab(item.id)}
              className={`relative p-3 rounded-full transition-all duration-500 group ${
                isActive 
                ? 'text-[#D4AF37] scale-110' 
                : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full animate-pulse-slow"></div>
              )}
              <div className="relative z-10">
                {item.icon}
              </div>
              
              {/* Tooltip or Label (optional) */}
              <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
