import React, { useRef, useEffect } from 'react';

export const AudioVisualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * height;
        
        ctx.fillStyle = '#00f3ff';
        
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        
        x += barWidth;
      }
      
      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={30} 
      className="rounded-md" 
      style={{ filter: 'drop-shadow(0 0 8px #00f3ff)' }}
    />
  );
};
