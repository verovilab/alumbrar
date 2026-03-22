import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, BookOpen, MessageCircle, RefreshCw, LogOut, Heart, User, Activity
} from 'lucide-react';
import { GemaIcon } from './components/GemaIcon';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from './lib/supabase';

// Components
import { NavBtn } from './components/NavBtn';
import { HomeView } from './components/HomeView';
import { GemaView } from './components/GemaView';
import { ChatView } from './components/ChatView';
import { LessonsView } from './components/LessonsView';
import { Auth } from './components/Auth';
import { LandingView } from './components/LandingView';
import { SavedView } from './components/SavedView';
import { ProfileView } from './components/ProfileView';
import { ZenPlayer } from './components/ZenPlayer';
import { PracticeView } from './components/PracticeView';

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
  const [showAuth, setShowAuth] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'home' | 'gems' | 'qa' | 'lessons' | 'saved' | 'profile' | 'practice'>('home');
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

  const [currentGema, setCurrentGema] = useState<any>(null);

  // Cargar Gema Diaria y Lección del día al iniciar
  useEffect(() => {
    fetchDailyGema();
    loadLesson(dayOfYear);
  }, []);

  const fetchDailyGema = async () => {
    const { data } = await supabase
      .from('gems')
      .select('*')
      .eq('is_daily', true)
      .limit(1)
      .single();
    
    if (data) {
      setCurrentGema(data);
    } else {
      // Fallback a estático si no hay en DB
      setCurrentGema(GEMAS[dayOfYear % GEMAS.length]);
    }
  };

  const handleNextGema = async (category?: string) => {
    // Intentar traer una con filtro de la DB si se pasa categoría
    let query = supabase.from('gems').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query.limit(100);
    
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setCurrentGema(random);
    } else {
      // Fallback a locales
      let filtered = GEMAS;
      if (category) {
        filtered = GEMAS.filter(g => g.category === category);
      }
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setCurrentGema(filtered[randomIndex]);
    }
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
      // 1. Intentar cargar desde Supabase
      const { data: dbLesson, error: dbError } = await supabase
        .from('lessons')
        .select('content')
        .eq('number', num)
        .single();

      // Si el contenido existe y es suficientemente largo (no es un placeholder)
      if (dbLesson && !dbError && dbLesson.content.length > 300) {
        setLessonContent(dbLesson.content);
        return;
      }

      // 2. Generar con IA (Gemini 2.5) si no hay o es muy corto
      console.log(`Generating/Updating Lesson ${num} with AI...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Actúa como un maestro experto y profundo en Un Curso de Milagros. Proporciona un resumen inspirador de la Lección ${num}. Estructúralo con: 1. El concepto central. 2. Una explicación profunda para la vida diaria. 3. Una práctica concreta para hoy. Usa un tono que transmita paz y verdad. Evita introducciones genéricas, ve directo a la esencia.`;
      
      const result = await model.generateContent(prompt);
      const fullContent = (await result.response).text() || "La Verdad espera tu reconocimiento silencioso.";
      
      setLessonContent(fullContent);

      // 3. Auto-llenado: Guardar en la DB para la próxima vez
      console.log(`Saving Lesson ${num} to DB...`);
      const { error: upsertError } = await supabase
        .from('lessons')
        .upsert({ 
          number: num, 
          title: `Lección ${num}`, 
          content: fullContent 
        }, { onConflict: 'number' });

      if (upsertError) {
        console.error("Supabase SAVE Error (RLS?):", upsertError);
      } else {
        console.log(`Lesson ${num} SAVED successfully!`);
      }

    } catch (e: any) {
      console.error("Lesson Error:", e);
      setLessonContent(`Disculpa, hubo un problema al sintonizar la lección. ${e.message || ""}`);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const categories = ["Calma", "Perdón", "Percepción", "Confianza", "Relaciones", "Presencia"];

  if (!session) {
    if (showAuth) {
      return <Auth />;
    }
    return <LandingView onShowAuth={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans antialiased selection:bg-[#D4AF37]/20">
      <div className="w-full max-w-xl lg:max-w-5xl min-h-screen bg-white shadow-2xl flex flex-col relative border-x border-stone-100 overflow-hidden">
        
        {/* Header */}
        <header className="px-6 sm:px-10 pt-10 pb-6 flex justify-between items-center bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
              <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">Alumbrar</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">Un Espacio de Quietud</p>
            </div>
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
              currentGema={currentGema}
            />
          )}

          {activeTab === 'gems' && (
            <GemaView 
              currentGema={currentGema} 
              onNextGema={handleNextGema} 
              userId={session?.user?.id}
              categories={categories}
            />
          )}

          {activeTab === 'qa' && (
            <ChatView 
              messages={messages} 
              isTyping={isTyping} 
              input={input} 
              setInput={setInput} 
              onSendMessage={handleSendMessage} 
              userId={session?.user?.id}
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
              userId={session?.user?.id}
            />
          )}

          {activeTab === 'saved' && (
            <SavedView userId={session?.user?.id} />
          )}

          {activeTab === 'profile' && (
            <ProfileView session={session} onSignOut={() => supabase.auth.signOut()} />
          )}

          {activeTab === 'practice' && (
            <PracticeView userId={session?.user?.id} dayOfYear={dayOfYear} lessonContent={lessonContent} />
          )}
        </main>

        {/* Navegación - Premium Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-2xl border-t border-stone-100/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex justify-around items-stretch px-4 z-[100] h-[72px]">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="Inicio" />
          <NavBtn active={activeTab === 'gems'} onClick={() => setActiveTab('gems')} icon={<GemaIcon />} label="Gema" />
          <NavBtn active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} icon={<Activity />} label="Práctica" />
          <NavBtn active={activeTab === 'qa'} onClick={() => setActiveTab('qa')} icon={<MessageCircle />} label="Guía" />
          <NavBtn active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} icon={<Heart />} label="Guardado" />
          <NavBtn active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} icon={<BookOpen />} label="Curso" />
          <NavBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User />} label="Perfil" />
        </nav>

        {showPricing && (
          <Pricing 
            userId={session.user.id} 
            onClose={() => setShowPricing(false)} 
          />
        )}
        <ZenPlayer />
      </div>
    </div>
  );
}
