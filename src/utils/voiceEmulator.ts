// Utility to process recorded audio and emulate different voices
// (Deep, High/Chipmunk, Robot, Echo, Megaphone/Radio, Normal)
// Uses standard Web Audio API with OfflineAudioContext

export type VoiceEffect = 'normal' | 'deep' | 'high' | 'robot' | 'echo' | 'radio';

export interface VoicePreset {
  id: VoiceEffect;
  name: string;
  icon: string;
  description: string;
}

export const VOICE_PRESETS: VoicePreset[] = [
  { id: 'normal', name: 'Normal', icon: '🎙️', description: 'Voz original sin modificaciones' },
  { id: 'deep', name: 'Grave / Profunda', icon: '🦁', description: 'Tono bajo y resonancia potente' },
  { id: 'high', name: 'Aguda / Ardilla', icon: '🐿️', description: 'Tono rápido, alegre y agudo' },
  { id: 'robot', name: 'Robótica', icon: '🤖', description: 'Efecto cibernético y metálico' },
  { id: 'echo', name: 'Eco / Espacial', icon: '🏛️', description: 'Reverberación y repeticiones' },
  { id: 'radio', name: 'Radio / Megáfono', icon: '📻', description: 'Filtro retro de walkie-talkie' },
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
 * Emulates and transforms an audio blob using Web Audio API
 */
export async function applyVoiceEffect(audioBlob: Blob, effect: VoiceEffect): Promise<Blob> {
  if (effect === 'normal') {
    return audioBlob;
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

  let targetDuration = decodedBuffer.duration;
  let playbackRate = 1.0;

  if (effect === 'deep') {
    playbackRate = 0.78; // deeper voice
    targetDuration = decodedBuffer.duration / playbackRate;
  } else if (effect === 'high') {
    playbackRate = 1.32; // higher chipmunk-style voice
    targetDuration = decodedBuffer.duration / playbackRate;
  }

  const offlineContext = new OfflineAudioContext(
    decodedBuffer.numberOfChannels,
    Math.ceil(targetDuration * decodedBuffer.sampleRate),
    decodedBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = decodedBuffer;
  source.playbackRate.value = playbackRate;

  if (effect === 'deep') {
    // Low-pass filter to boost bass and warmth
    const lowpass = offlineContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2400;

    const bassBoost = offlineContext.createBiquadFilter();
    bassBoost.type = 'lowshelf';
    bassBoost.frequency.value = 250;
    bassBoost.gain.value = 6;

    source.connect(lowpass);
    lowpass.connect(bassBoost);
    bassBoost.connect(offlineContext.destination);
  } else if (effect === 'high') {
    // High-pass filter to make it crisp and playful
    const highpass = offlineContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 400;

    source.connect(highpass);
    highpass.connect(offlineContext.destination);
  } else if (effect === 'robot') {
    // Ring modulator: Audio modulated by a 60Hz carrier
    const carrier = offlineContext.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = 65;

    const carrierGain = offlineContext.createGain();
    carrierGain.gain.value = 1.0;

    const multiplier = offlineContext.createGain();
    multiplier.gain.value = 0.0;

    carrier.connect(multiplier.gain);
    source.connect(multiplier);
    carrier.start();

    // Highpass to clean up rumble
    const filter = offlineContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.5;

    multiplier.connect(filter);
    filter.connect(offlineContext.destination);
  } else if (effect === 'echo') {
    // Delay + feedback
    const delay = offlineContext.createDelay();
    delay.delayTime.value = 0.22;

    const feedback = offlineContext.createGain();
    feedback.gain.value = 0.35;

    const wetGain = offlineContext.createGain();
    wetGain.gain.value = 0.5;

    source.connect(offlineContext.destination); // dry
    source.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(offlineContext.destination);
  } else if (effect === 'radio') {
    // Bandpass megaphone effect
    const bandpass = offlineContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1600;
    bandpass.Q.value = 2.5;

    const peaking = offlineContext.createBiquadFilter();
    peaking.type = 'peaking';
    peaking.frequency.value = 2200;
    peaking.gain.value = 8;

    source.connect(bandpass);
    bandpass.connect(peaking);
    peaking.connect(offlineContext.destination);
  }

  source.start(0);
  const renderedBuffer = await offlineContext.startRendering();
  audioContext.close();

  return bufferToWavBlob(renderedBuffer);
}
