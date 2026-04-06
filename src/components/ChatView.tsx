import React, { useRef, useEffect } from 'react';
import { Sparkles, Send, Bookmark } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { supabase } from '../lib/supabase';
import { SacredCard } from './ui/SacredCard';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface ChatViewProps {
  messages: Message[];
  isTyping: boolean;
  input: string;
  setInput: (val: string) => void;
  onSendMessage: () => void;
  userId?: string;
}

export function ChatView({ messages, isTyping, input, setInput, onSendMessage, userId }: ChatViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const saveSnippet = async (text: string) => {
    if (!userId) return;
    try {
      await supabase.from('user_snippets').insert({
        user_id: userId,
        content: text,
        source: 'Guía Espiritual'
      });
      alert('Frase guardada en tus tesoros ✨');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div className="flex flex-col gap-8 pb-32 animate-fade-up max-w-2xl mx-auto">
        {messages.length === 0 && (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-stone-900 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto shadow-2xl relative">
              <Sparkles className="text-[#D4AF37] animate-pulse" size={40} />
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/10 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold italic text-stone-900 dark:text-stone-100 italic">El Guía te espera</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">¿Qué duda del ego quieres disolver hoy?</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-10 px-4">
              <button 
                onClick={() => setInput("¿Cómo puedo perdonar esta situación?")} 
                className="p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-left"
              >
                ¿Cómo puedo perdonar esta situación?
              </button>
              <button 
                onClick={() => setInput("Siento mucho miedo, ayúdame.")} 
                className="p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-left"
              >
                Siento mucho miedo, ayúdame.
              </button>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'user' ? (
              <div className="max-w-[85%] px-7 py-5 bg-stone-900 text-stone-100 rounded-[2rem] rounded-tr-none shadow-xl border border-white/5">
                <FormattedText text={m.text} />
              </div>
            ) : (
              <SacredCard className="max-w-[95%] !p-7 relative group border-stone-100 dark:border-stone-800">
                <div className="absolute -left-1 top-6 w-1 h-12 bg-[#D4AF37] rounded-full"></div>
                <FormattedText text={m.text} />
                <button 
                  onClick={() => saveSnippet(m.text)}
                  className="absolute -right-2 -bottom-2 p-3 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-full text-stone-300 hover:text-[#D4AF37] shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  title="Guardar en mis tesoros"
                >
                  <Bookmark size={14} />
                </button>
              </SacredCard>
            )}
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-[#D4AF37] font-black tracking-widest animate-pulse">CANALIZANDO LA VERDAD...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] z-[100]">
        <div className="flex gap-2 bg-stone-900 p-2 rounded-full shadow-2xl items-center border border-white/10 ring-4 ring-white/5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Pregunta al Guía..."
            className="flex-1 bg-transparent px-6 text-sm text-white outline-none placeholder:text-stone-600"
          />
          <button onClick={onSendMessage} className="bg-[#D4AF37] p-4 rounded-full text-white active:scale-90 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
