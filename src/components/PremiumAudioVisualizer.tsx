import React, { useRef, useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

interface PremiumAudioVisualizerProps {
  stream: MediaStream | null;
}

export const PremiumAudioVisualizer: React.FC<PremiumAudioVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Timer for recording duration
  useEffect(() => {
    setRecordingSeconds(0);
    const timer = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stream]);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (e) {
      console.error("Audio Context setup error", e);
    }

    const bufferLength = analyserRef.current?.frequencyBinCount || 16;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.width;
      const height = canvas.height;

      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Fallback simulation if analyser unavailable
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.random() * 128) + 30;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const numBars = 20;
      const step = Math.floor(bufferLength / numBars) || 1;
      const barWidth = Math.max(2, (width / numBars) - 3);
      let x = 2;

      for (let i = 0; i < numBars; i++) {
        const val = dataArray[i * step] || 10;
        const normalizedVal = val / 255;
        const barHeight = Math.max(4, normalizedVal * (height * 0.85));

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#D4AF37');
        gradient.addColorStop(0.7, '#F3E5AB');
        gradient.addColorStop(1, '#00F3FF');

        ctx.fillStyle = gradient;

        // Draw centered bar
        const y = (height - barHeight) / 2;
        const radius = Math.min(barWidth / 2, 2);

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, radius);
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 3;
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream]);

  const formatSecs = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#121D33] via-[#0D1527] to-[#121D33] px-4 py-1.5 rounded-full border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex-1 overflow-hidden h-full min-w-[200px]">
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute opacity-75" />
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full relative shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
        </div>
        <span className="text-red-400 font-mono text-xs font-bold tracking-wider">
          {formatSecs(recordingSeconds)}
        </span>
      </div>

      <div className="flex-1 h-full flex items-center justify-center min-w-0">
        <canvas 
          ref={canvasRef} 
          width={180} 
          height={32} 
          className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]" 
        />
      </div>

      <div className="flex items-center gap-1 shrink-0 text-[#D4AF37] text-[11px] font-mono uppercase tracking-widest bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/30">
        <Mic size={12} className="text-red-400 animate-pulse" />
        <span className="hidden sm:inline">Grabando</span>
      </div>
    </div>
  );
};
