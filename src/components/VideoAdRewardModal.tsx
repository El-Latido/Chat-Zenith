import React, { useState, useEffect, useRef } from 'react';
import { 
  PlaySquare, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  Bot 
} from 'lucide-react';

interface VideoAdRewardModalProps {
  isOpen: boolean;
  aiName: string;
  onRewardClaimed: (newCoins: number) => void;
  onClose: () => void;
  socket: any;
}

export function VideoAdRewardModal({
  isOpen,
  aiName,
  onRewardClaimed,
  onClose,
  socket
}: VideoAdRewardModalProps) {
  const [countdown, setCountdown] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(15);
      setIsCompleted(false);
      setIsClaiming(false);
      setRewardClaimed(false);
      return;
    }

    setCountdown(15);
    setIsCompleted(false);
    setIsClaiming(false);
    setRewardClaimed(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // When completed, claim reward automatically
  useEffect(() => {
    if (isCompleted && !isClaiming && !rewardClaimed) {
      setIsClaiming(true);
      if (socket) {
        socket.emit("watch_ad_reward", { aiName: aiName || "Elizabeth" }, (res: any) => {
          setIsClaiming(false);
          if (res && res.success) {
            setRewardClaimed(true);
            onRewardClaimed(res.newCoins);
            // Automatically close after 2.5s celebration
            setTimeout(() => {
              onClose();
            }, 2200);
          } else {
            // Fallback
            setRewardClaimed(true);
            onRewardClaimed(10);
            setTimeout(() => {
              onClose();
            }, 2200);
          }
        });
      } else {
        setIsClaiming(false);
        setRewardClaimed(true);
        onRewardClaimed(10);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    }
  }, [isCompleted, isClaiming, rewardClaimed, socket, aiName, onRewardClaimed, onClose]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((15 - countdown) / 15) * 100));

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Top Banner Info */}
      <div className="w-full max-w-2xl flex items-center justify-between text-white/80 text-xs sm:text-sm font-semibold mb-3 px-2">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>HilltopAds Patrocinado</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
            Rewarded Video
          </span>
        </div>

        <div className="flex items-center gap-2">
          {countdown > 0 ? (
            <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              Recompensa en {countdown}s
            </div>
          ) : (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
              <CheckCircle size={14} className="text-emerald-400" />
              ¡Completado!
            </div>
          )}

          {isCompleted && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Video Player Card */}
      <div className="w-full max-w-2xl bg-[#0e121d] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] relative flex flex-col">
        
        {/* Progress Bar at the top of the video */}
        <div className="w-full bg-white/10 h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Video Area */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
            autoPlay
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Overlay elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Sound toggle button */}
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
              }
            }}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-transform active:scale-95 shadow-lg z-10"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Bottom Video Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none z-10">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/25 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-white text-xs font-bold drop-shadow">
                Recargando mensajes para <span className="text-cyan-300 font-extrabold">{aiName}</span>
              </p>
              <p className="text-white/60 text-[10px] drop-shadow">
                Mira el video de 15 segundos para desbloquear tokens
              </p>
            </div>
          </div>

          {/* Success Overlay after completion */}
          {rewardClaimed && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95 duration-200 z-20">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mb-3 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-black text-white">
                ¡Recarga Exitosa!
              </h3>
              <p className="text-emerald-300 font-bold text-sm mt-1 flex items-center gap-1.5">
                <Sparkles size={16} />
                +10 tokens acreditados para chatear con {aiName}
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Volviendo al chat automáticamente...
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#0b0f19] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-gray-400 text-center sm:text-left">
            Al ver este video de <strong className="text-white">HilltopAds</strong> mantienes a las IAs gratis y apoyas a la plataforma.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              +10 Mensajes por video
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
