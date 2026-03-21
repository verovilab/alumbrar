import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Waves, Bell, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

const TRACKS = [
  { 
    id: 'bowls', 
    name: 'Cuencos Tibetanos', 
    icon: <Bell size={14} />, 
    url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_663309a4d8.mp3?filename=tibetan-singing-bowl-loop-7517.mp3' 
  },
  { 
    id: 'water', 
    name: 'Aguas de Paz', 
    icon: <Waves size={14} />, 
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c364c679a9.mp3?filename=gentle-ocean-waves-birdson-soft-nature-sounds-13113.mp3' 
  },
  { 
    id: 'zen', 
    name: 'Música Zen', 
    icon: <Music size={14} />, 
    url: 'https://cdn.pixabay.com/download/audio/2022/05/17/audio_1ee8f39564.mp3?filename=meditation-zen-yoga-music-11441.mp3' 
  }
];

export function ZenPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    // Cargar preferencia
    const saved = localStorage.getItem('zen_audio_pref');
    if (saved) {
      const pref = JSON.parse(saved);
      setCurrentTrackIndex(pref.trackIndex || 0);
      setVolume(pref.volume || 0.3);
    }
  }, []);

  useEffect(() => {
    const handleToggle = (e: any) => {
      if (e.detail.action === 'play') {
        setIsPlaying(true);
        setIsExpanded(true);
      } else if (e.detail.action === 'stop') {
        setIsPlaying(false);
      }
    };

    window.addEventListener('toggle-zen-audio', handleToggle);
    return () => window.removeEventListener('toggle-zen-audio', handleToggle);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play error", e));
      } else {
        audioRef.current.pause();
      }
    }
    
    // Guardar preferencia
    localStorage.setItem('zen_audio_pref', JSON.stringify({ trackIndex: currentTrackIndex, volume }));
  }, [isPlaying, currentTrackIndex, volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.23, 1, 0.32, 1)] ${isExpanded ? 'w-48' : 'w-12'}`}>
      <div className="glass-dark rounded-full overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Expanded Controls */}
        <div className={`transition-all duration-500 ${isExpanded ? 'h-32 p-4 opacity-100' : 'h-0 opacity-0'}`}>
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
                  className={`p-2 rounded-lg transition-all ${currentTrackIndex === i ? 'bg-[#D4AF37] text-white' : 'text-white/40 hover:bg-white/5'}`}
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
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#D4AF37] text-white animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
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

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url}
      />
    </div>
  );
}
