import { BookOpen, MessageCircle, Wind, ArrowRight, Sparkles } from 'lucide-react';
import { GemaIcon } from './GemaIcon';

interface LandingViewProps {
  onShowAuth: () => void;
  onGuestAccess: () => void;
}

export function LandingView({ onShowAuth, onGuestAccess }: LandingViewProps) {
  return (
    <div className="min-h-screen text-mystic flex flex-col items-center justify-center font-inter pt-8 md:pt-14 relative overflow-hidden">
      {/* ATMOSPHERE BACKGROUND (Same as Home) */}
      <div className="fixed inset-0 z-[-1] bg-black">
        <img 
          src="/assets/bg-portal.png" 
          alt="Atmosphere" 
          className="w-full h-full object-cover opacity-60 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-5xl px-6 py-20 flex flex-col items-center text-center space-y-10 animate-fade-up">
      <div className="w-24 h-24 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.4)] animate-pulse-slow">
           <GemaIcon size={40} className="text-white" />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl md:text-9xl font-serif italic gold-text tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">Alumbrar</h1>
          <p className="text-xs md:text-base text-[#D4AF37] uppercase tracking-[0.6em] font-black opacity-100 decoration-[#D4AF37]/40 underline-offset-8 underline drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Santuario de Paz Interior</p>
        </div>
        
        <p className="text-stone-100 max-w-xl font-medium leading-relaxed italic font-serif text-xl md:text-2xl drop-shadow-lg">
          "Un espacio de quietud diseñado para acompañar tu despertar en <span className="text-[#D4AF37]">Un Curso de Milagros</span>."
        </p>

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={onShowAuth}
            className="flex-1 px-8 py-5 bg-[#D4AF37] text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            Iniciar Viaje <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
          <button 
            onClick={onGuestAccess}
            className="flex-1 px-8 py-5 sacred-card text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all border-[#D4AF37]/40 flex items-center justify-center gap-4 group shadow-xl"
          >
            Invitado <Sparkles size={18} className="text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <LandingFeature 
          icon={<BookOpen size={32} />} 
          title="Lecciones Diarias" 
          desc="Accede al resumen y práctica de la lección que te corresponde hoy de forma instantánea." 
        />
        <LandingFeature 
          icon={<GemaIcon size={32} />} 
          title="Gemas de Sabiduría" 
          desc="Inspiraciones aleatorias y temáticas para elevar tu vibración en momentos de duda." 
        />
        <LandingFeature 
          icon={<MessageCircle size={32} />} 
          title="El Guía IA" 
          desc="Un chat inteligente entrenado en la profundidad del Curso para despejar tus dudas." 
        />
      </div>

      {/* Quote Preview */}
      <div className="w-full max-w-2xl px-6 py-12 text-center italic space-y-4">
        <Wind className="mx-auto text-stone-200" size={32} />
        <h2 className="text-xl md:text-2xl font-serif text-stone-600 leading-relaxed">
          "Nada real puede ser amenazado. Nada irreal existe. En esto radica la paz de Dios."
        </h2>
      </div>

      {/* Footer Público */}
      <footer className="w-full max-w-5xl px-6 py-10 mt-auto border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10 backdrop-blur-sm">
        <div className="space-y-2">
          <p className="text-sm font-bold gold-text">Alumbrar | Santuario Sagrado</p>
          <p className="text-[10px] text-stone-500 max-w-sm uppercase tracking-widest">
            Diseñado para la paz interior. Basado en Un Curso de Milagros.
          </p>
        </div>
        <div className="flex gap-8">
          <a href="/privacy.html" className="text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-[#D4AF37] transition-colors">Privacidad</a>
          <a href="/terms.html" className="text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-[#D4AF37] transition-colors">Términos</a>
        </div>
      </footer>
    </div>
  );
}

function LandingFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] space-y-6 hover:bg-black/80 transition-all group overflow-hidden relative shadow-2xl">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
      <div className="text-[#D4AF37] mb-2">{icon}</div>
      <h3 className="text-2xl font-bold font-serif text-white italic">{title}</h3>
      <p className="text-base text-stone-300 leading-relaxed font-medium">{desc}</p>
    </div>
  )
}
