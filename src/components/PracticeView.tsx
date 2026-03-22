import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, 
  MessageSquare, History, ChevronDown, Calendar, Activity, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Feeling {
  id: string;
  name: string;
  display_name: string;
  emoji: string;
  category: 'expansivo' | 'neutro' | 'contractivo';
  color_hex: string;
}

interface PracticeViewProps {
  userId?: string;
  dayOfYear: number;
  lessonContent: string | null;
}

export function PracticeView({ userId, dayOfYear, lessonContent }: PracticeViewProps) {
  const [view, setView] = useState<'practice' | 'reflection' | 'history'>('practice');
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiResult, setAiResult] = useState<{ reflection: string; practice: string } | null>(null);
  const [showFeelingsDropdown, setShowFeelingsDropdown] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  useEffect(() => {
    fetchFeelings();
    if (userId) {
      checkExistingReflection();
    }
  }, [userId]);

  const fetchFeelings = async () => {
    const { data, error } = await supabase
      .from('feelings')
      .select('*')
      .order('sort_order');
    if (data && !error) setFeelings(data);
  };

  const checkExistingReflection = async () => {
    if (!userId) return;
    
    try {
      // Usar a fecha de hoy en formato local YYYY-MM-DD para coincidir con la DB
      const today = new Date().toLocaleDateString('en-CA');
      
      const { data, error } = await supabase
        .from('daily_reflections')
        .select(`
          *,
          feelings (*)
        `)
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (data && !error) {
        setAiResult({
          reflection: data.reflection_text,
          practice: data.practice_text
        });
        setSelectedFeeling(data.feelings);
        setUserInput(data.user_input || '');
        setView('reflection');
      }
    } catch (err) {
      console.error("Error checking existing reflection:", err);
    }
  };

  const extractLessonParts = (content: string | null) => {
    if (!content) return { intro: '', concept: 'Cargando...', explanation: '', practice: '' };
    
    const parts = {
      intro: '',
      concept: '',
      explanation: '',
      practice: ''
    };

    // 1. Extraer Intro (todo lo previo al punto 1)
    const introMatch = content.match(/^([\s\S]*?)(?=(?:\*\*|#|)\s*1\.)/i);
    parts.intro = introMatch ? introMatch[1].trim() : '';

    // 2. Extraer Concepto (sección 1)
    const conceptMatch = content.match(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?[\s\S]*?(?=(?:\*\*|#|)\s*2\.|$)/i);
    if (conceptMatch) {
      parts.concept = conceptMatch[0].replace(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?\s*/i, '').trim();
    }

    // 3. Extraer Explicación (sección 2)
    const explanationMatch = content.match(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda[\s\S]*?(?=(?:\*\*|#|)\s*3\.|$)/i);
    if (explanationMatch) {
      parts.explanation = explanationMatch[0].replace(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda.*?:?\s*/i, '').trim();
    }

    // 4. Extraer Práctica (sección 3)
    const practiceMatch = content.match(/(?:\*\*|#|)\s*3\.\s*Una Práctica Concreta[\s\S]*?$/i);
    if (practiceMatch) {
      parts.practice = practiceMatch[0].replace(/(?:\*\*|#|)\s*3\.\s*Una Práctica Concreta.*?:?\s*/i, '').trim();
    }

    return parts;
  };

  const lessonParts = useMemo(() => extractLessonParts(lessonContent), [lessonContent]);

  const handleReceiveGuia = async () => {
    if (!selectedFeeling || isGenerating) return;
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const concepto = lessonParts.concept;
      const prompt = `Actúa como un místico compasivo experto en "Un Curso de Milagros".

CONTEXTO:
- Lección: ${dayOfYear}
- Concepto Central: ${concepto}
- Sentimiento del usuario: ${selectedFeeling.display_name} (${selectedFeeling.category})
- Input opcional: ${userInput || "No proporcionado"}

TAREA:
Genera una reflexión personalizada de 100-150 palabras que:
1. Reconozca el sentimiento con empatía profunda (sin juzgar)
2. Conecte ese sentimiento específico con la enseñanza de esta lección
3. Ofrezca una perspectiva liberadora desde la filosofía de UCDM
4. Termine con esperanza clara y dirección práctica
5. Use terminología auténtica de UCDM: Ego, Espíritu Santo, Milagro, Expiación, Hijo de Dios, Percepción Verdadera

ADEMÁS, genera una PRÁCTICA de 60-120 segundos que:
- Sea específica para este sentimiento + esta lección
- Incluya respiración, visualización, afirmación o acción concreta

FORMATO DE SALIDA (IMPORTANTE):
Responde estrictamente en formato JSON plano:
{
  "reflection": "tu reflexión aquí",
  "practice": "tu práctica aquí"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Limpiar posible markdown o ruido del JSON de forma robusta
      let jsonStr = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.reflection || !parsed.practice) {
        throw new Error("Formato JSON incompleto");
      }
      
      setAiResult(parsed);
      setView('reflection');
    } catch (error) {
      console.error("AI Error details:", error);
      alert("Hubo un error al conectar con El Guía. Intentá de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !aiResult || !selectedFeeling) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('daily_reflections')
        .insert({
          user_id: userId,
          lesson_number: dayOfYear,
          feeling_id: selectedFeeling.id,
          user_input: userInput,
          reflection_text: aiResult.reflection,
          practice_text: aiResult.practice
        });

      if (error) {
        if (error.code === '23505') {
          alert("Ya completaste tu práctica de hoy. ✨");
        } else {
          throw error;
        }
      } else {
        alert("Tu práctica ha sido guardada en tu historial sagrado.");
        setView('history');
      }
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const categorizedFeelings = useMemo(() => {
    return {
      expansivo: feelings.filter(f => f.category === 'expansivo'),
      neutro: feelings.filter(f => f.category === 'neutro'),
      contractivo: feelings.filter(f => f.category === 'contractivo'),
    };
  }, [feelings]);

  if (view === 'history') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-32">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 italic">Tu Viaje Emocional</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">Marzo 2026</p>
          </div>
          <button onClick={() => setView('practice')} className="px-6 py-3 bg-stone-900 text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center gap-2">
            <ChevronLeft size={16} /> Nueva Práctica
          </button>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-stone-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <Calendar size={180} className="text-stone-900" />
            </div>
            <EmotionalHeatMap userId={userId} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatCard label="Días Expansivos" value="14" color="text-green-500" />
             <StatCard label="Racha Actual" value="5 días" color="text-[#D4AF37]" />
             <StatCard label="Sentimiento Top" value="Paz" color="text-stone-600" />
          </div>

          <div className="bg-stone-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-6 flex items-center gap-2">
                <Sparkles size={14} /> Insights del Guía
              </h4>
              <div className="space-y-6">
                <InsightItem 
                  text="Los lunes experimentas más ansiedad (55% de los lunes). Considerá practicar la quietud antes de empezar tu semana." 
                />
                <InsightItem 
                  text="Después de días contractivos, solés pasar por cansancio (1-2 días) antes de regresar a estados expansivos."
                />
                <InsightItem 
                  text="Tus prácticas de perdón están desbloqueando un patrón recurrente de resentimiento hacia la liberación."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'reflection') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button onClick={() => setView('practice')} className="mb-6 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 flex items-center gap-2 transition-colors">
          <ChevronLeft size={14} /> Reajustar sentimiento
        </button>

        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-50 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-10 bg-stone-900 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900 italic">Tu Reflexión del Día</h3>
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black">Guía personalizada</span>
              </div>
            </div>

            <p className="text-stone-600 leading-relaxed font-medium mb-10 text-lg">
              {aiResult?.reflection}
            </p>

            <div className="p-8 bg-stone-50/50 backdrop-blur-sm rounded-[2.5rem] border border-stone-100 flex flex-col gap-4 relative">
              <div className="absolute -left-3 top-8 w-1 h-12 bg-[#D4AF37] rounded-full"></div>
              <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] flex items-center gap-2">
                <Zap size={14} /> Práctica Recomendada
              </h4>
              <p className="text-stone-700 font-serif italic text-lg leading-relaxed">
                {aiResult?.practice}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
               <ActionButton icon={<Activity size={16} />} label="Guardar" onClick={handleSave} primary disabled={isSaving} />
               <ActionButton icon={<Calendar size={16} />} label="Recordatorio" onClick={() => alert('Recordatorio fijado en 4 horas ✨')} />
               <ActionButton icon={<RefreshCw size={16} />} label="Otra mirada" onClick={handleReceiveGuia} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 italic">Práctica Diaria</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 mt-1">Conecta. Siente. Libera.</p>
        </div>
        <button onClick={() => setView('history')} className="p-3 bg-white border border-stone-100 rounded-2xl text-stone-400 hover:text-stone-900 transition-all shadow-sm hover:shadow-md flex items-center gap-2 group">
          <History size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Historial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Lado Izquierdo: Concepto Central del Día */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-stone-900 rounded-[3rem] p-10 text-[#FFF9F0] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] block mb-4">Lección {dayOfYear}</span>
              <h3 className="text-2xl font-serif font-bold italic mb-8 leading-tight">
                {lessonParts.concept}
              </h3>
              <div className="h-[1px] w-full bg-white/10 mb-8"></div>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-relaxed">
                Este concepto es la brújula para tu día. Dejá que resuene antes de expresar tu sentir a la derecha.
              </p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Input y Feeling */}
        <div className="space-y-6">
          <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 md:p-12 shadow-xl">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4 flex items-center gap-2">
                  <MessageSquare size={12} /> ¿Qué está afectando tu paz hoy?
                </label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribí aquí lo que hoy ocupa tu mente (opcional)..."
                  className="w-full min-h-[120px] p-6 rounded-[2rem] bg-stone-50 border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all text-stone-800 placeholder:text-stone-300 leading-relaxed font-medium"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4 flex items-center gap-2">
                  <Activity size={12} /> ¿Qué sentimiento predomina ahora?
                </label>
                
                <button 
                  onClick={() => setShowFeelingsDropdown(!showFeelingsDropdown)}
                  className={`w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${selectedFeeling ? 'bg-white border-[#D4AF37]' : 'bg-stone-50 border-stone-100'}`}
                >
                  <div className="flex items-center gap-3">
                    {selectedFeeling ? (
                      <>
                        <span className="text-2xl">{selectedFeeling.emoji}</span>
                        <span className="font-bold text-stone-900">{selectedFeeling.display_name}</span>
                      </>
                    ) : (
                      <span className="text-stone-400 font-bold">Seleccioná un sentimiento...</span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-stone-300 group-hover:text-[#D4AF37] transition-transform ${showFeelingsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFeelingsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl border border-stone-100 rounded-[2.5rem] shadow-2xl z-50 p-6 max-h-[500px] overflow-y-auto custom-scrollbar animate-fade-up">
                    <div className="space-y-8">
                      <FeelingGroup title="Expansivos (Luz)" icon="🟢" list={categorizedFeelings.expansivo} onSelect={(f) => { setSelectedFeeling(f); setShowFeelingsDropdown(false); }} selectedId={selectedFeeling?.id} />
                      <FeelingGroup title="Neutros (Transición)" icon="🟡" list={categorizedFeelings.neutro} onSelect={(f) => { setSelectedFeeling(f); setShowFeelingsDropdown(false); }} selectedId={selectedFeeling?.id} />
                      <FeelingGroup title="Contractivos (Sombra)" icon="🔴" list={categorizedFeelings.contractivo} onSelect={(f) => { setSelectedFeeling(f); setShowFeelingsDropdown(false); }} selectedId={selectedFeeling?.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleReceiveGuia}
              disabled={!selectedFeeling || isGenerating}
              className={`w-full mt-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${selectedFeeling && !isGenerating ? 'bg-stone-900 text-[#D4AF37] hover:scale-[1.02] shadow-[#D4AF37]/10' : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'}`}
            >
              {isGenerating ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <>Recibir Guía <Sparkles size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 group-hover:scale-150 transition-transform"></div>
      <p className="text-stone-400 text-sm leading-relaxed group-hover:text-white transition-colors">{text}</p>
    </div>
  );
}

function FeelingGroup({ title, icon, list, onSelect, selectedId }: { title: string, icon: string, list: Feeling[], onSelect: (f: Feeling) => void, selectedId?: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-3 px-2">
        {icon} {title}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {list.map(f => (
          <button 
            key={f.id}
            onClick={() => onSelect(f)}
            className={`flex items-center gap-2 p-3 rounded-xl transition-all border ${selectedId === f.id ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-stone-50 border-stone-100 hover:bg-white hover:border-[#D4AF37]/30 text-stone-600'}`}
          >
            <span className="text-lg">{f.emoji}</span>
            <span className="text-[11px] font-bold truncate">{f.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, primary, disabled }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all ${primary ? 'bg-stone-900 text-[#D4AF37] shadow-xl hover:scale-105' : 'bg-stone-50 text-stone-400 hover:bg-white hover:text-stone-900 hover:shadow-md'} ${disabled ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}
    >
      <div className={`${primary ? 'bg-[#D4AF37]/20' : 'bg-white'} p-3 rounded-2xl`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

import { EmotionalHeatMap } from './EmotionalHeatMap';

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex flex-col gap-1 items-center md:items-start transition-all hover:bg-white hover:shadow-md group">
      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-[#D4AF37] transition-colors">{label}</span>
      <span className={`text-2xl font-serif font-black ${color}`}>{value}</span>
    </div>
  );
}
