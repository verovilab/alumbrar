import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, 
  Wind, Zap, BrainCircuit
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface PracticeViewProps {
  userId: string;
  dayOfYear: number;
}

export function PracticeView({ userId, dayOfYear }: PracticeViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    situacion: '',
    interpretacion: '',
    reinterpretacion: ''
  });
  const [reflection, setReflection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 5;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const staticDefault = "La respuesta no está en controlar el mundo, sino en permitir una nueva percepción. La paz no llega cuando todo se ordena afuera, sino cuando dejás de usar el conflicto como maestro.";

  // Manejo del Timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const generateReflection = async () => {
    if (!formData.situacion || isGenerating) return;
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Actúa como un maestro profundo de Un Curso de Milagros. 
      El usuario se siente así: "${formData.situacion}".
      Estamos en la Lección ${dayOfYear}. 
      Proporciona una reflexión muy corta (máximo 2 párrafos) que conecte su sentimiento con la verdad de la lección. 
      Usa un tono que transmita una paz inmensa.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setReflection(text);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSuggestion = async () => {
    if (!formData.interpretacion || suggesting) return;
    setSuggesting(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `El usuario interpreta su situación así: "${formData.interpretacion}".
      Basándote en Un Curso de Milagros, sugiere una "REINTERPRETACIÓN" desde la paz. 
      Sé breve y reconfortante.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setFormData(prev => ({ ...prev, reinterpretacion: text }));
    } catch (error) {
      console.error("Suggestion Error:", error);
    } finally {
      setSuggesting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.situacion.trim()) {
        alert("Escribí primero qué está ocupando tu mente hoy.");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (currentStep === 3 && (!formData.interpretacion.trim() || !formData.reinterpretacion.trim())) {
      alert("Completá ambas reflexiones antes de continuar.");
      return;
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTimer = () => {
    if (!timerActive && timeLeft > 0) {
      setTimerActive(true);
    }
  };

  const handleSavePractice = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_practices')
        .insert({
          user_id: userId,
          situacion: formData.situacion,
          interpretacion: formData.interpretacion,
          reinterpretacion: formData.reinterpretacion
        });

      if (error) throw error;
      setCurrentStep(6);
    } catch (error: any) {
      console.error("Error saving practice:", error);
      alert("Hubo un error al guardar tu práctica.");
    } finally {
      setIsSaving(false);
    }
  };

  const restartPractice = () => {
    setCurrentStep(1);
    setFormData({ situacion: '', interpretacion: '', reinterpretacion: '' });
    setReflection(null);
    setTimeLeft(60);
    setTimerActive(false);
  };

  const progressWidth = `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%`;

  return (
    <div className="max-w-xl mx-auto pb-20 animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">
            {currentStep <= totalSteps ? `Paso ${currentStep} de ${totalSteps}` : 'Completado'}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37]">Práctica Diaria</span>
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E1C55D] transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* STEP 1: SITUACION */}
        {currentStep === 1 && (
          <div className="animate-fade-up">
            <HeroCard 
              icon={<Wind className="text-[#D4AF37]" size={28} />}
              title="“La paz de Dios es mi único objetivo hoy.”"
              caption="Tu guía espiritual"
            />
            <InputCard 
              eyebrow="Antes de comenzar"
              title="¿Qué está ocupando tu mente?"
              subtitle="Nombralo sin exigencia. Solo traelo a la luz para comenzar esta práctica con honestidad."
            >
              <div className="mt-6">
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-3">Tu situación de hoy</label>
                <textarea 
                  value={formData.situacion}
                  onChange={(e) => setFormData({...formData, situacion: e.target.value})}
                  placeholder="Ejemplo: Estoy preocupado por una conversación pendiente..."
                  className="w-full min-h-[140px] p-5 rounded-3xl bg-white border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all text-stone-800 leading-relaxed font-medium shadow-sm"
                />
              </div>
              <button 
                onClick={nextStep}
                disabled={isGenerating}
                className="w-full mt-8 bg-[#D4AF37] hover:bg-stone-900 text-white font-black uppercase tracking-widest py-5 rounded-[2rem] transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 group"
              >
                {isGenerating ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <>Preparar Práctica <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </InputCard>
          </div>
        )}

        {/* STEP 2: LECCION */}
        {currentStep === 2 && (
          <div className="animate-fade-up">
            <HeroCard 
              icon={<Sparkles className="text-[#D4AF37]" size={28} />}
              title={`Lección ${dayOfYear}`}
              caption="Un Curso de Milagros"
            />
            <InputCard 
              eyebrow="Lección del día"
              title="Recibí esta idea"
              subtitle="No se te pide resolver lo que te inquietas por tu cuenta. Se te invita a recordar que la paz ya fue dada."
            >
              <div className="mt-6 p-6 bg-stone-50 rounded-3xl border border-stone-100 italic text-stone-600 leading-relaxed text-lg font-serif relative group">
                {reflection || staticDefault}
                {!reflection && (
                  <button 
                    onClick={generateReflection}
                    disabled={isGenerating}
                    className="absolute -bottom-3 right-6 bg-white border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#D4AF37] hover:text-white transition-all flex items-center gap-2"
                  >
                    {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />} Personalizar con IA
                  </button>
                )}
              </div>
              <div className="flex gap-4 mt-12">
                <button onClick={prevStep} className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Volver
                </button>
                <button onClick={nextStep} className="flex-[2] py-5 rounded-[2rem] bg-[#D4AF37] text-white font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-xl shadow-[#D4AF37]/20">
                  Entiendo
                </button>
              </div>
            </InputCard>
          </div>
        )}

        {/* STEP 3: REFLEXION */}
        {currentStep === 3 && (
          <div className="animate-fade-up">
            <InputCard 
              eyebrow="Aplicación"
              title="Llevemos la lección a tu experiencia"
              subtitle="La práctica empieza cuando lo aplicás a eso que hoy te toca vivir."
            >
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-3">¿Cómo estás interpretando lo que te pasa?</label>
                  <textarea 
                    value={formData.interpretacion}
                    onChange={(e) => setFormData({...formData, interpretacion: e.target.value})}
                    placeholder="Escribí tu interpretación actual..."
                    className="w-full min-h-[100px] p-5 rounded-3xl bg-white border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black uppercase tracking-widest text-stone-500">¿Cómo podrías verlo diferente?</label>
                    <button 
                      onClick={getSuggestion}
                      disabled={suggesting || !formData.interpretacion}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] hover:text-stone-900 transition-colors flex items-center gap-1 bg-[#D4AF37]/5 px-3 py-1.5 rounded-full border border-[#D4AF37]/10"
                    >
                      {suggesting ? <RefreshCw size={10} className="animate-spin" /> : <BrainCircuit size={10} />} Sugerencia del Guía
                    </button>
                  </div>
                  <textarea 
                    value={formData.reinterpretacion}
                    onChange={(e) => setFormData({...formData, reinterpretacion: e.target.value})}
                    placeholder="Escribí una nueva mirada..."
                    className="w-full min-h-[100px] p-5 rounded-3xl bg-white border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={prevStep} className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all">
                  Volver
                </button>
                <button onClick={nextStep} className="flex-[2] py-5 rounded-[2rem] bg-[#D4AF37] text-white font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-xl shadow-[#D4AF37]/20">
                  Continuar
                </button>
              </div>
            </InputCard>
          </div>
        )}

        {/* STEP 4: TIMER */}
        {currentStep === 4 && (
          <div className="animate-fade-up">
            <InputCard 
              eyebrow="Microacción"
              title="Practicá ahora"
              subtitle="Un minuto de quietud puede reordenar una mente entera."
            >
              <div className="mt-6 bg-[#FEFCE8] border border-yellow-100 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={64} className="text-[#D4AF37]" />
                </div>
                
                <h4 className="text-[10px] uppercase tracking-widest font-black text-stone-400 mb-2 flex items-center justify-center gap-2">
                  <Zap size={14} className="text-[#D4AF37]" /> Microacción
                </h4>
                
                <p className="text-lg text-stone-700 font-medium mb-6">Respirá profundamente 3 veces.</p>
                
                <div className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-3xl p-6 italic font-serif text-xl border-dashed mb-8 text-stone-800">
                  “La paz de Dios es mi único objetivo hoy.”
                </div>

                <div className="flex justify-center mb-8">
                  <div className={`w-32 h-32 rounded-full border-8 ${timeLeft === 0 ? 'border-green-400' : 'border-[#D4AF37]'} bg-white flex items-center justify-center text-4xl font-black shadow-lg shadow-[#D4AF37]/10 transition-colors`}>
                    {timeLeft === 0 ? <CheckCircle2 className="text-green-500" size={48} /> : timeLeft}
                  </div>
                </div>

                {timeLeft > 0 ? (
                  <button 
                    onClick={startTimer}
                    disabled={timerActive}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${timerActive ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-[#D4AF37] hover:scale-[1.02]'}`}
                  >
                    {timerActive ? 'Respirando...' : `Iniciar Práctica (60s)`}
                  </button>
                ) : (
                  <p className="text-green-600 font-bold animate-fade-in group flex items-center justify-center gap-2">
                    Práctica completada con éxito <CheckCircle2 size={18} />
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={prevStep} className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all">
                  Volver
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={timeLeft > 0}
                  className={`flex-[2] py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl ${timeLeft === 0 ? 'bg-[#D4AF37] text-white shadow-[#D4AF37]/20 hover:bg-stone-900' : 'bg-stone-50 text-stone-300 shadow-none cursor-not-allowed'}`}
                >
                  Continuar
                </button>
              </div>
            </InputCard>
          </div>
        )}

        {/* STEP 5: CIERRE */}
        {currentStep === 5 && (
          <div className="animate-fade-up text-center relative">
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className={`absolute w-2 h-2 rounded-full bg-[#D4AF37] opacity-60 animate-ping`} style={{
                   top: `${Math.random() * 100}%`,
                   left: `${Math.random() * 100}%`,
                   animationDelay: `${Math.random() * 2}s`,
                   animationDuration: `${2 + Math.random() * 2}s`
                 }} />
               ))}
             </div>
             <div className="bg-white border border-stone-100 rounded-[3rem] p-12 shadow-xl relative z-10">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
                 <CheckCircle2 size={48} />
               </div>
               <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-4 block">Cierre</span>
               <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">Hoy elegiste ver diferente</h3>
               <p className="text-stone-500 leading-relaxed max-w-[280px] mx-auto">No cambió el mundo. Cambió tu manera de mirarlo.</p>
               
               <button 
                onClick={handleSavePractice}
                disabled={isSaving}
                className="w-full mt-10 bg-[#D4AF37] text-white font-black uppercase tracking-widest py-5 rounded-[2rem] hover:bg-stone-900 transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
               >
                 {isSaving ? <RefreshCw size={20} className="animate-spin" /> : 'Finalizar Práctica'}
               </button>
             </div>
          </div>
        )}

        {/* STEP 6: RESUMEN (FINAL) */}
        {currentStep === 6 && (
          <div className="animate-fade-up">
            <div className="bg-white border border-stone-100 rounded-[3rem] p-10 shadow-xl overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Práctica guardada</h3>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">En tu espacio de quietud</p>
                </div>
              </div>

              <div className="space-y-8">
                <SummaryItem label="Lo que ocupaba tu mente" content={formData.situacion} />
                <SummaryItem label="Tu interpretación inicial" content={formData.interpretacion} />
                <SummaryItem label="Tu nueva mirada" content={formData.reinterpretacion} border />
              </div>

              <div className="mt-12 space-y-4">
                <button 
                  onClick={restartPractice}
                  className="w-full py-5 rounded-2xl bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  Volver a empezar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponentes locales
function HeroCard({ icon, title, caption }: { icon: React.ReactNode, title: string, caption: string }) {
  return (
    <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden mb-6 group">
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="mb-6">{icon}</div>
        <h2 className="text-2xl lg:text-3xl font-serif italic leading-relaxed text-[#FFF9F0]">"{title}"</h2>
        <div className="mt-8 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">{caption}</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>
      </div>
    </div>
  );
}

function InputCard({ eyebrow, title, subtitle, children }: { eyebrow: string, title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 lg:p-12 shadow-xl">
      <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-3 block">{eyebrow}</span>
      <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2 leading-tight">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function SummaryItem({ label, content, border }: { label: string, content: string, border?: boolean }) {
  return (
    <div className={`group ${border ? 'pt-6 border-t border-dashed border-stone-200' : ''}`}>
      <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-2 group-hover:translate-x-1 transition-transform">{label}</h4>
      <p className="text-stone-600 leading-relaxed text-sm font-medium">{content}</p>
    </div>
  );
}
