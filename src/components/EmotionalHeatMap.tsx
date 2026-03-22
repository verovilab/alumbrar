import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, AlertCircle } from 'lucide-react';

interface HeatMapDay {
  date: string;
  category: 'expansivo' | 'neutro' | 'contractivo' | null;
  color_hex: string;
  emoji: string;
  day_of_week: number;
}

export function EmotionalHeatMap({ userId }: { userId?: string }) {
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
        const dateStr = d.toISOString().split('T')[0];
        
        const record = data?.find(r => r.date === dateStr);
        
        last35Days.push({
          date: dateStr,
          category: record?.category || null,
          color_hex: record?.color_hex || '#f5f5f4', // stone-100 fallback
          emoji: record?.emoji || '',
          day_of_week: d.getDay()
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

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-4 text-stone-200">
      <RefreshCw className="animate-spin" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sincronizando racha...</p>
    </div>
  );

  if (error) return (
    <div className="py-20 text-center flex flex-col items-center gap-4 text-red-400">
      <AlertCircle size={32} />
      <p className="text-sm font-medium">No pudimos cargar tu mapa emocional.</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-6">
         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Últimos 35 días</h4>
         <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-stone-300">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-expansivo)' }}></div> Expansivo</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-neutro)' }}></div> Neutro</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-contractivo)' }}></div> Contractivo</div>
         </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-8">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-stone-300 py-2">{d}</div>
        ))}
        {days.map((day, idx) => (
          <div 
            key={idx}
            className={`aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm relative group`}
            style={{ 
              backgroundColor: day.category ? day.color_hex : '#f5f5f4',
              opacity: day.category ? 1 : 0.3
            }}
          >
            <span className="text-xs">{day.emoji}</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-900 text-white text-[9px] font-black uppercase whitespace-nowrap rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              {day.date} {day.category ? `• ${day.category}` : ''}
            </div>
          </div>
        ))}
      </div>
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
