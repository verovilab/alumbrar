import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Waves, Bell, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

const TRACKS = [
  { 
    id: 'bowls', 
    name: 'Cuencos Tibetanos', 
    icon: <Bell size={14} />, 
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tibetan_Singing_Bowl_-_1.mp3' 
  },
  { 
    id: 'water', 
    name: 'Aguas de Paz', 
    icon: <Waves size={14} />, 
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/River_flow_sounds.mp3'
  },
  { 
    id: 'zen', 
    name: 'Música Zen', 
    icon: <Music size={14} />, 
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Bells_and_birds.mp3'
  },
  {
    id: 'test',
    name: 'Diagnóstico',
    icon: <Bell size={14} />,
    url: 'https://www.soundjay.com/buttons/beep-01a.mp3'
  }
];

export function ZenPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioObj = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Inicializar audio una sola vez
  useEffect(() => {
    if (!audioObj.current) {
      audioObj.current = new Audio();
      audioObj.current.loop = true;
      audioObj.current.crossOrigin = "anonymous";
    }

    // Cargar preferencia
    const saved = localStorage.getItem('zen_audio_pref');
    if (saved) {
      try {
        const pref = JSON.parse(saved);
        setCurrentTrackIndex(pref.trackIndex || 0);
        setVolume(pref.volume || 0.3);
      } catch (e) {}
    }

    const handleToggle = (e: any) => {
      if (e.detail.action === 'play') {
        setIsPlaying(true);
        setIsExpanded(true);
      }
    };

    window.addEventListener('toggle-zen-audio', handleToggle);
    return () => {
      window.removeEventListener('toggle-zen-audio', handleToggle);
      if (audioObj.current) {
        audioObj.current.pause();
        audioObj.current = null;
      }
    };
  }, []);

  // Actualizar volumen
  useEffect(() => {
    if (audioObj.current) {
      audioObj.current.volume = volume;
    }
  }, [volume]);

  // Manejar cambio de Pista y Play/Pause
  useEffect(() => {
    const playLogic = async () => {
      if (!audioObj.current) return;

      if (isPlaying) {
        // Si la URL cambió, cargamos la nueva
        const currentSrc = audioObj.current.src;
        // Normalizar URL para comparación
        if (currentSrc !== currentTrack.url) {
          audioObj.current.src = currentTrack.url;
          audioObj.current.load();
        }
        
        try {
          await audioObj.current.play();
        } catch (e) {
          console.error("Audio error:", e);
          setIsPlaying(false);
        }
      } else {
        audioObj.current.pause();
      }
    };

    playLogic();

    localStorage.setItem('zen_audio_pref', JSON.stringify({ 
      trackIndex: currentTrackIndex, 
      volume, 
      isPlaying 
    }));
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.23, 1, 0.32, 1)] ${isExpanded ? 'w-48' : 'w-12'}`}>
      <div className={`glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-500`}>
        
        {/* Expanded Controls */}
        <div className={`transition-all duration-500 ${isExpanded ? 'h-32 p-4 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] truncate w-24">
                {currentTrack.name}
              </span>
              <button onClick={nextTrack} className="text-white/40 hover:text-[#D4AF37] transition-colors">
                <ChevronUp size={12} />
              </button>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            
            <div className="flex justify-center gap-4">
              {TRACKS.map((t, i) => (
                <button 
                  key={t.id} 
                  onClick={() => setCurrentTrackIndex(i)}
                  className={`p-2 rounded-xl transition-all ${currentTrackIndex === i ? 'bg-[#D4AF37] text-white' : 'text-white/40 hover:bg-white/5'}`}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Toggle Button */}
        <div className="h-12 flex items-center justify-between px-2">
          <button 
            onClick={togglePlay}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-[#D4AF37] text-white animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-2 text-white/40 hover:text-[#D4AF37]"
            >
              <Volume2 size={14} />
            </button>
          )}
          
          {!isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-[#D4AF37]"
            >
              {currentTrack.icon}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
