import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, AlertCircle, Sparkles, Zap, Calendar, RefreshCw as RefreshIcon } from 'lucide-react';

interface HeatMapDay {
  date: string;
  category: 'expansivo' | 'neutro' | 'contractivo' | null;
  color_hex: string;
  emoji: string;
  day_of_week: number;
  user_input?: string;
  feeling?: string;
}

export function EmotionalHeatMap({ userId, showInsights = false }: { userId?: string, showInsights?: boolean }) {
  const [days, setDays] = useState<HeatMapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchHeatMapData();
    }
  }, [userId]);

  const fetchHeatMapData = async () => {
    try {
      setLoading(true);
      // Traer los últimos 35 días
      const { data, error: dbError } = await supabase
        .from('user_emotion_heatmap')
        .select('*')
        .eq('user_id', userId)
        .limit(35);

      if (dbError) throw dbError;

      // Crear un mapa de 35 días atrás hasta hoy
      const today = new Date();
      const last35Days: HeatMapDay[] = [];
      
      for (let i = 34; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD local
        
        const record = data?.find(r => r.date === dateStr);
        
        last35Days.push({
          date: dateStr,
          category: record?.category || null,
          color_hex: record?.color_hex || '#ffffff', // BLANCO si no hay práctica
          emoji: record?.emoji || '',
          day_of_week: d.getDay(),
          user_input: record?.user_input,
          feeling: record?.feeling
        });
      }

      setDays(last35Days);
    } catch (err: any) {
      console.error('Error fetching heatmap:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeDays = days.filter(d => d.category);
    const expansivos = activeDays.filter(d => d.category === 'expansivo').length;
    const neutros = activeDays.filter(d => d.category === 'neutro').length;
    const contractivos = activeDays.filter(d => d.category === 'contractivo').length;
    
    // Calcular racha actual
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].category) streak++;
      else if (i < days.length - 1) break; // Solo corta si no es hoy/ayer y hay un hueco
    }

    // Encontrar sentimiento más frecuente
    const feelings = activeDays.map(d => d.feeling).filter(Boolean);
    const mostFrequentFeeling = feelings.length > 0 
      ? Object.entries(feelings.reduce((acc: any, f) => { acc[f!] = (acc[f!] || 0) + 1; return acc; }, {}))
          .sort((a: any, b: any) => b[1] - a[1])[0][0]
      : 'Paz';

    return { expansivos, neutros, contractivos, streak, mostFrequentFeeling, total: activeDays.length };
  }, [days]);

  const insights = useMemo(() => {
    const list = [];
    if (stats.expansivos > stats.contractivos) {
      list.push(`Estás en un ciclo de expansión luminosa (${Math.round((stats.expansivos/stats.total)*100)}% del tiempo). Tu mente está lista para milagros profundos.`);
    } else if (stats.contractivos > 0) {
      list.push(`Has transitado momentos de sombra. Recordá que el perdón es la llave para salir de la contracción hacia la paz.`);
    }

    if (stats.streak >= 3) {
      list.push(`¡Llevas una racha de ${stats.streak} días conectando con tu sentir! La constancia es el puente hacia la percepción verdadera.`);
    }

    if (stats.mostFrequentFeeling === 'Ansiedad' || stats.mostFrequentFeeling === 'Miedo') {
      list.push(`Tu sentimiento predominante es ${stats.mostFrequentFeeling}. Entregá esta percepción al Espíritu Santo para verla de otra manera.`);
    }

    if (list.length === 0) {
      list.push("Tu viaje emocional está comenzando. Cada registro es un paso hacia la libertad interior.");
      list.push("Practicá la quietud hoy, sin importar cómo te sientas.");
    }

    return list;
  }, [stats]);

  if (loading) return (
    <div className="py-10 flex flex-col items-center gap-4 text-stone-200">
      <RefreshIcon className="animate-spin" size={24} />
      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Sincronizando racha...</p>
    </div>
  );

  if (error) return (
    <div className="py-10 text-center flex flex-col items-center gap-4 text-red-300">
      <AlertCircle size={24} />
      <p className="text-[10px] font-black uppercase tracking-widest">Error de sincronización</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <div className="flex justify-between items-end mb-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Mapa Emocional (35 días)</h4>
           <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-stone-300">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Exp.</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Neu.</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Con.</div>
           </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
            <div key={d} className="text-center text-[9px] font-black text-stone-300 py-1">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div 
              key={idx}
              className={`aspect-square rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-stone-100/50 group relative`}
              style={{ 
                backgroundColor: day.category ? day.color_hex : '#ffffff',
                opacity: day.category ? 1 : 0.4
              }}
            >
              <span className="text-[10px]">{day.emoji}</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-900 text-white text-[8px] font-black uppercase whitespace-nowrap rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-white/10">
                {day.date} {day.feeling ? `• ${day.feeling}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInsights && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
             <MiniStatCard label="Expansivos" value={stats.expansivos} color="text-green-500" />
             <MiniStatCard label="Racha" value={stats.streak} color="text-[#D4AF37]" suffix="d" />
             <MiniStatCard label="Top" value={stats.mostFrequentFeeling} color="text-stone-600" isSmall />
          </div>

          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[60px]"></div>
            <div className="relative z-10">
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-6 flex items-center gap-2">
                <Sparkles size={12} /> Insights del Guía
              </h4>
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-1.5 group-hover:scale-150 transition-transform shrink-0"></div>
                    <p className="text-stone-400 text-[11px] leading-relaxed group-hover:text-white transition-colors">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStatCard({ label, value, color, suffix = '', isSmall = false }: { label: string, value: string | number, color: string, suffix?: string, isSmall?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col gap-0.5 items-center transition-all hover:bg-stone-50 group">
      <span className="text-[8px] font-black uppercase tracking-widest text-stone-300 group-hover:text-[#D4AF37] transition-colors">{label}</span>
      <span className={`font-serif font-black ${color} ${isSmall ? 'text-xs' : 'text-lg'}`}>
        {value}{suffix}
      </span>
    </div>
  );
}

function RefreshCw({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
