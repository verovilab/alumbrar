import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: '¡Revisa tu email para confirmar tu cuenta!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl p-6 sm:p-12 border border-stone-100 space-y-8 animate-fade-up">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Sparkles className="text-[#D4AF37]" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Alumbrar</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">Un Espacio de Quietud</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 text-[#D4AF37] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Crear Cuenta' : 'Entrar')}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-stone-300 bg-white px-4">O continúa con</div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-stone-100 text-stone-600 py-4 rounded-2xl font-bold text-sm shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>

        <p className="text-center text-xs text-stone-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿Eres nuevo aquí?'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 font-bold text-stone-900 hover:text-[#D4AF37] transition-colors"
          >
            {isSignUp ? 'Inicia Sesión' : 'Crea una cuenta'}
          </button>
        </p>

        {/* Footer Público (Requisito Google Verification) */}
        <div className="pt-8 border-t border-stone-50 space-y-4">
          <p className="text-[10px] text-stone-400 leading-relaxed text-center italic">
            Alumbrar es un espacio de quietud y estudio guiado basado en las enseñanzas de Un Curso de Milagros.
          </p>
          <div className="flex justify-center gap-6">
            <a href="/privacy.html" className="text-[10px] font-bold text-stone-300 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Privacidad</a>
            <a href="/terms.html" className="text-[10px] font-bold text-stone-300 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Términos</a>
          </div>
        </div>
      </div>
    </div>
  );
}
