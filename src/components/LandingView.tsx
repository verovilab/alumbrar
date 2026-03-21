import { BookOpen, MessageCircle, Wind, ArrowRight } from 'lucide-react';
import { GemaIcon } from './GemaIcon';

interface LandingViewProps {
  onShowAuth: () => void;
}

export function LandingView({ onShowAuth }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans antialiased text-stone-900 selection:bg-[#D4AF37]/20 pt-8 md:pt-14">
      {/* Hero Section */}
      <div className="w-full max-w-5xl px-6 pt-8 pb-10 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center shadow-2xl mb-2 border border-slate-800">
           <img src="/favicon.png" alt="Logo" className="w-9/12 h-9/12 object-contain rounded-full" />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-slate-900">Alumbrar</h1>
        <p className="text-base md:text-lg text-stone-500 max-w-xl font-medium leading-relaxed">
          Un espacio de quietud diseñado para acompañar tu estudio de <span className="text-stone-900 italic font-serif">Un Curso de Milagros</span>.
        </p>
        <button 
          onClick={onShowAuth}
          className="px-10 py-5 bg-slate-900 text-[#D4AF37] rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
        >
          Comenzar mi viaje <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <BookOpen className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Lecciones Diarias</h3>
          <p className="text-sm text-stone-400 leading-relaxed">Accede al resumen y práctica de la lección que te corresponde hoy de forma instantánea.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <GemaIcon className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Gemas de Sabiduría</h3>
          <p className="text-sm text-stone-400 leading-relaxed">Inspiraciones aleatorias y temáticas para elevar tu vibración en momentos de duda.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <MessageCircle className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Guía Espiritual IA</h3>
          <p className="text-sm text-stone-400 cemetery-stone-400 leading-relaxed">Un chat inteligente entrenado en la profundidad del Curso para despejar tus dudas.</p>
        </div>
      </div>

      {/* Quote Preview */}
      <div className="w-full max-w-2xl px-6 py-12 text-center italic space-y-4">
        <Wind className="mx-auto text-stone-200" size={32} />
        <h2 className="text-xl md:text-2xl font-serif text-stone-600 leading-relaxed">
          "Nada real puede ser amenazado. Nada irreal existe. En esto radica la paz de Dios."
        </h2>
      </div>

      {/* Footer Público (Google Requirement) */}
      <footer className="w-full max-w-5xl px-6 py-10 mt-auto border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-900">Alumbrar | Un Espacio de Quietud</p>
          <p className="text-xs text-stone-400 max-w-sm">
            Diseñado para la paz interior. Basado en <em>Un Curso de Milagros</em>.
          </p>
        </div>
        <div className="flex gap-8 items-center">
          <a href="/privacy.html" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] transition-colors">Privacidad</a>
          <a href="/terms.html" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] transition-colors">Términos</a>
          <a href="https://tristanlohengrin.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] transition-colors">Música: CC BY</a>
        </div>
      </footer>
    </div>
  );
}
