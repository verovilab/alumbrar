import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  ChevronLeft,
  CheckCircle2,
  Wind,
  Sparkles,
  Zap,
  Clock3
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PracticeViewProps {
  userId: string;
  dayOfYear: number;
}

type PracticeMode = 'brief' | 'guided' | 'deep';

interface LessonContent {
  title: string;
  phrase: string;
  guideIdea: string;
  explanation: string;
  microaction: string;
}

interface FormData {
  situacion: string;
  interpretacion: string;
  reinterpretacion: string;
  emocion: string;
  decision: string;
}

const MODE_CONFIG: Record<
  PracticeMode,
  {
    label: string;
    minutes: string;
    subtitle: string;
    timerSeconds: number;
  }
> = {
  brief: {
    label: 'Volver al centro',
    minutes: '1 min',
    subtitle: 'Una pausa breve para recordar la paz.',
    timerSeconds: 60
  },
  guided: {
    label: 'Reflexión guiada',
    minutes: '3 min',
    subtitle: 'Una práctica simple para ordenar tu mirada.',
    timerSeconds: 60
  },
  deep: {
    label: 'Práctica profunda',
    minutes: '5 min',
    subtitle: 'Un espacio más completo para trabajar tu experiencia.',
    timerSeconds: 90
  }
};

