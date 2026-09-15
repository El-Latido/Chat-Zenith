import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Play, Pause, Mic, Radio } from 'lucide-react';

interface PremiumAudioPlayerProps {
  src: string;
  className?: string;
}

export const PremiumAudioPlayer: React.FC<PremiumAudioPlayerProps> = ({ src, className = "" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Generate deterministic pseudo-random bar heights based on src hash
  const barHeights = useMemo(() => {
    const bars: number[] = [];
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      hash = (hash << 5) - hash + src.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash) || 12345;
    
    // Generate 26 bars with realistic voice envelope (lower at ends, varied in middle)
    const numBars = 26;
    for (let i = 0; i < numBars; i++) {
      const positionFactor = Math.sin((i / (numBars - 1)) * Math.PI); // Envelope bell curve
      const rand = Math.abs(Math.sin(seed * (i + 1) * 9999));
      const minHeight = 20;
      const maxHeight = 95;
      const height = minHeight + (maxHeight - minHeight) * (0.35 + 0.65 * rand) * Math.max(0.4, positionFactor);
      bars.push(Math.round(height));
    }
    return bars;
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
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [src]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !audioRef.current || !duration) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) : 0;
  const activeBarIndex = Math.floor(progressPct * barHeights.length);

  return (
    <div 
      className={`relative group bg-gradient-to-r from-[#0B1325] via-[#111C33] to-[#0A101E] backdrop-blur-md p-2.5 px-3.5 rounded-2xl border border-[#D4AF37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.12)] hover:border-[#D4AF37]/70 hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] transition-all max-w-[320px] sm:max-w-[350px] w-full my-1 border-l-4 border-l-[#D4AF37] ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlay} 
          aria-label={isPlaying ? "Pausar nota de voz" : "Reproducir nota de voz"}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C5A028] to-[#997B1E] text-[#0A101E] flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border border-[#FFF8DC]/40 group-hover:shadow-[0_0_18px_rgba(212,175,55,0.7)]"
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" strokeWidth={1} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={1} className="ml-0.5" />
          )}
        </button>

        {/* Dynamic Voice Waveform Display */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div 
            ref={waveformRef}
            onClick={handleSeek}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex items-center gap-[3px] h-8 cursor-pointer py-1 px-0.5 select-none relative group/wave"
            title="Hacer clic para adelantar/atrasar"
          >
            {barHeights.map((heightPct, idx) => {
              const isPlayed = idx <= activeBarIndex;
              const isActiveCurrent = isPlaying && idx === activeBarIndex;
              
              // Dynamic height variation when playing
              const dynamicHeight = isPlaying 
                ? Math.min(100, Math.max(20, heightPct + (Math.sin(currentTime * 12 + idx) * 20)))
                : heightPct;

              return (
                <div 
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                >
                  <div 
                    className={`w-full max-w-[4px] rounded-full transition-all duration-150 ${
                      isPlayed
                        ? 'bg-gradient-to-t from-[#D4AF37] via-[#F3E5AB] to-[#FFF8DC] shadow-[0_0_6px_rgba(212,175,55,0.8)]'
                        : isHovering 
                          ? 'bg-[#D4AF37]/40' 
                          : 'bg-[#D4AF37]/20'
                    } ${isActiveCurrent ? 'scale-y-110 shadow-[0_0_10px_rgba(255,255,255,0.9)]' : ''}`}
                    style={{ 
                      height: `${dynamicHeight}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Time & Neo Audio Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono mt-0.5 text-[#D4AF37]/80 px-0.5">
            <span className="font-semibold tracking-wider">
              {formatTime(currentTime)} {duration > 0 && <span className="opacity-60">/ {formatTime(duration)}</span>}
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-sans tracking-widest text-[#D4AF37]/60">
              {isPlaying ? (
                <span className="flex items-center gap-1 text-[#00F3FF] font-bold animate-pulse">
                  <Radio size={10} className="animate-spin" /> V-NOTE
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Mic size={10} /> VOZ
                </span>
              )}
            </span>
          </div>
        </div>
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
