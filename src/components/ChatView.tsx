import React, { useRef, useEffect } from 'react';
import { Sparkles, Send, Bookmark } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { supabase } from '../lib/supabase';

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
      <div className="flex flex-col gap-6 pb-24 animate-fade-up">
        {messages.length === 0 && (
          <div className="py-20 text-center space-y-4 opacity-30">
            <Sparkles className="mx-auto text-[#D4AF37]" size={40} />
            <p className="text-xs font-bold uppercase tracking-widest">Inicia una consulta espiritual</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-7 py-5 rounded-[2rem] relative group ${m.role === 'user' ? 'bg-stone-900 text-white rounded-tr-none' : 'bg-stone-50 text-stone-800 rounded-tl-none border border-stone-100'}`}>
              <FormattedText text={m.text} />
              {m.role === 'model' && (
                <button 
                  onClick={() => saveSnippet(m.text)}
                  className="absolute -right-10 top-2 p-2 text-stone-300 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  title="Guardar en mis tesoros"
                >
                  <Bookmark size={16} />
                </button>
              )}
            </div>
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
