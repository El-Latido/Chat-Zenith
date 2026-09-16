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
    styleType = 'neon_waves', 
    color1 = '#00f2fe', 
    color2 = '#4facfe' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      time += isPlaying ? 0.05 : 0.01;

      const baseAmp = isPlaying ? height * 0.35 : height * 0.08;

      ctx.lineCap = 'round';

      if (styleType === 'neon_waves' || styleType === 'holographic' || !styleType) {
        const lines = styleType === 'holographic' ? 1 : 3;
        for (let j = 0; j < lines; j++) {
          ctx.beginPath();
          ctx.lineWidth = styleType === 'holographic' ? 3 : 2;
          ctx.strokeStyle = j === 0 ? color1 : j === 1 ? color2 : '#ffffff';
          
          if (isPlaying || j === 0) {
              ctx.shadowBlur = 15;
              ctx.shadowColor = ctx.strokeStyle;
          } else {
              ctx.shadowBlur = 0;
          }

          for (let i = 0; i < width; i++) {
            const freq = 0.05 + (j * 0.02);
            const amp = baseAmp * Math.sin(i * 0.01 + time + j);
            const y = centerY + Math.sin(i * freq + time * (j + 1)) * amp;
            
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
          }
          ctx.stroke();
        }
      } else if (styleType === 'cyber_bars') {
        const barWidth = 4;
        const spacing = 4;
        const bars = Math.floor(width / (barWidth + spacing));
        
        for (let i = 0; i < bars; i++) {
          const x = i * (barWidth + spacing);
          const noise = Math.sin(i * 0.5 + time * 2) * Math.cos(i * 0.3 - time);
          const currentAmp = baseAmp * (1 + noise);
          
          const gradient = ctx.createLinearGradient(x, centerY - currentAmp, x, centerY + currentAmp);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);
          
          ctx.fillStyle = gradient;
          if (isPlaying) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = color1;
          } else {
              ctx.shadowBlur = 0;
          }
          
          ctx.fillRect(x, centerY - currentAmp, barWidth, currentAmp * 2);
        }
      } else if (styleType === 'stardust') {
        ctx.fillStyle = color1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color2;
        const particles = 50;
        
        for(let i = 0; i < particles; i++) {
            const x = (i * (width/particles) + time * 30) % width;
            const noise = Math.sin(i * 0.8 + time + i) * baseAmp * 1.5;
            const y = centerY + noise;
            const size = Math.random() * 2.5 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, styleType, color1, color2]);

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !audioRef.current || !duration) return;
    const rect = canvasRef.current.getBoundingClientRect();
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

  return (
    <div className={`relative group bg-[#0a0a0a]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all w-[300px] my-1 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all z-10"
          style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
        >
          {isPlaying ? (
            <Pause size={18} fill="#fff" color="#fff" />
          ) : (
            <Play size={18} fill="#fff" color="#fff" className="ml-1" />
          )}
        </button>

        {/* Dynamic Canvas Visualizer */}
        <div className="flex-1 flex flex-col justify-center relative h-12">
          <div 
            className="absolute inset-0 cursor-pointer rounded-lg overflow-hidden bg-black/40"
            onClick={handleSeek}
          >
             <canvas 
              ref={canvasRef} 
              width={220} 
              height={48} 
              className="w-full h-full object-cover"
            />
             {/* Progress Overlay */}
             <div 
                className="absolute top-0 left-0 h-full bg-white/10 mix-blend-overlay border-r border-white/50"
                style={{ width: `${progressPct * 100}%` }}
             />
          </div>
        </div>
      </div>
      
      {/* Time Indicator */}
      <div className="flex justify-between text-[10px] font-mono mt-1 text-white/50 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{duration > 0 ? formatTime(duration) : '0:00'}</span>
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