export function PracticeView({ userId, dayOfYear }: PracticeViewProps) {
  // =========================
  // ESTADO PRINCIPAL
  // =========================
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('guided');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    situacion: '',
    interpretacion: '',
    reinterpretacion: '',
    emocion: '',
    decision: ''
  });

  const [lessonContent, setLessonContent] = useState<LessonContent>({
    title: `Lección ${dayOfYear}`,
    phrase: 'La paz de Dios es mi único objetivo hoy.',
    guideIdea: 'Solo la paz es real.',
    explanation:
      'La respuesta no está en controlar el mundo, sino en permitir una nueva percepción. La paz no llega cuando todo se ordena afuera, sino cuando dejás de usar el conflicto como maestro.',
    microaction: 'Respirá profundamente 3 veces.'
  });

  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.guided.timerSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  // =========================
  // CONFIG DINÁMICA SEGÚN MODO
  // =========================
  const modeInfo = useMemo(() => MODE_CONFIG[selectedMode], [selectedMode]);

  const totalSteps = 4;

  // =========================
  // CARGA DE CONTENIDO
  // Ajustá nombres de tabla/campos si en tu base cambian.
  // Si falla, usa contenido fallback sin romper la UI.
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadPracticeContent() {
      setLoadingContent(true);

      try {
        // 1) Buscar lección del día
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('day', dayOfYear)
          .maybeSingle();

        // 2) Buscar gema aleatoria
        // Si tenés facetas más adelante, acá podés filtrar.
        const { data: gemRows } = await supabase
          .from('gemas')
          .select('*')
          .limit(500);

        if (cancelled) return;

        const randomGem =
          gemRows && gemRows.length > 0
            ? gemRows[Math.floor(Math.random() * gemRows.length)]
            : null;

        setLessonContent({
          title:
            lessonData?.title ||
            lessonData?.nombre ||
            lessonData?.lesson_title ||
            `Lección ${dayOfYear}`,
          phrase:
            lessonData?.phrase ||
            lessonData?.frase ||
            lessonData?.idea_central ||
            'La paz de Dios es mi único objetivo hoy.',
          guideIdea:
            randomGem?.guide_idea ||
            randomGem?.idea_guia ||
            randomGem?.title ||
            randomGem?.texto ||
            'Solo la paz es real.',
          explanation:
            lessonData?.explanation ||
            lessonData?.explicacion ||
            lessonData?.content ||
            lessonData?.texto ||
            'La respuesta no está en controlar el mundo, sino en permitir una nueva percepción. La paz no llega cuando todo se ordena afuera, sino cuando dejás de usar el conflicto como maestro.',
          microaction:
            randomGem?.microaction ||
            randomGem?.microaccion ||
            'Respirá profundamente 3 veces.'
        });
      } catch (error) {
        console.error('Error loading practice content:', error);
      } finally {
        if (!cancelled) setLoadingContent(false);
      }
    }

    loadPracticeContent();

    return () => {
      cancelled = true;
    };
  }, [dayOfYear]);

  // =========================
  // RESETEO DEL TIMER AL CAMBIAR MODO
  // =========================
  useEffect(() => {
    setTimeLeft(modeInfo.timerSeconds);
    setTimerActive(false);
    setPracticeCompleted(false);
  }, [modeInfo.timerSeconds, selectedMode]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    let interval: number | null = null;

    if (timerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setTimerActive(false);
      setPracticeCompleted(true);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // =========================
  // PROGRESO
  // =========================
  const progressWidth = `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%`;

  // =========================
  // HELPERS
  // =========================
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const startTimer = () => {
    if (!timerActive && timeLeft > 0) {
      setTimerActive(true);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!formData.situacion.trim()) {
        alert('Escribí primero qué te está ocupando hoy.');
        return;
      }

      if (selectedMode !== 'brief') {
        if (!formData.interpretacion.trim()) {
          alert('Completá al menos tu interpretación actual antes de continuar.');
          return;
        }
      }

      if (selectedMode === 'deep') {
        if (!formData.reinterpretacion.trim() || !formData.decision.trim()) {
          alert('Completá la nueva mirada y tu pequeña decisión de hoy.');
          return;
        }
      }

      if (selectedMode === 'guided') {
        if (!formData.reinterpretacion.trim()) {
          alert('Completá cómo podrías verlo diferente antes de continuar.');
          return;
        }
      }

      goToStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!practiceCompleted) {
        alert('Completá primero la microacción.');
        return;
      }

      goToStep(4);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const restartPractice = () => {
    setSelectedMode('guided');
    setCurrentStep(1);
    setFormData({
      situacion: '',
      interpretacion: '',
      reinterpretacion: '',
      emocion: '',
      decision: ''
    });
    setTimeLeft(MODE_CONFIG.guided.timerSeconds);
    setTimerActive(false);
    setPracticeCompleted(false);
  };

  // =========================
  // GUARDADO
  // =========================
  const handleSavePractice = async () => {
    setIsSaving(true);

    try {
      const payload = {
        user_id: userId,
        lesson_day: dayOfYear,
        mode: selectedMode,
        situacion: formData.situacion,
        emocion: formData.emocion,
        interpretacion: formData.interpretacion,
        reinterpretacion: formData.reinterpretacion,
        decision: formData.decision,
        timer_seconds: modeInfo.timerSeconds
      };

      const { error } = await supabase.from('user_practices').insert(payload);

      if (error) throw error;

      alert('Tu práctica fue guardada.');
      restartPractice();
    } catch (error) {
      console.error('Error saving practice:', error);
      alert('Hubo un error al guardar tu práctica.');
    } finally {
      setIsSaving(false);
    }
  };

  // =========================
  // RENDER CAMPOS SEGÚN MODO
  // =========================
  const renderReflectionFields = () => {
    if (selectedMode === 'brief') {
      return (
        <div className="space-y-5">
          <FieldCard>
            <FieldLabel>¿Qué te está ocupando hoy?</FieldLabel>
            <textarea
              value={formData.situacion}
              onChange={(e) => handleFieldChange('situacion', e.target.value)}
              placeholder="Nombralo sin exigencia..."
              className={textareaClass}
            />
          </FieldCard>

          <FieldCard>
            <FieldLabel>Emoción principal</FieldLabel>
            <select
              value={formData.emocion}
              onChange={(e) => handleFieldChange('emocion', e.target.value)}
              className={selectClass}
            >
              <option value="">Elegí una opción</option>
              <option value="paz">Paz</option>
              <option value="ansiedad">Ansiedad</option>
              <option value="enojo">Enojo</option>
              <option value="tristeza">Tristeza</option>
              <option value="confusion">Confusión</option>
              <option value="cansancio">Cansancio</option>
            </select>
          </FieldCard>
        </div>
      );
    }

    if (selectedMode === 'guided') {
      return (
        <div className="space-y-5">
          <FieldCard>
            <FieldLabel>¿Qué te inquieta hoy?</FieldLabel>
            <textarea
              value={formData.situacion}
              onChange={(e) => handleFieldChange('situacion', e.target.value)}
              placeholder="Escribí brevemente la situación..."
              className={textareaClass}
            />
          </FieldCard>

          <FieldCard>
            <FieldLabel>¿Cómo lo estás interpretando ahora?</FieldLabel>
            <textarea
              value={formData.interpretacion}
              onChange={(e) => handleFieldChange('interpretacion', e.target.value)}
              placeholder="Escribí tu mirada actual..."
              className={textareaClass}
            />
          </FieldCard>

          <FieldCard>
            <FieldLabel>¿Qué podrías elegir ver diferente?</FieldLabel>
            <textarea
              value={formData.reinterpretacion}
              onChange={(e) => handleFieldChange('reinterpretacion', e.target.value)}
              placeholder="Intentá escribir una nueva mirada desde la paz..."
              className={textareaClass}
            />
          </FieldCard>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <FieldCard>
          <FieldLabel>¿Qué situación te está ocupando hoy?</FieldLabel>
          <textarea
            value={formData.situacion}
            onChange={(e) => handleFieldChange('situacion', e.target.value)}
            placeholder="Nombrá con honestidad lo que hoy te inquieta..."
            className={textareaClass}
          />
        </FieldCard>

        <FieldCard>
          <FieldLabel>¿Qué emoción aparece en vos?</FieldLabel>
          <textarea
            value={formData.emocion}
            onChange={(e) => handleFieldChange('emocion', e.target.value)}
            placeholder="Ejemplo: miedo, enojo, tristeza, cansancio..."
            className={textareaClass}
          />
        </FieldCard>

        <FieldCard>
          <FieldLabel>¿Cómo estás interpretando lo que pasa?</FieldLabel>
          <textarea
            value={formData.interpretacion}
            onChange={(e) => handleFieldChange('interpretacion', e.target.value)}
            placeholder="Escribí tu interpretación actual..."
            className={textareaClass}
          />
        </FieldCard>

        <FieldCard>
          <FieldLabel>Si eligieras paz, ¿cómo podrías verlo diferente?</FieldLabel>
          <textarea
            value={formData.reinterpretacion}
            onChange={(e) => handleFieldChange('reinterpretacion', e.target.value)}
            placeholder="Escribí una nueva percepción..."
            className={textareaClass}
          />
        </FieldCard>

        <FieldCard>
          <FieldLabel>¿Qué pequeña decisión querés tomar hoy?</FieldLabel>
          <textarea
            value={formData.decision}
            onChange={(e) => handleFieldChange('decision', e.target.value)}
            placeholder="Ejemplo: pausar antes de responder, no alimentar el conflicto, respirar..."
            className={textareaClass}
          />
        </FieldCard>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* PROGRESS */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">
            {currentStep <= totalSteps ? `Paso ${currentStep} de ${totalSteps}` : 'Completado'}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37]">
            Práctica diaria
          </span>
        </div>

        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E1C55D] transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {/* STEP 1: ELEGIR TIEMPO */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-up">
          <HeroCard
            icon={<Wind className="text-[#D4AF37]" size={28} />}
            title={`“${lessonContent.phrase}”`}
            caption="Tu guía espiritual"
          />

          <InputCard
            eyebrow="Comenzar práctica"
            title="¿Cómo querés practicar hoy?"
            subtitle="Elegí el tiempo que hoy sí podés darte. Alumbrar se adapta a tu día."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {(Object.keys(MODE_CONFIG) as PracticeMode[]).map((mode) => {
                const item = MODE_CONFIG[mode];
                const active = selectedMode === mode;

                return (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`text-left rounded-[2rem] border p-5 transition-all ${
                      active
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl'
                        : 'bg-white border-stone-100 text-stone-700 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span
                        className={`text-[10px] uppercase tracking-widest font-black ${
                          active ? 'text-[#D4AF37]' : 'text-stone-400'
                        }`}
                      >
                        {item.minutes}
                      </span>
                      <Clock3 size={16} className={active ? 'text-[#D4AF37]' : 'text-stone-300'} />
                    </div>

                    <h4 className="font-serif text-xl leading-tight mb-2">{item.label}</h4>
                    <p className={`text-sm leading-relaxed ${active ? 'text-stone-300' : 'text-stone-400'}`}>
                      {item.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextStep}
              className="w-full mt-8 bg-[#D4AF37] hover:bg-stone-900 text-white font-black uppercase tracking-widest py-5 rounded-[2rem] transition-all shadow-xl shadow-[#D4AF37]/20"
            >
              Continuar
            </button>
          </InputCard>
        </div>
      )}

      {/* STEP 2: DOS TARJETAS */}
      {currentStep === 2 && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            {/* IZQUIERDA: GUÍA */}
            <InputCard
              eyebrow="Guía de reflexión"
              title={selectedMode === 'brief' ? 'Una pausa breve' : selectedMode === 'guided' ? 'Reflexión guiada' : 'Práctica profunda'}
              subtitle={`Modo ${modeInfo.minutes}. Completá solo lo necesario para hoy.`}
            >
              {renderReflectionFields()}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Volver
                </button>

                <button
                  onClick={nextStep}
                  className="flex-[1.4] py-5 rounded-[2rem] bg-[#D4AF37] text-white font-black uppercase tracking-widest hover:bg-stone-900 transition-all shadow-xl shadow-[#D4AF37]/20"
                >
                  Ir a la práctica
                </button>
              </div>
            </InputCard>

            {/* DERECHA: LECCIÓN */}
            <div className="space-y-6">
              <HeroCard
                icon={<Sparkles className="text-[#D4AF37]" size={28} />}
                title={lessonContent.title}
                caption="Un Curso de Milagros"
              />

              <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 shadow-xl">
                <span className="text-[10px] uppercase tracking-widest font-black text-stone-400 mb-3 block">
                  Idea central
                </span>

                <div className="text-2xl md:text-3xl font-serif italic leading-relaxed text-stone-800 mb-6">
                  “{lessonContent.phrase}”
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-3">
                    Idea guía
                  </h4>
                  <p className="text-stone-700 text-lg leading-relaxed">{lessonContent.guideIdea}</p>
                </div>

                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <p className="text-stone-600 leading-relaxed text-[15px]">
                    {loadingContent ? 'Cargando contenido...' : lessonContent.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: MICROACCIÓN */}
      {currentStep === 3 && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            {/* IZQUIERDA: RESUMEN DE LO ESCRITO */}
            <InputCard
              eyebrow="Tu práctica"
              title="Traé tu situación a este minuto"
              subtitle="No hace falta resolver nada ahora. Solo quedate un momento con una nueva disposición."
            >
              <div className="space-y-5">
                <SummaryMini label="Lo que te ocupa hoy" content={formData.situacion || '—'} />
                {formData.emocion ? <SummaryMini label="Emoción" content={formData.emocion} /> : null}
                {formData.interpretacion ? (
                  <SummaryMini label="Tu interpretación" content={formData.interpretacion} />
                ) : null}
                {formData.reinterpretacion ? (
                  <SummaryMini label="Nueva mirada" content={formData.reinterpretacion} />
                ) : null}
                {formData.decision ? (
                  <SummaryMini label="Pequeña decisión de hoy" content={formData.decision} />
                ) : null}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  Volver
                </button>

                <button
                  onClick={nextStep}
                  disabled={!practiceCompleted}
                  className={`flex-[1.4] py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl ${
                    practiceCompleted
                      ? 'bg-[#D4AF37] text-white shadow-[#D4AF37]/20 hover:bg-stone-900'
                      : 'bg-stone-50 text-stone-300 shadow-none cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </InputCard>

            {/* DERECHA: MICROACCIÓN */}
            <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 shadow-xl">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-3 block">
                Microacción
              </span>

              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2 leading-tight">
                Practicá ahora
              </h3>

              <p className="text-stone-400 text-sm leading-relaxed mb-8">
                {selectedMode === 'brief'
                  ? 'Un minuto alcanza para volver al centro.'
                  : selectedMode === 'guided'
                  ? 'Una pausa simple puede cambiar la dirección de tu mente.'
                  : 'Darte un poco más de tiempo puede abrir una percepción nueva.'}
              </p>

              <div className="bg-[#FEFCE8] border border-yellow-100 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={64} className="text-[#D4AF37]" />
                </div>

                <h4 className="text-[10px] uppercase tracking-widest font-black text-stone-400 mb-2 flex items-center justify-center gap-2">
                  <Zap size={14} className="text-[#D4AF37]" />
                  Microacción
                </h4>

                <p className="text-lg text-stone-700 font-medium mb-6">{lessonContent.microaction}</p>

                <div className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-3xl p-6 italic font-serif text-xl border-dashed mb-8 text-stone-800">
                  “{lessonContent.phrase}”
                </div>

                <div className="flex justify-center mb-8 gap-2">
                  <span className={`px-3 py-2 rounded-full text-xs font-black ${selectedMode === 'brief' ? 'bg-stone-900 text-[#D4AF37]' : 'bg-stone-100 text-stone-400'}`}>
                    1 min
                  </span>
                  <span className={`px-3 py-2 rounded-full text-xs font-black ${selectedMode === 'guided' ? 'bg-stone-900 text-[#D4AF37]' : 'bg-stone-100 text-stone-400'}`}>
                    3 min
                  </span>
                  <span className={`px-3 py-2 rounded-full text-xs font-black ${selectedMode === 'deep' ? 'bg-stone-900 text-[#D4AF37]' : 'bg-stone-100 text-stone-400'}`}>
                    5 min
                  </span>
                </div>

                <div className="flex justify-center mb-8">
                  <div
                    className={`w-32 h-32 rounded-full border-8 ${
                      practiceCompleted ? 'border-green-400' : 'border-[#D4AF37]'
                    } bg-white flex items-center justify-center text-4xl font-black shadow-lg shadow-[#D4AF37]/10 transition-colors`}
                  >
                    {practiceCompleted ? <CheckCircle2 className="text-green-500" size={48} /> : timeLeft}
                  </div>
                </div>

                {!practiceCompleted ? (
                  <button
                    onClick={startTimer}
                    disabled={timerActive}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                      timerActive
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-[#D4AF37] text-white hover:bg-stone-900'
                    }`}
                  >
                    {timerActive ? 'Practicando...' : `Practicar ahora (${modeInfo.timerSeconds}s)`}
                  </button>
                ) : (
                  <p className="text-green-600 font-bold animate-fade-in flex items-center justify-center gap-2">
                    Práctica completada con éxito
                    <CheckCircle2 size={18} />
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CIERRE + GUARDADO */}
      {currentStep === 4 && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            <div className="bg-white border border-stone-100 rounded-[3rem] p-10 shadow-xl overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Tu práctica de hoy</h3>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                    Lista para guardar
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <SummaryItem label="Modo elegido" content={`${modeInfo.minutes} · ${modeInfo.label}`} />
                <SummaryItem label="Lo que ocupaba tu mente" content={formData.situacion || '—'} />
                {formData.emocion ? <SummaryItem label="Emoción" content={formData.emocion} /> : null}
                {formData.interpretacion ? (
                  <SummaryItem label="Tu interpretación inicial" content={formData.interpretacion} />
                ) : null}
                {formData.reinterpretacion ? (
                  <SummaryItem label="Tu nueva mirada" content={formData.reinterpretacion} />
                ) : null}
                {formData.decision ? (
                  <SummaryItem label="Tu pequeña decisión" content={formData.decision} border />
                ) : null}
              </div>

              <div className="mt-12 flex gap-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-5 rounded-[2rem] bg-stone-100 text-stone-500 font-black uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  Volver
                </button>

                <button
                  onClick={handleSavePractice}
                  disabled={isSaving}
                  className="flex-[1.3] bg-[#D4AF37] text-white font-black uppercase tracking-widest py-5 rounded-[2rem] hover:bg-stone-900 transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCw size={20} className="animate-spin" /> : 'Guardar práctica'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <HeroCard
                icon={<Sparkles className="text-[#D4AF37]" size={28} />}
                title="Hoy elegiste ver diferente"
                caption="Cierre"
              />

              <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 shadow-xl">
                <p className="text-stone-600 leading-relaxed text-lg">
                  No cambió el mundo. Cambió tu manera de mirarlo.
                </p>

                <div className="mt-6 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-3">
                    Recordatorio
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    Alumbrar no necesita responderte siempre con IA. Ya tenés una práctica, un camino y un gesto concreto hecho hoy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================
// ESTILOS DE CAMPOS
// =========================
const textareaClass =
  'w-full min-h-[110px] p-5 rounded-3xl bg-white border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all text-stone-800 leading-relaxed font-medium shadow-sm';

const selectClass =
  'w-full h-14 px-5 rounded-3xl bg-white border border-stone-100 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all text-stone-700 font-medium shadow-sm';

// =========================
// SUBCOMPONENTES
// =========================
function HeroCard({
  icon,
  title,
  caption
}: {
  icon: React.ReactNode;
  title: string;
  caption: string;
}) {
  return (
    <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden mb-6 group">
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
      <div className="relative z-10">
        <div className="mb-6">{icon}</div>
        <h2 className="text-2xl lg:text-3xl font-serif italic leading-relaxed text-[#FFF9F0]">
          {title}
        </h2>
        <div className="mt-8 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">
            {caption}
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function InputCard({
  eyebrow,
  title,
  subtitle,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FCFBFA] border border-stone-100 rounded-[3rem] p-8 lg:p-10 shadow-xl">
      <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-3 block">
        {eyebrow}
      </span>
      <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2 leading-tight">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-stone-100 rounded-[2rem] p-4 shadow-sm">{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-3">
      {children}
    </label>
  );
}

function SummaryMini({ label, content }: { label: string; content: string }) {
  return (
    <div className="p-5 rounded-[2rem] bg-stone-50 border border-stone-100">
      <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-2">{label}</h4>
      <p className="text-stone-600 text-sm leading-relaxed font-medium whitespace-pre-line">{content}</p>
    </div>
  );
}

function SummaryItem({
  label,
  content,
  border
}: {
  label: string;
  content: string;
  border?: boolean;
}) {
  return (
    <div className={`group ${border ? 'pt-6 border-t border-dashed border-stone-200' : ''}`}>
      <h4 className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] mb-2 group-hover:translate-x-1 transition-transform">
        {label}
      </h4>
      <p className="text-stone-600 leading-relaxed text-sm font-medium whitespace-pre-line">{content}</p>
    </div>
  );
}
