import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  X,
  RotateCcw,
  Volume2,
  Activity,
  Headphones,
  Mic,
  MicOff,
  Radio,
  Check,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RealtimeModulationConfig,
  DEFAULT_MODULATION_CONFIG,
  MODULATION_PRESETS,
  LiveVoiceModulationEngine,
  getGlobalVoiceModulator,
} from '../utils/audioContextModulator';

interface VoiceModulatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: RealtimeModulationConfig;
  onChangeConfig: (config: RealtimeModulationConfig) => void;
}

export function VoiceModulatorPanel({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}: VoiceModulatorPanelProps) {
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [activeTab, setActiveTab] = useState<'main' | 'presets' | 'advanced'>('main');
  const [liveVolume, setLiveVolume] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const testEngineRef = useRef<LiveVoiceModulationEngine | null>(null);

  // Sync test engine config whenever user changes sliders
  useEffect(() => {
    if (testEngineRef.current) {
      testEngineRef.current.updateConfig(config);
    }
  }, [config]);

  // Handle starting / stopping mic test
  const toggleMicTest = async () => {
    if (isTestingMic) {
      stopMicTest();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        const engine = getGlobalVoiceModulator();
        testEngineRef.current = engine;
        const { analyser } = engine.connectStream(stream, config);
        setTestStream(stream);
        setIsTestingMic(true);
        startVisualizer(analyser);
      } catch (err) {
        console.error('Error accessing microphone for test:', err);
        alert('No se pudo acceder al micrófono para la prueba en vivo.');
      }
    }
  };

  const stopMicTest = () => {
    if (testStream) {
      testStream.getTracks().forEach((t) => t.stop());
      setTestStream(null);
    }
    if (testEngineRef.current) {
      testEngineRef.current.disconnect();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsTestingMic(false);
    setLiveVolume(0);
  };

  // Clean up when panel is closed or unmounted
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  // Visualizer drawing loop using AnalyserNode
  const startVisualizer = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Calculate instantaneous average volume for peak meter
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setLiveVolume(Math.min(100, Math.round((avg / 128) * 100)));

      // Draw canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const barCount = 32;
      const barWidth = (width / barCount) - 1.5;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        // Map frequency bins evenly
        const binIndex = Math.floor((i / barCount) * (bufferLength / 2));
        const value = dataArray[binIndex] || 0;
        const percent = value / 255;
        const barHeight = Math.max(3, percent * (height - 6));

        // Gradient coloring: cyan to electric violet to warm amber
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#06b6d4'); // Cyan
        gradient.addColorStop(0.6, '#3b82f6'); // Blue
        gradient.addColorStop(1, '#a855f7'); // Purple

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        // Top highlight cap
        ctx.fillStyle = percent > 0.7 ? '#f43f5e' : '#38bdf8';
        ctx.fillRect(x, height - barHeight, barWidth, 1.5);

        x += barWidth + 1.5;
      }
    };

    draw();
  };

  const handleUpdate = (field: keyof RealtimeModulationConfig, val: any) => {
    setSelectedPresetId('custom');
    const updated = { ...config, [field]: val };
    onChangeConfig(updated);
  };

  const handleSelectPreset = (preset: typeof MODULATION_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    const updated: RealtimeModulationConfig = {
      ...config,
      ...preset.config,
    };
    onChangeConfig(updated);
  };

  const handleReset = () => {
    setSelectedPresetId('natural');
    onChangeConfig({ ...DEFAULT_MODULATION_CONFIG });
  };

  // Helper label for frequency
  const getFrequencyLabel = (hz: number) => {
    if (hz < 150) return 'Sub-Graves (Rumble)';
    if (hz < 400) return 'Graves Profundos (Cuerpo)';
    if (hz < 1200) return 'Medios Vocales (Presencia)';
    if (hz < 3000) return 'Medios Agudos (Claridad)';
    return 'Agudos Brillantes (Aire)';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full mb-3 left-0 right-0 max-w-xl mx-auto z-50 bg-[#0d121f]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.2)] p-4 text-white animate-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            <Sliders size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
              Modulador de Voz AudioContext
              {config.enabled ? (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/30">
                  ACTIVO
                </span>
              ) : (
                <span className="text-[10px] bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded-full font-semibold">
                  BYPASS
                </span>
              )}
            </h3>
            <p className="text-[11px] text-gray-400 leading-tight">
              Control en tiempo real de Frecuencia (Pitch) y Ganancia (Gain)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-gray-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Restablecer valores por defecto"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline text-[11px]">Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar panel de modulación"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Tabs / Subnav */}
      <div className="flex items-center gap-1.5 my-2.5 border-b border-white/5 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('main')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'main'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Deslizadores Principales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
            activeTab === 'presets'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap size={12} />
          Presets Rápidos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            activeTab === 'advanced'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Filtro & Resonancia
        </button>
      </div>

      {/* Live Audio Visualizer Canvas & Peak Meter */}
      <div className="bg-[#070a12] border border-cyan-500/25 rounded-xl p-2.5 mb-3 shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className={isTestingMic ? "text-emerald-400 animate-pulse" : "text-gray-500"} />
            <span className="font-semibold text-gray-300">
              {isTestingMic ? "Espectro de Frecuencias en Vivo" : "Visualizador de Audio (Inactivo)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-mono">
              Frecuencia: {Math.round(config.frequency)} Hz
            </span>
            <span className="text-[10px] text-purple-400 font-mono">
              Ganancia: {(config.gain * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-16 rounded-lg bg-[#090d16] border border-white/5 block"
        />

        {/* Live level meter bar */}
        {isTestingMic && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-mono w-10">Nivel:</span>
            <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  liveVolume > 80
                    ? 'bg-rose-500'
                    : liveVolume > 40
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${liveVolume}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-300 w-8 text-right">
              {liveVolume}%
            </span>
          </div>
        )}
      </div>

      {/* Main Tab: Frequency and Gain Sliders */}
      {activeTab === 'main' && (
        <div className="space-y-4 text-xs">
          {/* 1. Frequency (Pitch Control) Slider */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-cyan-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Frecuencia Central / Pitch (Hz)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30 text-xs">
                  {Math.round(config.frequency)} Hz
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  ({getFrequencyLabel(config.frequency)})
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">60Hz</span>
              <input
                type="range"
                min={60}
                max={4800}
                step={10}
                value={config.frequency}
                onChange={(e) => handleUpdate('frequency', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-2 bg-gray-800 rounded-lg cursor-pointer transition-all"
              />
              <span className="text-[10px] text-gray-500 font-mono">4.8kHz</span>
            </div>

            {/* Quick frequency jump buttons */}
            <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleUpdate('frequency', 120)}
                className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded border border-white/5"
              >
                Grave (120Hz)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('frequency', 400)}
                className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded border border-white/5"
              >
                Cálido (400Hz)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('frequency', 1000)}
                className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded border border-white/5"
              >
                Medios (1kHz)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('frequency', 2800)}
                className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded border border-white/5"
              >
                Agudo (2.8kHz)
              </button>
            </div>
          </div>

          {/* 2. Pitch Shift Offset (Semitones) Slider */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-blue-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Desplazamiento Tonal (Semitonos / Octavas)
              </label>
              <span className="bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30 text-xs">
                {config.pitchSemitones > 0 ? `+${config.pitchSemitones}` : config.pitchSemitones} st
                {config.pitchSemitones === 0 && ' (Tono Natural)'}
                {config.pitchSemitones === 12 && ' (+1 Octava)'}
                {config.pitchSemitones === -12 && ' (-1 Octava)'}
              </span>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">-12st</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={config.pitchSemitones}
                onChange={(e) => handleUpdate('pitchSemitones', parseInt(e.target.value, 10))}
                className="flex-1 accent-blue-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-mono">+12st</span>
            </div>
          </div>

          {/* 3. Gain (Volume / Amplification) Slider */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-purple-200 flex items-center gap-1.5">
                <Volume2 size={14} className="text-purple-400" />
                Ganancia de Salida (Gain Multiplier)
              </label>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                    config.gain > 1.8
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : config.gain > 1.2
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {(config.gain * 100).toFixed(0)}% ({config.gain.toFixed(2)}x)
                </span>
                <span className="text-[10px] text-gray-400">
                  {config.gain === 1.0
                    ? 'Normal'
                    : config.gain < 1.0
                    ? 'Atenuado'
                    : config.gain <= 1.5
                    ? 'Realzado'
                    : 'Potente'}
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">0%</span>
              <input
                type="range"
                min={0.0}
                max={2.5}
                step={0.05}
                value={config.gain}
                onChange={(e) => handleUpdate('gain', parseFloat(e.target.value))}
                className="flex-1 accent-purple-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-mono">250%</span>
            </div>

            {/* Quick gain levels */}
            <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleUpdate('gain', 0.5)}
                className="px-2 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 rounded border border-white/5"
              >
                50% (Suave)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('gain', 1.0)}
                className="px-2 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 rounded border border-white/5"
              >
                100% (Original)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('gain', 1.4)}
                className="px-2 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 rounded border border-white/5"
              >
                140% (Boost)
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('gain', 1.9)}
                className="px-2 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 rounded border border-white/5"
              >
                190% (Fuerte)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {MODULATION_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-black/30 border-white/5 text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-base">{preset.icon}</span>
                    <span>{preset.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-cyan-400" />}
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced Tab: Q Resonance and Filter Type */}
      {activeTab === 'advanced' && (
        <div className="space-y-4 text-xs">
          {/* Filter Type selector */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
            <label className="font-semibold text-gray-200">Tipo de Curva de Filtro (Biquad)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'peaking', label: 'Campana (Peaking)', desc: 'Realce armónico centrado' },
                { id: 'lowpass', label: 'Pasa-Bajos', desc: 'Corta agudos / Profundo' },
                { id: 'highpass', label: 'Pasa-Altos', desc: 'Corta graves / Metálico' },
                { id: 'bandpass', label: 'Pasa-Banda', desc: 'Efecto radio / Walkie' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleUpdate('filterType', f.id as BiquadFilterType)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    config.filterType === f.id
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-[10px] text-gray-400">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resonance Q Factor */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Factor Q (Resonancia y Anchura de Banda)
              </label>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 text-xs">
                Q = {config.qResonance.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">0.2 (Suave)</span>
              <input
                type="range"
                min={0.2}
                max={10.0}
                step={0.1}
                value={config.qResonance}
                onChange={(e) => handleUpdate('qResonance', parseFloat(e.target.value))}
                className="flex-1 accent-emerald-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-mono">10.0 (Robótico)</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls: Live Mic Test & Active Switch */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        {/* Live Mic Test Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMicTest}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
              isTestingMic
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isTestingMic ? <MicOff size={14} /> : <Mic size={14} />}
            <span>{isTestingMic ? 'Detener Prueba de Mic' : 'Probar Micrófono en Vivo'}</span>
          </button>

          {/* Live Headphones Monitoring Toggle */}
          <button
            type="button"
            onClick={() => handleUpdate('liveMonitoring', !config.liveMonitoring)}
            className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
              config.liveMonitoring
                ? 'bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
            title="Escucha cómo suena tu voz en tiempo real. Usa auriculares para evitar eco."
          >
            <Headphones size={13} className={config.liveMonitoring ? "text-purple-300" : ""} />
            <span className="text-[11px]">
              {config.liveMonitoring ? '🎧 Monitoreo: ON' : '🎧 Oír mi voz (Auriculares)'}
            </span>
          </button>
        </div>

        {/* Master Enabled Switch for Audio Notes */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
          <span className="text-gray-300 text-[11px] font-medium">
            Aplicar en Grabación de Voz:
          </span>
          <div
            onClick={() => handleUpdate('enabled', !config.enabled)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              config.enabled ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
          </div>
        </label>
      </div>
    </div>
  );
}
