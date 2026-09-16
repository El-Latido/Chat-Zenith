import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface NeonAudioPlayerProps {
  src: string;
  styleType?: string;
  color1?: string;
  color2?: string;
}

export function NeonAudioPlayer({ src, styleType = 'neon_waves', color1 = '#00f2fe', color2 = '#4facfe' }: NeonAudioPlayerProps) {
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
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

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

      time += isPlaying ? 0.05 : 0.01; // slower animation when paused

      // Amplitude based on playing state (simulated)
      const baseAmp = isPlaying ? height * 0.3 : height * 0.05;

      ctx.lineCap = 'round';

      if (styleType === 'neon_waves' || styleType === 'holographic') {
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
          
          ctx.fillRect(x, centerY - currentAmp/2, barWidth, currentAmp);
        }
      } else if (styleType === 'stardust') {
        ctx.fillStyle = color1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color2;
        const particles = 50;
        
        for(let i = 0; i < particles; i++) {
            const x = (i * (width/particles) + time * 20) % width;
            const noise = Math.sin(i * 0.8 + time) * baseAmp;
            const y = centerY + noise;
            const size = Math.random() * 2 + 1;
            
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

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 w-64 max-w-full">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div 
        className="relative h-16 w-full rounded-xl overflow-hidden cursor-pointer bg-black/40 border border-white/10"
        onClick={togglePlayPause}
      >
        <canvas 
          ref={canvasRef} 
          width={256} 
          height={64} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </div>
        </div>

        {/* Progress Bar overlay */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
          <div 
            className="h-full bg-gradient-to-r transition-all duration-100" 
            style={{ 
              width: `${progress}%`,
              backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
              boxShadow: `0 0 10px ${color1}`
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] text-white/50 px-1 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
