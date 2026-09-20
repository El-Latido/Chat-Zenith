// Utility to process recorded audio and emulate different voices
// Includes rich presets and customizable modulation bars (pitch, volume, bass, treble, echo, robot, speed)
// Uses standard Web Audio API with OfflineAudioContext

export type VoiceEffect =
  | 'normal'
  | 'deep'
  | 'super_deep'
  | 'high'
  | 'helium'
  | 'robot'
  | 'echo'
  | 'alien'
  | 'radio'
  | 'telephone'
  | 'whisper'
  | 'giant'
  | 'custom';

export interface VoiceCustomSettings {
  pitch: number;          // 0.50 (ultra grave) to 1.80 (ultra agudo), 1.0 = normal
  volume: number;         // 0.40 (suave) to 2.20 (fuerte), 1.0 = normal
  bassBoost: number;      // -12 dB to +18 dB (profundidad de bajos)
  trebleBoost: number;    // -12 dB to +18 dB (claridad de agudos)
  echoLevel: number;      // 0.0 (seco) to 0.75 (eco catedral)
  robotModulation: number;// 0 (apagado) to 120 Hz (modulador en anillo metálico)
  speed: number;          // 0.70 (lento) to 1.40 (rápido), 1.0 = normal
}

export const DEFAULT_VOICE_SETTINGS: VoiceCustomSettings = {
  pitch: 1.0,
  volume: 1.0,
  bassBoost: 0,
  trebleBoost: 0,
  echoLevel: 0,
  robotModulation: 0,
  speed: 1.0,
};

export interface VoicePreset {
  id: VoiceEffect;
  name: string;
  icon: string;
  description: string;
  settings: VoiceCustomSettings;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    icon: '🎙️',
    description: 'Voz original limpia y natural',
    settings: { ...DEFAULT_VOICE_SETTINGS },
  },
  {
    id: 'deep',
    name: 'Grave / Profunda',
    icon: '🦁',
    description: 'Tono bajo masculino y resonancia cálida',
    settings: {
      pitch: 0.78,
      volume: 1.15,
      bassBoost: 8,
      trebleBoost: -2,
      echoLevel: 0.1,
      robotModulation: 0,
      speed: 0.95,
    },
  },
  {
    id: 'super_deep',
    name: 'Ultra Grave / Demonio',
    icon: '👹',
    description: 'Tono cavernoso, pesado y terrorífico',
    settings: {
      pitch: 0.60,
      volume: 1.25,
      bassBoost: 15,
      trebleBoost: -6,
      echoLevel: 0.25,
      robotModulation: 25,
      speed: 0.88,
    },
  },
  {
    id: 'high',
    name: 'Aguda / Ardilla',
    icon: '🐿️',
    description: 'Voz cómica, rápida y chillona',
    settings: {
      pitch: 1.35,
      volume: 1.05,
      bassBoost: -6,
      trebleBoost: 6,
      echoLevel: 0,
      robotModulation: 0,
      speed: 1.15,
    },
  },
  {
    id: 'helium',
    name: 'Voz de Helio',
    icon: '🎈',
    description: 'Tono ultra agudo como tras aspirar helio',
    settings: {
      pitch: 1.62,
      volume: 1.10,
      bassBoost: -10,
      trebleBoost: 10,
      echoLevel: 0.05,
      robotModulation: 0,
      speed: 1.25,
    },
  },
  {
    id: 'robot',
    name: 'Ciborg / Robótica',
    icon: '🤖',
    description: 'Efecto cibernético y síntesis metálica',
    settings: {
      pitch: 0.92,
      volume: 1.1,
      bassBoost: 4,
      trebleBoost: 6,
      echoLevel: 0.15,
      robotModulation: 65,
      speed: 1.0,
    },
  },
  {
    id: 'echo',
    name: 'Eco / Catedral',
    icon: '🏛️',
    description: 'Amplia reverberación espacial y repeticiones',
    settings: {
      pitch: 1.0,
      volume: 1.0,
      bassBoost: 2,
      trebleBoost: 2,
      echoLevel: 0.55,
      robotModulation: 0,
      speed: 1.0,
    },
  },
  {
    id: 'alien',
    name: 'Alien / Cósmica',
    icon: '👽',
    description: 'Oscilación de otro planeta',
    settings: {
      pitch: 1.22,
      volume: 1.05,
      bassBoost: -4,
      trebleBoost: 8,
      echoLevel: 0.40,
      robotModulation: 95,
      speed: 1.05,
    },
  },
  {
    id: 'radio',
    name: 'Walkie-Talkie / Radio',
    icon: '📻',
    description: 'Filtro vintage de onda corta y megáfono',
    settings: {
      pitch: 1.05,
      volume: 1.2,
      bassBoost: -10,
      trebleBoost: 8,
      echoLevel: 0.05,
      robotModulation: 0,
      speed: 1.0,
    },
  },
  {
    id: 'telephone',
    name: 'Teléfono Retro',
    icon: '☎️',
    description: 'Llamada telefónica de línea antigua',
    settings: {
      pitch: 1.0,
      volume: 1.15,
      bassBoost: -12,
      trebleBoost: 4,
      echoLevel: 0,
      robotModulation: 0,
      speed: 1.0,
    },
  },
  {
    id: 'whisper',
    name: 'Susurro / ASMR',
    icon: '🍃',
    description: 'Voz suave, aterciopelada e íntima',
    settings: {
      pitch: 1.02,
      volume: 0.85,
      bassBoost: -4,
      trebleBoost: 12,
      echoLevel: 0.2,
      robotModulation: 0,
      speed: 0.95,
    },
  },
  {
    id: 'giant',
    name: 'Gigante / Titán',
    icon: '🗿',
    description: 'Fuerza masiva y resonancia telúrica',
    settings: {
      pitch: 0.68,
      volume: 1.30,
      bassBoost: 16,
      trebleBoost: -4,
      echoLevel: 0.35,
      robotModulation: 15,
      speed: 0.85,
    },
  },
];

