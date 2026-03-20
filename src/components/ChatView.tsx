import React, { useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { FormattedText } from './FormattedText';

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
}

export function ChatView({ messages, isTyping, input, setInput, onSendMessage }: ChatViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

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
            <div className={`max-w-[85%] px-7 py-5 rounded-[2rem] ${m.role === 'user' ? 'bg-stone-900 text-white rounded-tr-none' : 'bg-stone-50 text-stone-800 rounded-tl-none border border-stone-100'}`}>
              <FormattedText text={m.text} />
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
