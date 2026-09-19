import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Send, Wand2, Volume2, Check, RefreshCw } from 'lucide-react';
import { VoiceEffect, VOICE_PRESETS, applyVoiceEffect } from '../utils/voiceEmulator';

interface VoiceRecorderPreviewProps {
  audioBlob: Blob | null;
  onSend: (processedBlob: Blob, dataUrl: string) => void;
  onDiscard: () => void;
}

export function VoiceRecorderPreview({
  audioBlob,
  onSend,
  onDiscard,
}: VoiceRecorderPreviewProps) {
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>(() => {
    try {
      return (localStorage.getItem('chatliz_voice_emulator') as VoiceEffect) || 'normal';
    } catch {
      return 'normal';
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(audioBlob);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Apply effect when selectedEffect or audioBlob changes
  useEffect(() => {
    let isCancelled = false;

    const processAudio = async () => {
      if (!audioBlob) return;
      setIsProcessing(true);
      try {
        const transformed = await applyVoiceEffect(audioBlob, selectedEffect);
        if (!isCancelled) {
          setPreviewBlob(transformed);
          const url = URL.createObjectURL(transformed);
          setPreviewAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        console.error('Error applying voice effect:', err);
        if (!isCancelled) {
          setPreviewBlob(audioBlob);
          setPreviewAudioUrl(URL.createObjectURL(audioBlob));
        }
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    processAudio();

    return () => {
      isCancelled = true;
    };
  }, [audioBlob, selectedEffect]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSelectEffect = (effect: VoiceEffect) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setSelectedEffect(effect);
    try {
      localStorage.setItem('chatliz_voice_emulator', effect);
    } catch {}
  };

  const handleSend = () => {
    if (!previewBlob) return;
    const reader = new FileReader();
    reader.readAsDataURL(previewBlob);
    reader.onloadend = () => {
      onSend(previewBlob, reader.result as string);
    };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#121624] border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-3 duration-200">
      {/* Hidden audio element for playback */}
      {previewAudioUrl && (
        <audio
          ref={audioRef}
          src={previewAudioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration || 0);
          }}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top Header: Voice emulator selector */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
          <Wand2 size={15} className="text-cyan-400" />
          <span>Emulador de Voz:</span>
        </div>
        <div className="text-[10px] text-gray-400 font-medium">
          {selectedEffect !== 'normal' ? '✨ Voz Emulada' : 'Voz Normal'}
        </div>
      </div>

      {/* Presets buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {VOICE_PRESETS.map((p) => {
          const isSelected = selectedEffect === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectEffect(p.id)}
              disabled={isProcessing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:text-white border-white/5 hover:bg-white/10'
              }`}
              title={p.description}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Player and Actions Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Play/Pause Button & Timer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isProcessing}
            className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            title={isPlaying ? 'Pausar' : 'Escuchar antes de enviar'}
          >
            {isProcessing ? (
              <RefreshCw size={15} className="animate-spin text-black" />
            ) : isPlaying ? (
              <Pause size={16} className="fill-black" />
            ) : (
              <Play size={16} className="fill-black ml-0.5" />
            )}
          </button>

          <div className="text-xs font-mono text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-500"> / {formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Action buttons: Discard & Send */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors border border-white/5"
            title="Descartar grabación"
          >
            <Trash2 size={17} />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Enviar audio al chat"
          >
            <Send size={15} />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
