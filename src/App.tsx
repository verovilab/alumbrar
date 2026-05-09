import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, BookOpen, MessageCircle, RefreshCw, LogOut, Heart, User, Activity, Moon, Sun, Sparkles, ArrowRight
} from 'lucide-react';
import { GemaIcon } from './components/GemaIcon';

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
import { ZenPracticeView } from './components/ZenPracticeView';
import { FloatingPortal } from './components/ui/FloatingPortal';

// Hooks & Data
import { GEMAS } from './data/gemas';
import { useGemini } from './hooks/useGemini';
import { useLessons } from './hooks/useLessons';
import { getUserSubscription, getMessageCount } from './lib/subscriptions';
import { Pricing } from './components/Pricing';
import { Session } from '@supabase/supabase-js';
import { ToastContainer } from './components/ui/Toast';
import { Gema } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [ritualState, setRitualState] = useState({
    zen: false,
    lesson: false,
    practice: false,
    chat: false,
    gems: false,
    journey: false
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  
  const [activeTab, setActiveTab] = useState<'home' | 'gems' | 'qa' | 'lessons' | 'saved' | 'profile' | 'practice' | 'zen-practice'>('home');
  const [input, setInput] = useState('');

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
    if (userId === 'guest') {
      setIsPremium(true); // Permitir todo al invitado por brevedad
      setMsgCount(0);
      return;
    }
    const sub = await getUserSubscription(userId);
    setIsPremium(sub.isPremium);
    const count = await getMessageCount(userId);
    setMsgCount(count);
  };

  // Gemini & Lessons Hooks
  const { messages, setMessages, isTyping, sendMessage } = useGemini(session?.user?.id);
  const { selectedLesson, setSelectedLesson, lessonContent, isLoadingLesson, loadLesson } = useLessons();

  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, []);

  const [currentGema, setCurrentGema] = useState<Gema | null>(null);

  // Tema y Persistencia
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
      setCurrentGema(GEMAS[dayOfYear % GEMAS.length]);
    }
  };

  const handleNextGema = async (category?: string) => {
    let query = supabase.from('gems').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query.limit(100);
    
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setCurrentGema(random);
    } else {
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
    
    if (session?.user?.id === 'guest') {
      addToast("Modo Invitado: Tus consultas no se guardarán permanentemente.", "info");
    }

    if (!isPremium && msgCount >= 5 && session?.user?.id !== 'guest') {
      setShowPricing(true);
      return;
    }

    const text = input.trim();
    setInput('');
    setActiveTab('qa');
    await sendMessage(text, messages);
    setMsgCount((prev: number) => prev + 1);
  };

  const handleLoadLesson = async (num: number) => {
    setActiveTab('lessons');
    await loadLesson(num);
  };

  const handleGuestAccess = () => {
    const guestSession: any = {
      user: {
        id: 'guest',
        email: 'invitado@alumbrar.com.ar',
        user_metadata: {
          full_name: 'Invitado de Honor'
        }
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600 
    };
    setSession(guestSession);
    addToast("Bienvenido al Santuario (Modo Invitado)", "info");
  };

  const categories = ["Calma", "Perdón", "Percepción", "Confianza", "Relaciones", "Presencia"];

  if (!session) {
    if (showAuth) {
      return <Auth />;
    }
    return <LandingView onShowAuth={() => setShowAuth(true)} onGuestAccess={handleGuestAccess} />;
  }

  return (
    <div className={`min-h-screen text-mystic flex flex-col font-inter transition-all duration-1000`}>
      <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')] z-[-1]"></div>

      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto group cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/30 ring-4 ring-white/5 animate-pulse-slow">
            <GemaIcon size={18} />
          </div>
          <div>
            <h1 className="text-lg font-serif italic gold-text leading-none">Alumbrar</h1>
            <p className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] opacity-60">Santuario Sagrado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
          {activeTab === 'qa' && (
            <button 
              onClick={() => window.confirm("¿Reiniciar chat?") && setMessages([])}
              className="p-3 bg-white/5 backdrop-blur-xl text-stone-300 rounded-full hover:text-[#D4AF37] transition-all border border-white/10"
              title="Reiniciar consulta"
            >
              <RefreshCw size={16} />
            </button>
          )}
          {session && (
            <button 
              onClick={() => {
                if (session.user.id === 'guest') {
                  setSession(null);
                } else {
                  supabase.auth.signOut();
                }
              }} 
              className="p-3 text-stone-400 hover:text-white transition-colors"
              title="Salir del Santuario"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto pt-24 pb-40 px-4 relative z-10">
        {activeTab === 'home' && (
          <HomeView 
            dayOfYear={dayOfYear} 
            onLoadLesson={handleLoadLesson} 
            onSetTab={setActiveTab} 
            currentGema={currentGema}
            ritualState={ritualState}
            setRitualState={setRitualState}
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
            loadLesson={handleLoadLesson} 
            isLoadingLesson={isLoadingLesson} 
            lessonContent={lessonContent} 
            userId={session?.user?.id}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView userId={session?.user?.id} />
        )}

        {activeTab === 'profile' && session && (
          <ProfileView session={session} onSignOut={() => {
            if (session.user.id === 'guest') {
              setSession(null);
            } else {
              supabase.auth.signOut();
            }
          }} />
        )}

        {activeTab === 'practice' && (
          <PracticeView 
            userId={session?.user?.id} 
            dayOfYear={dayOfYear} 
            lessonContent={lessonContent} 
            setRitualState={setRitualState}
            onSetTab={setActiveTab}
          />
        )}

        {activeTab === 'zen-practice' && (
          <ZenPracticeView 
            onSetTab={setActiveTab} 
            setRitualState={setRitualState}
          />
        )}
      </main>

      <FloatingPortal activeTab={activeTab} onSetTab={setActiveTab} />
      
      {showPricing && (
        <Pricing 
          userId={session.user.id} 
          onClose={() => setShowPricing(false)} 
        />
      )}
      
      <ZenPlayer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
