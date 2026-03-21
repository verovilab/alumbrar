import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Waves, Bell, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

const TRACKS = [
  {
    id: 'bowls',
    name: 'Cuencos Tibetanos',
    icon: <Bell size={14} />,
    url: '/audio/bowls.mp3'
  },
  {
    id: 'water',
    name: 'Aguas de Paz',
    icon: <Waves size={14} />,
    url: '/audio/water.mp3'
  },
  {
    id: 'zen',
    name: 'Música Zen',
    icon: <Music size={14} />,
    url: '/audio/zen.mp3'
  },
  {
    id: 'sanctuary',
    name: 'A Peaceful Sanctuary',
    icon: <Music size={14} />,
    url: '/audio/sanctuary.mp3'
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

    const handleToggle = async (e: any) => {
      if (e.detail.action === 'play') {
        setIsExpanded(true);
        // Usar la preferencia guardada o el default
        const saved = localStorage.getItem('zen_audio_pref');
        let index = currentTrackIndex;
        if (saved) {
          try { index = JSON.parse(saved).trackIndex || 0; } catch(e) {}
        }
        await playTrack(index);
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

  // Manejar cambio de volumen directamente
  useEffect(() => {
    if (audioObj.current) {
      audioObj.current.volume = volume;
    }
  }, [volume]);

  // Sincronizar estado inicial y persistencia
  useEffect(() => {
    localStorage.setItem('zen_audio_pref', JSON.stringify({ 
      trackIndex: currentTrackIndex, 
      volume, 
      isPlaying 
    }));
  }, [isPlaying, currentTrackIndex, volume]);

  const playTrack = async (index: number) => {
    if (!audioObj.current) return;
    const track = TRACKS[index];
    
    try {
      // Siempre recargar si cambiamos de pista o si el src está vacío
      if (audioObj.current.src !== track.url) {
        audioObj.current.src = track.url;
        audioObj.current.load();
      }
      await audioObj.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error("Error playing track:", e);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioObj.current) return;
    
    if (isPlaying) {
      audioObj.current.pause();
      setIsPlaying(false);
    } else {
      await playTrack(currentTrackIndex);
    }
  };

  const handleSelectTrack = async (index: number) => {
    setCurrentTrackIndex(index);
    if (isPlaying || !isPlaying) { // Forzar play al seleccionar nueva
      await playTrack(index);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    handleSelectTrack(nextIndex);
  };

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.23, 1, 0.32, 1)] ${isExpanded ? 'w-48' : 'w-12'}`}>
      <div className={`glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-500`}>
        
        {/* Expanded Controls */}
        <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-56 p-4 opacity-100' : 'max-h-0 opacity-0'}`}>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {TRACKS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(i)}
                  title={t.name}
                  className={`flex items-center justify-center p-2 rounded-xl transition-all ${currentTrackIndex === i ? 'bg-[#D4AF37] text-white' : 'text-white/40 hover:bg-white/5'}`}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* Créditos — requerido por licencia CC BY */}
            <p className="text-[7px] text-white/20 text-center leading-tight mt-1">
              <a href="https://tristanlohengrin.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">Tristan Lohengrin</a>
              {' · '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">CC BY 4.0</a>
            </p>
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
