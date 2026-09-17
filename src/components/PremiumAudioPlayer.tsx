import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface PremiumAudioPlayerProps {
  src: string;
  className?: string;
  styleType?: string;
  color1?: string;
  color2?: string;
}

export const PremiumAudioPlayer: React.FC<PremiumAudioPlayerProps> = ({ 
    src, 
    className = "", 
    color1 = '#25D366' // Default to WhatsApp-ish green
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err: any) => {
        if (err.name === 'AbortError') return;
        console.error("Playback error:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Fake waveform bars
  const bars = Array.from({ length: 30 }).map((_, i) => {
    const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
    return height;
  });

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 px-3 rounded-full border border-white/5 shadow-sm max-w-[280px] ${className}`}>
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer bg-white/10 hover:bg-white/20 transition-colors"
      >
        {isPlaying ? (
          <Pause size={18} className="text-white" fill="currentColor" />
        ) : (
          <Play size={18} className="text-white ml-1" fill="currentColor" />
        )}
      </button>

      {/* Waveform & Slider Container */}
      <div className="flex-1 flex flex-col justify-center relative h-10 min-w-[120px]">
        {/* Fake Waveform Background */}
        <div className="absolute inset-0 flex items-center gap-[2px] opacity-30 pointer-events-none px-1">
          {bars.map((h, i) => {
             const isPlayed = (i / bars.length) * 100 <= progressPct;
             return (
              <div 
                key={i} 
                className="flex-1 rounded-full transition-all duration-150" 
                style={{ 
                  height: `${h}%`, 
                  backgroundColor: isPlayed ? color1 : '#ffffff',
                  opacity: isPlaying && !isPlayed ? 0.7 + Math.random() * 0.3 : 1
                }} 
              />
            );
          })}
        </div>

        {/* Range Slider (The Circle) */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Custom thumb/circle indicator */}
        <div 
          className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none top-1/2 -translate-y-1/2 transition-all duration-75"
          style={{ left: `calc(${progressPct}% - 6px)`, backgroundColor: color1 }}
        />
      </div>
      
      {/* Time Indicator */}
      <div className="text-[11px] font-medium text-white/70 min-w-[35px] text-right shrink-0">
        {formatTime(currentTime)}
      </div>

      <audio 
        ref={audioRef} 
        src={src} 
        className="hidden" 
        preload="metadata" 
      />
    </div>
  );
};
