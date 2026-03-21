import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, Star, BookOpen, MessageCircle, RefreshCw, LogOut
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
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
import { getUserSubscription, getMessageCount } from './lib/subscriptions';
import { Pricing } from './components/Pricing';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'home' | 'gems' | 'qa' | 'lessons'>('home');
  const [input, setInput] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Auth & Subscription Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        checkSubscription(currentSession.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        checkSubscription(currentSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscription = async (userId: string) => {
    const sub = await getUserSubscription(userId);
    setIsPremium(sub.isPremium);
    const count = await getMessageCount(userId);
    setMsgCount(count);
  };

  // Gemini Hook
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const { messages, setMessages, isTyping, sendMessage } = useGemini(apiKey, session?.user?.id);

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
    
    if (!isPremium && msgCount >= 5) {
      setShowPricing(true);
      return;
    }

    const text = input.trim();
    setInput('');
    setActiveTab('qa');
    await sendMessage(text, messages);
    setMsgCount((prev: number) => prev + 1);
  };

  const loadLesson = async (num: number) => {
    setSelectedLesson(num);
    setLessonContent(null);
    setIsLoadingLesson(true);
    setActiveTab('lessons');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1' });
      const prompt = `Actúa como un maestro experto en Un Curso de Milagros. Pero no hables como si fueras un guia sino sólo trasnmite información. Proporciona un resumen inspirador y profundo de la Lección ${num}. Estructúralo con: 1. El concepto central. 2. Una explicación para la vida diaria. 3. Una práctica concreta para hoy.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setLessonContent(response.text() || "La Verdad espera tu reconocimiento silencioso.");
    } catch (e: any) {
      console.error("Gemini Lesson Error:", e);
      setLessonContent(`Error: ${e.message || "Hubo un problema al cargar la lección. Verifica tu conexión o API_KEY."}`);
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
      <div className="w-full max-w-xl min-h-screen bg-white shadow-2xl flex flex-col relative border-x border-stone-100 overflow-hidden">
        
        {/* Header */}
        <header className="px-6 sm:px-10 pt-10 pb-6 flex justify-between items-center bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-50">
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">Camino a UCDM</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">Luz & Verdad</p>
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
        <main className="flex-1 px-6 sm:px-10 pt-6 pb-40 overflow-y-auto no-scrollbar">
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
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl flex justify-around items-center py-4 px-6 z-[100] rounded-[3rem]">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22}/>} label="Inicio" />
          <NavBtn active={activeTab === 'gems'} onClick={() => setActiveTab('gems')} icon={<Star size={22}/>} label="Gema" />
          <NavBtn active={activeTab === 'qa'} onClick={() => setActiveTab('qa')} icon={<MessageCircle size={22}/>} label="Guía" />
          <NavBtn active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} icon={<BookOpen size={22}/>} label="Curso" />
        </nav>

        {showPricing && (
          <Pricing 
            userId={session.user.id} 
            onClose={() => setShowPricing(false)} 
          />
        )}
      </div>
    </div>
  );
}
