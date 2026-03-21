import { BookOpen, MessageCircle, Wind, ArrowRight, Check, Sparkles, Crown } from 'lucide-react';
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
          Un espacio de quietud diseñado para acompañar tu estudio de{' '}
          <span className="text-stone-900 italic font-serif">Un Curso de Milagros</span>.
        </p>
        <button
          onClick={onShowAuth}
          className="px-10 py-5 bg-slate-900 text-[#D4AF37] rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
        >
          Comenzar mi viaje <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>
        <p className="text-xs text-stone-400">Gratis para empezar · Sin tarjeta requerida</p>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <BookOpen className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Lecciones Diarias</h3>
          <p className="text-sm text-stone-400 leading-relaxed">
            Accede al resumen y práctica de la lección que te corresponde hoy de forma instantánea.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <GemaIcon className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Gemas de Sabiduría</h3>
          <p className="text-sm text-stone-400 leading-relaxed">
            Inspiraciones aleatorias y temáticas para elevar tu vibración en momentos de duda.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3 hover:shadow-xl transition-all">
          <MessageCircle className="text-[#D4AF37]" size={32} />
          <h3 className="text-xl font-bold font-serif">Guía Espiritual IA</h3>
          <p className="text-sm text-stone-400 leading-relaxed">
            Un chat inteligente entrenado en la profundidad del Curso para despejar tus dudas.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="w-full max-w-5xl px-6 py-12" id="precios">
        <div className="text-center mb-10 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Planes</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Simple y transparente</h2>
          <p className="text-sm text-stone-400 max-w-md mx-auto">Empieza gratis y desbloquea todo cuando estés lista para profundizar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-stone-700">Gratis</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-stone-900">$0</span>
                <span className="text-stone-400 text-sm ml-1">/mes</span>
              </div>
            </div>
            <ul className="space-y-3">
              {['5 mensajes al Guía/día', '3 Gemas por día', 'Resúmenes de lecciones', 'Acceso básico al Curso'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-stone-600">
                  <Check size={14} className="text-stone-300 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onShowAuth}
              className="w-full py-4 rounded-2xl bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider hover:bg-stone-200 transition-all"
            >
              Empezar gratis
            </button>
          </div>

          {/* Premium */}
          <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl tracking-wider uppercase">
              Popular
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                Premium <Crown size={18} className="text-[#D4AF37]" />
              </h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-stone-400 text-sm ml-1">/mes</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">o $71.99/año (−40%)</p>
            </div>
            <ul className="space-y-3">
              {[
                'Chat con el Guía ilimitado',
                'Gemas ilimitadas',
                'Guardar favoritos y frases',
                'Sonidos de meditación',
                'Sin interrupciones',
                'Soporte prioritario',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-stone-200">
                  <Sparkles size={12} className="text-[#D4AF37] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onShowAuth}
              className="w-full py-4 rounded-2xl bg-[#D4AF37] text-white text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Comenzar Premium
            </button>
          </div>
        </div>
      </div>

      {/* Quote Preview */}
      <div className="w-full max-w-2xl px-6 py-12 text-center italic space-y-4">
        <Wind className="mx-auto text-stone-200" size={32} />
        <h2 className="text-xl md:text-2xl font-serif text-stone-600 leading-relaxed">
          "Nada real puede ser amenazado. Nada irreal existe. En esto radica la paz de Dios."
        </h2>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl px-6 py-10 mt-auto border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-900">Alumbrar | Un Espacio de Quietud</p>
          <p className="text-xs text-stone-400 max-w-sm">
            Diseñado para la paz interior. Basado en <em>Un Curso de Milagros</em>.
          </p>
        </div>
        <div className="flex gap-8">
          <a href="/privacy.html" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] transition-colors">Privacidad</a>
          <a href="/terms.html" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] transition-colors">Términos</a>
        </div>
      </footer>
    </div>
  );
}
