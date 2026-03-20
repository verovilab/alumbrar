import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, Star, BookOpen, MessageCircle, RefreshCw, LogOut
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';

// Components
import { NavBtn } from './components/NavBtn';
import { HomeView } from './components/HomeView';
import { GemaView } from './components/GemaView';
import { ChatView } from './components/ChatView';
import { LessonsView } from './components/LessonsView';
import { Auth } from './components/Auth';

// Hooks & Data
import { GEMAS } from './data/gemas';
import { useGemini } from './hooks/useGemini';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'gems' | 'qa' | 'lessons'>('home');
  const [input, setInput] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gemini Hook
  const { messages, setMessages, isTyping, sendMessage } = useGemini(process.env.API_KEY || "", session?.user?.id);

  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, []);

  const [currentGema, setCurrentGema] = useState(GEMAS[dayOfYear % GEMAS.length]);

  const handleNextGema = () => {
    const randomIndex = Math.floor(Math.random() * GEMAS.length);
    setCurrentGema(GEMAS[randomIndex]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setActiveTab('qa');
    await sendMessage(text, messages);
  };

  const loadLesson = async (num: number) => {
    setSelectedLesson(num);
    setLessonContent(null);
    setIsLoadingLesson(true);
    setActiveTab('lessons');
    try {
      const ai = new GoogleGenAI(process.env.API_KEY || "");
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Actúa como un maestro experto en Un Curso de Milagros. Pero no hables como si fueras un guia sino sólo trasnmite información. Proporciona un resumen inspirador y profundo de la Lección ${num}. Estructúralo con: 1. El concepto central. 2. Una explicación para la vida diaria. 3. Una práctica concreta para hoy.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setLessonContent(response.text() || "La Verdad espera tu reconocimiento silencioso.");
    } catch (e) {
      setLessonContent("Hubo un problema al cargar la lección. Verifica tu conexión o API_KEY.");
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const categories = ["Calma", "Perdón", "Percepción", "Confianza", "Relaciones", "Presencia"];

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex justify-center font-sans antialiased selection:bg-[#D4AF37]/20">
      <div className="w-full max-w-lg min-h-screen bg-white shadow-2xl flex flex-col relative border-x border-stone-100 overflow-hidden">
        
        {/* Header */}
        <header className="px-8 pt-10 pb-6 flex justify-between items-center bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-50">
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Camino a UCDM</h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">Luz & Verdad</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.confirm("¿Reiniciar chat?") && setMessages([])}
              className="p-3 bg-stone-50 text-stone-300 rounded-full hover:text-stone-900 transition-colors"
              title="Reiniciar chat"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-3 bg-stone-50 text-stone-300 rounded-full hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 px-8 pt-6 pb-40 overflow-y-auto no-scrollbar">
          {activeTab === 'home' && (
            <HomeView 
              dayOfYear={dayOfYear} 
              onLoadLesson={loadLesson} 
              onSetTab={setActiveTab} 
              categories={categories} 
            />
          )}

          {activeTab === 'gems' && (
            <GemaView 
              currentGema={currentGema} 
              onNextGema={handleNextGema} 
              userId={session?.user?.id}
            />
          )}

          {activeTab === 'qa' && (
            <ChatView 
              messages={messages} 
              isTyping={isTyping} 
              input={input} 
              setInput={setInput} 
              onSendMessage={handleSendMessage} 
            />
          )}

          {activeTab === 'lessons' && (
            <LessonsView 
              selectedLesson={selectedLesson} 
              setSelectedLesson={setSelectedLesson} 
              dayOfYear={dayOfYear} 
              loadLesson={loadLesson} 
              isLoadingLesson={isLoadingLesson} 
              lessonContent={lessonContent} 
            />
          )}
        </main>

        {/* Navegación */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[440px] bg-white/90 backdrop-blur-xl border border-stone-100 shadow-2xl flex justify-around items-center py-4 px-6 z-[100] rounded-[3rem]">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20}/>} label="Inicio" />
          <NavBtn active={activeTab === 'gems'} onClick={() => setActiveTab('gems')} icon={<Star size={20}/>} label="Gema" />
          <NavBtn active={activeTab === 'qa'} onClick={() => setActiveTab('qa')} icon={<MessageCircle size={20}/>} label="Guía" />
          <NavBtn active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} icon={<BookOpen size={20}/>} label="Curso" />
        </nav>

      </div>
    </div>
  );
}
