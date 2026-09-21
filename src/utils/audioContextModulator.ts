// Real-time AudioContext Pitch and Gain Modulator Engine for Chat-Liz
// Provides a live Web Audio node graph for real-time frequency, pitch filtering,
// gain amplification, resonance, and live spectrum analysis.

export interface RealtimeModulationConfig {
  enabled: boolean;
  frequency: number;       // Center/Cutoff frequency in Hz (60Hz - 5000Hz)
  pitchSemitones: number;  // Semitone offset (-12 to +12)
  gain: number;            // Gain multiplier (0.0 to 3.0, 1.0 = 100%)
  qResonance: number;      // Q / Resonance factor (0.2 to 12.0)
  filterType: BiquadFilterType; // 'peaking' | 'lowpass' | 'highpass' | 'bandpass'
  liveMonitoring: boolean; // Route audio to speakers/headphones to hear live
  monitorVolume: number;   // Volume for live monitoring (0.0 to 1.0)
}

export const DEFAULT_MODULATION_CONFIG: RealtimeModulationConfig = {
  enabled: true,
  frequency: 1000,
  pitchSemitones: 0,
  gain: 1.0,
  qResonance: 1.0,
  filterType: 'peaking',
  liveMonitoring: false,
  monitorVolume: 0.8,
};

export interface ModulationPreset {
  id: string;
  name: string;
  icon: string;
  desc: string;
  config: Partial<RealtimeModulationConfig>;
}

export const MODULATION_PRESETS: ModulationPreset[] = [
  {
    id: 'natural',
    name: 'Natural',
    icon: '🎙️',
    desc: 'Voz limpia sin alteraciones de frecuencia',
    config: {
      enabled: false,
      frequency: 1000,
      pitchSemitones: 0,
      gain: 1.0,
      qResonance: 1.0,
      filterType: 'peaking',
    },
  },
  {
    id: 'deep_radio',
    name: 'Locutor / Deep Studio',
    icon: '📻',
    desc: 'Graves cálidos y presencia resonante de radio',
    config: {
      enabled: true,
      frequency: 240,
      pitchSemitones: -4,
      gain: 1.35,
      qResonance: 2.2,
      filterType: 'peaking',
    },
  },
  {
    id: 'sub_bass',
    name: 'Grave Profundo',
    icon: '🦁',
    desc: 'Corte de frecuencias altas para tono imponente',
    config: {
      enabled: true,
      frequency: 380,
      pitchSemitones: -7,
      gain: 1.5,
      qResonance: 1.8,
      filterType: 'lowpass',
    },
  },
  {
    id: 'high_chipmunk',
    name: 'Agudo / Helio',
    icon: '🐿️',
    desc: 'Realce de frecuencias agudas y armónicos altos',
    config: {
      enabled: true,
      frequency: 2600,
      pitchSemitones: 6,
      gain: 1.15,
      qResonance: 2.0,
      filterType: 'highpass',
    },
  },
  {
    id: 'walkie_talkie',
    name: 'Walkie-Talkie',
    icon: '📡',
    desc: 'Filtro pasabanda telefónico y ganancia crujiente',
    config: {
      enabled: true,
      frequency: 1450,
      pitchSemitones: 0,
      gain: 1.6,
      qResonance: 4.5,
      filterType: 'bandpass',
    },
  },
  {
    id: 'cyborg',
    name: 'Ciborg Metálico',
    icon: '🤖',
    desc: 'Alta resonancia Q metálica y pico pronunciado',
    config: {
      enabled: true,
      frequency: 720,
      pitchSemitones: -3,
      gain: 1.25,
      qResonance: 8.5,
      filterType: 'peaking',
    },
  },
];

/**
 * Creates an AudioContext processing chain that takes an incoming MediaStream
 * and returns a new MediaStream modulated with the specified frequency, pitch filter, and gain.
 */
export class LiveVoiceModulationEngine {
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private pitchShiftFilterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private monitorGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private currentStream: MediaStream | null = null;

  constructor() {}

