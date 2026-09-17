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
    color1 = '#34B7F1' // WhatsApp blueish tick color, or maybe #25D366 (green)
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Waveform state
  const [audioData, setAudioDataArray] = useState<Uint8Array>(new Uint8Array(30).fill(10));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [src]);

  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // We need about 30 bars, 64 fftSize gives 32 frequency bins
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (e) {
        console.warn("AudioContext setup failed, possibly CORS issue:", e);
      }
    }
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const updateWaveform = () => {
    if (analyserRef.current && isPlaying) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Normalize and map to our 30 bars
      const newBars = new Uint8Array(30);
      for(let i=0; i<30; i++) {
          // If we have less data than 30, map it. (fftSize 64 -> 32 bins)
          const value = dataArray[i] || 10; 
          // Scale it down to a percentage height 10-100
          newBars[i] = Math.max(10, Math.min(100, (value / 255) * 100));
      }
      setAudioDataArray(newBars);
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  useEffect(() => {
      if (isPlaying) {
          updateWaveform();
      } else {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          // Reset to a resting state
          setAudioDataArray(new Uint8Array(30).fill(15));
      }
  }, [isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      initAudioContext();
      audioRef.current.play().then(() => {
          setIsPlaying(true);
      }).catch((err: any) => {
        if (err.name === 'AbortError') return;
        console.error("Playback error:", err);
      });
    }
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

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative flex items-center gap-3 bg-[#1e2428] p-2 px-3 rounded-full shadow-sm max-w-[280px] ${className}`}>
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors"
      >
        {isPlaying ? (
          <Pause size={24} className="text-[#aebac1]" fill="currentColor" />
        ) : (
          <Play size={24} className="text-[#aebac1] ml-1" fill="currentColor" />
        )}
      </button>

      {/* Waveform & Slider Container */}
      <div className="flex-1 flex flex-col justify-center relative h-10 min-w-[130px]">
        {/* Realtime Waveform */}
        <div className="absolute inset-0 flex items-center justify-between gap-[2px] pointer-events-none">
          {Array.from(audioData).map((h, i) => {
             const isPlayed = (i / 30) * 100 <= progressPct;
             // If resting (not playing), make it static but slightly varied
             const height = isPlaying ? h : 15 + Math.sin(i * 0.5) * 5;
             return (
              <div 
                key={i} 
                className="flex-1 rounded-full transition-all duration-75" 
                style={{ 
                  height: `${Math.max(10, height)}%`, 
                  backgroundColor: isPlayed ? '#53bdeb' : '#8696a0',
                  opacity: 1
                }} 
              />
            );
          })}
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Custom thumb indicator (the circle) */}
        <div 
          className="absolute h-3 w-3 rounded-full shadow pointer-events-none top-1/2 -translate-y-1/2 transition-all duration-75"
          style={{ left: `calc(${progressPct}% - 6px)`, backgroundColor: '#53bdeb' }}
        />
      </div>
      
      {/* Time Indicator */}
      <div className="text-[11px] font-medium text-[#8696a0] min-w-[35px] text-right shrink-0">
        {formatTime(currentTime)}
      </div>

      {/* We need crossOrigin="anonymous" to allow AudioContext to process the audio if it comes from an external URL */}
      <audio 
        ref={audioRef} 
        src={src} 
        className="hidden" 
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
};