/**
 * Converts an AudioBuffer into a WAV Blob
 */
function bufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const dataSize = numSamples * (bitDepth / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk length
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write interleaved channel data
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Emulates and transforms an audio blob using customizable voice settings or presets
 */
export async function applyVoiceEffect(
  audioBlob: Blob,
  effectOrSettings: VoiceEffect | VoiceCustomSettings
): Promise<Blob> {
  let settings: VoiceCustomSettings;

  if (typeof effectOrSettings === 'string') {
    if (effectOrSettings === 'normal') {
      return audioBlob;
    }
    const preset = VOICE_PRESETS.find((p) => p.id === effectOrSettings);
    settings = preset ? preset.settings : DEFAULT_VOICE_SETTINGS;
  } else {
    settings = effectOrSettings;
  }

  // If everything is completely default, return raw blob
  if (
    settings.pitch === 1.0 &&
    settings.volume === 1.0 &&
    settings.bassBoost === 0 &&
    settings.trebleBoost === 0 &&
    settings.echoLevel === 0 &&
    settings.robotModulation === 0 &&
    settings.speed === 1.0
  ) {
    return audioBlob;
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Effective playback rate is pitch * speed
  const playbackRate = Math.max(0.4, Math.min(2.5, settings.pitch * settings.speed));
  const targetDuration = (decodedBuffer.duration / playbackRate) + (settings.echoLevel > 0 ? 0.8 : 0.2);

  const sampleRate = decodedBuffer.sampleRate;
  const offlineContext = new OfflineAudioContext(
    decodedBuffer.numberOfChannels,
    Math.ceil(targetDuration * sampleRate),
    sampleRate
  );

  // Buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = decodedBuffer;
  source.playbackRate.value = playbackRate;

  // Master Gain Node (Volume: fuerte vs suave)
  const masterGain = offlineContext.createGain();
  masterGain.gain.value = Math.max(0.2, Math.min(2.5, settings.volume));

  // Lowshelf Filter (Bajos / Graves)
  const bassFilter = offlineContext.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 260;
  bassFilter.gain.value = Math.max(-18, Math.min(20, settings.bassBoost));

  // Highshelf Filter (Agudos / Claridad)
  const trebleFilter = offlineContext.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 3200;
  trebleFilter.gain.value = Math.max(-18, Math.min(20, settings.trebleBoost));

  let lastNode: AudioNode = source;

  // 1. Robot ring-modulator if configured
  if (settings.robotModulation > 5) {
    const carrier = offlineContext.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = settings.robotModulation;

    const ringModGain = offlineContext.createGain();
    ringModGain.gain.value = 0.0;

    carrier.connect(ringModGain.gain);
    lastNode.connect(ringModGain);
    carrier.start(0);

    // Clean up extreme sub-bass rumbles
    const bandpass = offlineContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1700;
    bandpass.Q.value = 1.2;

    ringModGain.connect(bandpass);
    lastNode = bandpass;
  }

  // Connect through equalizer filters
  lastNode.connect(bassFilter);
  bassFilter.connect(trebleFilter);
  trebleFilter.connect(masterGain);

  // 2. Echo / Reverberation if configured
  if (settings.echoLevel > 0.05) {
    const delay = offlineContext.createDelay();
    delay.delayTime.value = 0.24;

    const feedback = offlineContext.createGain();
    feedback.gain.value = Math.min(0.65, settings.echoLevel * 0.7);

    const wetGain = offlineContext.createGain();
    wetGain.gain.value = settings.echoLevel;

    masterGain.connect(offlineContext.destination); // dry
    masterGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(offlineContext.destination);
  } else {
    masterGain.connect(offlineContext.destination);
  }

  source.start(0);
  const renderedBuffer = await offlineContext.startRendering();
  audioContext.close();

  return bufferToWavBlob(renderedBuffer);
}