  /**
   * Initializes or gets the running AudioContext
   */
  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(console.error);
    }
    return this.audioCtx;
  }

  /**
   * Connects a live MediaStream through the pitch/gain modulation graph
   * Returns the processed MediaStream suitable for recording or broadcasting.
   */
  public connectStream(
    stream: MediaStream,
    config: RealtimeModulationConfig
  ): { modulatedStream: MediaStream; analyser: AnalyserNode } {
    const ctx = this.getAudioContext();
    this.currentStream = stream;

    // Disconnect old nodes if any
    this.disconnect();

    // 1. Source Node from user microphone
    this.sourceNode = ctx.createMediaStreamSource(stream);

    // 2. Main Biquad Filter (Frequency & resonance adjustment)
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = config.filterType;
    this.filterNode.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    this.filterNode.Q.setValueAtTime(config.qResonance, ctx.currentTime);
    if (config.filterType === 'peaking') {
      // Gain boost or cut for peaking filter
      const semitoneGain = config.pitchSemitones * 1.5;
      this.filterNode.gain.setValueAtTime(semitoneGain, ctx.currentTime);
    }

    // 3. Pitch-shaping secondary filter (simulates pitch envelope/formant)
    this.pitchShiftFilterNode = ctx.createBiquadFilter();
    this.pitchShiftFilterNode.type = config.pitchSemitones < 0 ? 'lowshelf' : 'highshelf';
    const pitchFreq = Math.max(80, Math.min(6000, 1000 * Math.pow(2, config.pitchSemitones / 12)));
    this.pitchShiftFilterNode.frequency.setValueAtTime(pitchFreq, ctx.currentTime);
    this.pitchShiftFilterNode.gain.setValueAtTime(config.pitchSemitones * 2, ctx.currentTime);

    // 4. Gain Node for overall volume modulation
    this.gainNode = ctx.createGain();
    const targetGain = config.enabled ? config.gain : 1.0;
    this.gainNode.gain.setValueAtTime(targetGain, ctx.currentTime);

    // 5. Analyser Node for live visual spectrum and dB meter
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // 6. Output destination for recording
    this.destinationNode = ctx.createMediaStreamDestination();

    // 7. Monitor gain node (for hearing yourself live if enabled)
    this.monitorGainNode = ctx.createGain();
    this.monitorGainNode.gain.setValueAtTime(
      config.liveMonitoring ? config.monitorVolume : 0.0,
      ctx.currentTime
    );

    // Wiring graph:
    // Source -> Filter -> PitchFilter -> Gain -> Analyser -> Destination (Record)
    //                                         \-> MonitorGain -> AudioContext.destination (Speakers)
    this.sourceNode.connect(this.filterNode);
    this.filterNode.connect(this.pitchShiftFilterNode);
    this.pitchShiftFilterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.destinationNode);

    // Live monitor routing
    this.gainNode.connect(this.monitorGainNode);
    this.monitorGainNode.connect(ctx.destination);

    return {
      modulatedStream: this.destinationNode.stream,
      analyser: this.analyserNode,
    };
  }

  /**
   * Updates modulation parameters in real-time smoothly without interrupting playback
   */
  public updateConfig(config: RealtimeModulationConfig) {
    if (!this.audioCtx || this.audioCtx.state === 'closed') return;
    const now = this.audioCtx.currentTime;

    if (this.filterNode) {
      if (this.filterNode.type !== config.filterType) {
        this.filterNode.type = config.filterType;
      }
      this.filterNode.frequency.setTargetAtTime(config.frequency, now, 0.03);
      this.filterNode.Q.setTargetAtTime(config.qResonance, now, 0.03);
      if (config.filterType === 'peaking') {
        const semitoneGain = config.pitchSemitones * 1.5;
        this.filterNode.gain.setTargetAtTime(semitoneGain, now, 0.03);
      }
    }

    if (this.pitchShiftFilterNode) {
      const isLow = config.pitchSemitones < 0;
      this.pitchShiftFilterNode.type = isLow ? 'lowshelf' : 'highshelf';
      const pitchFreq = Math.max(80, Math.min(6000, 1000 * Math.pow(2, config.pitchSemitones / 12)));
      this.pitchShiftFilterNode.frequency.setTargetAtTime(pitchFreq, now, 0.03);
      this.pitchShiftFilterNode.gain.setTargetAtTime(config.pitchSemitones * 2, now, 0.03);
    }

    if (this.gainNode) {
      const targetGain = config.enabled ? config.gain : 1.0;
      this.gainNode.gain.setTargetAtTime(targetGain, now, 0.03);
    }

    if (this.monitorGainNode) {
      const monVol = config.liveMonitoring ? config.monitorVolume : 0.0;
      this.monitorGainNode.gain.setTargetAtTime(monVol, now, 0.03);
    }
  }

  /**
   * Returns current analyser node if available
   */
  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Disconnects nodes safely
   */
  public disconnect() {
    try {
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
      if (this.pitchShiftFilterNode) {
        this.pitchShiftFilterNode.disconnect();
        this.pitchShiftFilterNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      if (this.analyserNode) {
        this.analyserNode.disconnect();
        this.analyserNode = null;
      }
      if (this.monitorGainNode) {
        this.monitorGainNode.disconnect();
        this.monitorGainNode = null;
      }
      if (this.destinationNode) {
        this.destinationNode.disconnect();
        this.destinationNode = null;
      }
    } catch (e) {
      console.warn('Error disconnecting audio nodes:', e);
    }
  }

  /**
   * Stops processing and stops tracks
   */
  public destroy() {
    this.disconnect();
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((t) => t.stop());
      this.currentStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(console.error);
      this.audioCtx = null;
    }
  }
}

// Global singleton helper for seamless usage
let globalModulationEngine: LiveVoiceModulationEngine | null = null;

export function getGlobalVoiceModulator(): LiveVoiceModulationEngine {
  if (!globalModulationEngine) {
    globalModulationEngine = new LiveVoiceModulationEngine();
  }
  return globalModulationEngine;
}
