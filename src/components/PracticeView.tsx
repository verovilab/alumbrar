import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, 
  MessageSquare, History, ChevronDown, Calendar, Activity, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SacredCard } from './ui/SacredCard';
import { EmotionalHeatMap } from './EmotionalHeatMap';

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
  setRitualState: React.Dispatch<React.SetStateAction<any>>;
  onSetTab: (tab: any) => void;
}

export function PracticeView({ userId, dayOfYear, lessonContent, setRitualState, onSetTab }: PracticeViewProps) {
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
    const parts = { intro: '', concept: '', explanation: '', practice: '' };
    const introMatch = content.match(/^([\s\S]*?)(?=(?:\*\*|#|)\s*1\.)/i);
    parts.intro = introMatch ? introMatch[1].trim() : '';
    const conceptMatch = content.match(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?[\s\S]*?(?=(?:\*\*|#|)\s*2\.|$)/i);
    if (conceptMatch) {
      parts.concept = conceptMatch[0].replace(/(?:\*\*|#|)\s*1\.\s*El Concepto Central:?\s*/i, '').trim();
    }
    const explanationMatch = content.match(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda[\s\S]*?(?=(?:\*\*|#|)\s*3\.|$)/i);
    if (explanationMatch) {
      parts.explanation = explanationMatch[0].replace(/(?:\*\*|#|)\s*2\.\s*Explicación Profunda.*?:?\s*/i, '').trim();
    }
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
      const { data: preGenerated, error: dbError } = await supabase
        .from('lesson_reflections')
        .select('reflection, practice')
        .eq('lesson_number', dayOfYear)
        .eq('feeling_id', selectedFeeling.id)
        .maybeSingle();

      if (preGenerated && !dbError) {
        setAiResult({
          reflection: preGenerated.reflection,
          practice: preGenerated.practice
        });
        setView('reflection');
        setIsGenerating(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      
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
      
      let jsonStr = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.reflection || !parsed.practice) throw new Error("Formato JSON incompleto");
      
      setAiResult(parsed);
      setView('reflection');
    } catch (error) {
      console.error("Guía Error Details:", error);
      alert("🕊️ El Guía está en silencio por un momento. Por favor, verificá tu conexión o intentá de nuevo en unos segundos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (userId === 'guest') {
      alert("🕊️ Modo Invitado: Tu reflexión fue hermosa, pero para guardarla en tu historial sagrado debes iniciar sesión con Google.");
      return;
    }
    if (!aiResult || !selectedFeeling) return;
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
      if (!error) {
        setRitualState((prev: any) => ({ ...prev, practice: true }));
        setView('history');
      }
    } catch (error) {
      console.error(error);
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
            <h2 className="text-3xl font-serif font-bold text-white italic">Tu Viaje Emocional</h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] mt-1">Marzo 2026</p>
          </div>
          <button onClick={() => setView('practice')} className="px-6 py-3 bg-[#D4AF37] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center gap-2">
            <ChevronLeft size={16} /> Nueva Práctica
          </button>
        </div>
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-stone-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <Calendar size={180} className="text-stone-900" />
            </div>
            <EmotionalHeatMap userId={userId} showInsights={true} />
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
          <SacredCard glow className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-10 bg-stone-900 text-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-2xl font-bold font-serif text-white italic">Tu Reflexión del Día</h3>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-black">Guía personalizada</span>
              </div>
            </div>
            <p className="text-stone-100 leading-relaxed font-medium mb-10 text-xl md:text-2xl drop-shadow-lg">{aiResult?.reflection}</p>
            <div className="p-8 bg-stone-50/50 backdrop-blur-sm rounded-[2.5rem] border border-stone-100 flex flex-col gap-4 relative">
              <div className="absolute -left-3 top-8 w-1 h-12 bg-[#D4AF37] rounded-full"></div>
              <h4 className="text-xs uppercase tracking-widest font-black text-[#D4AF37] flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-lg w-fit">
                <Zap size={16} /> Práctica Recomendada
              </h4>
              <p className="text-white font-serif italic text-xl leading-relaxed">{aiResult?.practice}</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4">
               <ActionButton icon={<Activity size={16} />} label="Guardar registro" onClick={handleSave} primary disabled={isSaving} />
               <ActionButton icon={<RefreshCw size={16} />} label="Otra mirada" onClick={handleReceiveGuia} disabled={isGenerating} />
            </div>
          </SacredCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in !overflow-visible pb-60">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => onSetTab('home')}
          className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-[#D4AF37] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-serif italic text-white leading-none mb-1">Práctica Diaria</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Conecta. Siente. Libera.</p>
        </div>
      </div>

      <div className="flex justify-end items-center mb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold text-white italic">Práctica Diaria</h2>
          <p className="text-xs uppercase tracking-widest font-black text-[#D4AF37] mt-2">Conecta. Siente. Libera.</p>
        </div>
        <button onClick={() => setView('history')} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-stone-300 hover:text-white transition-all shadow-sm hover:shadow-md flex items-center gap-3 group">
          <History size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest hidden md:block">Historial Sagrado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start !overflow-visible">
        <div className="lg:sticky lg:top-20">
          <div className="bg-black/40 backdrop-blur-3xl rounded-[3rem] p-12 text-[#FFF9F0] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#D4AF37] block">Lección {dayOfYear}</span>
              <h3 className="text-3xl md:text-4xl font-serif font-bold italic leading-tight text-white drop-shadow-xl">{lessonParts.concept}</h3>
              <div className="h-[2px] w-20 bg-[#D4AF37]/40"></div>
              <p className="text-stone-300 text-sm italic font-medium leading-relaxed">Este concepto es tu brújula sagrada.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 !overflow-visible">
          <SacredCard overflowVisible className="!p-8 md:!p-12 !overflow-visible">
            <div className="space-y-8 !overflow-visible">
              <div className="!overflow-visible">
                <label className="block text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-2">
                  <MessageSquare size={14} /> ¿Qué está afectando tu paz hoy?
                </label>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribí aquí lo que hoy ocupa tu mente (opcional)..."
                  className="w-full min-h-[120px] p-6 rounded-[2rem] bg-stone-900/40 border border-white/10 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all text-stone-100 placeholder:text-stone-600 leading-relaxed font-medium backdrop-blur-md"
                />
              </div>

              <div className="relative !overflow-visible">
                <label className="block text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-2">
                  <Activity size={14} /> ¿Qué sentimiento predomina ahora?
                </label>
                <button 
                  onClick={() => setShowFeelingsDropdown(!showFeelingsDropdown)}
                  className={`w-full p-6 rounded-[2rem] transition-all flex items-center justify-between group sacred-card ${selectedFeeling ? 'border-[#D4AF37]/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {selectedFeeling ? (
                      <>
                        <span className="text-3xl">{selectedFeeling.emoji}</span>
                        <span className="text-lg font-bold text-white">{selectedFeeling.display_name}</span>
                      </>
                    ) : (
                      <span className="text-stone-500 font-bold text-sm uppercase tracking-widest">Seleccioná un sentimiento...</span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-stone-300 group-hover:text-[#D4AF37] transition-transform ${showFeelingsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFeelingsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-3xl border border-stone-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] p-6 max-h-[300px] overflow-y-auto custom-scrollbar animate-fade-up">
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
              {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <>Recibir Guía <Sparkles size={18} /></>}
            </button>
          </SacredCard>
        </div>
      </div>
    </div>
  );
}

function FeelingGroup({ title, icon, list, onSelect, selectedId }: { title: string, icon: string, list: Feeling[], onSelect: (f: Feeling) => void, selectedId?: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-4 px-2">{icon} {title}</h4>
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
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] transition-all border border-white/5 ${primary ? 'bg-[#D4AF37] text-white shadow-2xl hover:scale-105' : 'bg-white/5 text-stone-400 hover:text-white hover:border-white/20 hover:shadow-md'} ${disabled ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}
    >
      <div className={`${primary ? 'bg-white/20' : 'bg-[#D4AF37]/10'} p-4 rounded-2xl text-inherit`}>{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
