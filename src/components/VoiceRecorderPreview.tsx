import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Send,
  Wand2,
  Volume2,
  Sliders,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  VoiceEffect,
  VoiceCustomSettings,
  VOICE_PRESETS,
  DEFAULT_VOICE_SETTINGS,
  applyVoiceEffect,
} from '../utils/voiceEmulator';

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

  const [customSettings, setCustomSettings] = useState<VoiceCustomSettings>(() => {
    try {
      const saved = localStorage.getItem('chatliz_voice_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    const preset = VOICE_PRESETS.find((p) => p.id === selectedEffect);
    return preset ? { ...preset.settings } : { ...DEFAULT_VOICE_SETTINGS };
  });

  const [showSliders, setShowSliders] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(audioBlob);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Re-process audio when customSettings change
  useEffect(() => {
    let isCancelled = false;

    const processAudio = async () => {
      if (!audioBlob) return;
      setIsProcessing(true);
      try {
        const transformed = await applyVoiceEffect(audioBlob, customSettings);
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

    // Debounce slider adjustments slightly so fast drags don't freeze audio context
    const timer = setTimeout(processAudio, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [audioBlob, customSettings]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleSelectPreset = (presetId: VoiceEffect) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setSelectedEffect(presetId);
    try {
      localStorage.setItem('chatliz_voice_emulator', presetId);
    } catch {}

    const preset = VOICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const newSettings = { ...preset.settings };
      setCustomSettings(newSettings);
      try {
        localStorage.setItem('chatliz_voice_settings', JSON.stringify(newSettings));
      } catch {}
    }
  };

  const updateSetting = (key: keyof VoiceCustomSettings, value: number) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setSelectedEffect('custom');
    setCustomSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('chatliz_voice_settings', JSON.stringify(updated));
        localStorage.setItem('chatliz_voice_emulator', 'custom');
      } catch {}
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSelectedEffect('normal');
    setCustomSettings({ ...DEFAULT_VOICE_SETTINGS });
    try {
      localStorage.setItem('chatliz_voice_emulator', 'normal');
      localStorage.setItem('chatliz_voice_settings', JSON.stringify(DEFAULT_VOICE_SETTINGS));
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className={`text-[11px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
              showSliders
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-white/5 text-gray-300 hover:text-white border-white/10'
            }`}
          >
            <Sliders size={12} />
            <span>Modular Barritas</span>
            {showSliders ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
            {selectedEffect !== 'normal' ? '✨ Modulada' : 'Voz Normal'}
          </span>
        </div>
      </div>

      {/* Presets Horizontal Scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {VOICE_PRESETS.map((p) => {
          const isSelected = selectedEffect === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              disabled={isProcessing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
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

      {/* Modulation Sliders / Barritas Panel */}
      {showSliders && (
        <div className="p-3 bg-black/40 border border-cyan-500/20 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-gray-300 font-bold flex items-center gap-1">
              <Sliders size={13} className="text-cyan-400" />
              Barritas de Modulación Libre
            </span>
            <button
              type="button"
              onClick={handleResetSettings}
              className="text-[10px] text-gray-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RotateCcw size={10} />
              Restablecer
            </button>
          </div>

          {/* Bar 1: Tono / Pitch (Grave vs Agudo) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300 flex items-center gap-1">
                🦁 Tono (Grave ⟷ Agudo) 🐿️
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                {customSettings.pitch.toFixed(2)}x{' '}
                {customSettings.pitch < 0.9
                  ? '(Grave)'
                  : customSettings.pitch > 1.1
                  ? '(Agudo)'
                  : '(Natural)'}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="1.80"
              step="0.02"
              value={customSettings.pitch}
              onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>

          {/* Bar 2: Volumen / Potencia (Suave vs Fuerte / Bajo vs Alto) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300 flex items-center gap-1">
                🔉 Volumen (Suave ⟷ Fuerte) 🔊
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                {Math.round(customSettings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.40"
              max="2.20"
              step="0.05"
              value={customSettings.volume}
              onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>

          {/* Bar 3: Bajos / Graves (Resonancia) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300">Bajos / Resonancia Profunda</span>
              <span className="text-cyan-400 font-mono font-bold">
                {customSettings.bassBoost > 0 ? `+${customSettings.bassBoost}` : customSettings.bassBoost} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="18"
              step="1"
              value={customSettings.bassBoost}
              onChange={(e) => updateSetting('bassBoost', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>

          {/* Bar 4: Agudos / Claridad */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300">Agudos / Claridad y Brillo</span>
              <span className="text-cyan-400 font-mono font-bold">
                {customSettings.trebleBoost > 0 ? `+${customSettings.trebleBoost}` : customSettings.trebleBoost} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="18"
              step="1"
              value={customSettings.trebleBoost}
              onChange={(e) => updateSetting('trebleBoost', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>

          {/* Bar 5: Nivel de Eco / Reverberación */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300">🏛️ Eco / Reverberación Espacial</span>
              <span className="text-cyan-400 font-mono font-bold">
                {Math.round(customSettings.echoLevel * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.75"
              step="0.05"
              value={customSettings.echoLevel}
              onChange={(e) => updateSetting('echoLevel', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>

          {/* Bar 6: Efecto Robótico / Sintetizador */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-300">🤖 Efecto Cibernético / Robot</span>
              <span className="text-cyan-400 font-mono font-bold">
                {customSettings.robotModulation === 0 ? 'Apagado' : `${customSettings.robotModulation} Hz`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={customSettings.robotModulation}
              onChange={(e) => updateSetting('robotModulation', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Player and Actions Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Play/Pause Button & Timer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isProcessing || !previewAudioUrl}
            className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-50"
            title={isPlaying ? 'Pausar' : 'Escuchar cómo suena'}
          >
            {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
          </button>

          <div className="text-xs font-mono text-gray-300 flex items-center gap-1">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>

          {isProcessing && (
            <span className="text-[10px] text-cyan-400 animate-pulse font-medium">
              Modulando...
            </span>
          )}
        </div>

        {/* Send and Discard Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDiscard}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors"
            title="Descartar y grabar de nuevo"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Send size={14} />
            <span>Enviar Audio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
