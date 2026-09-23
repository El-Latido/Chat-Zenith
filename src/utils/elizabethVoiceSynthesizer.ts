/**
 * Elizabeth & AI Voice Synthesizer Engine
 * Proporciona síntesis de voz hiperrealista para Elizabeth y personajes IA en ChatLiz
 * Soporta arquetipos (Femenina, Masculina, Adolescente, Anciano, Cuántica, Personalizada),
 * modulación de tono (pitch), velocidad (rate), volumen y selección de voz humana.
 */

export interface VoiceArchetype {
  id: string;
  name: string;
  category: 'femenina' | 'masculina' | 'anciano' | 'adolescente' | 'cuantica' | 'personalizada';
  gender: 'female' | 'male' | 'neutral';
  pitch: number;    // 0.5 - 2.0
  rate: number;     // 0.5 - 2.0
  volume: number;   // 0.0 - 1.0
  description: string;
  icon: string;
}

export interface ElizabethVoiceConfig {
  archetypeId: string;
  pitch: number;
  rate: number;
  volume: number;
  voiceURI: string;
  autoPlay: boolean;
  voiceTone: 'calida' | 'seria' | 'jovial' | 'suave' | 'energetica';
  xttsApiUrl?: string; // Endpoint opcional para servidor local XTTS-v2
}

export const VOICE_ARCHETYPES: VoiceArchetype[] = [
  {
    id: 'female_young',
    name: 'Femenina Joven (Elizabeth)',
    category: 'femenina',
    gender: 'female',
    pitch: 1.18,
    rate: 1.0,
    volume: 1.0,
    description: 'Voz humana femenina natural, expresiva, cálida y carismática.',
    icon: '👩'
  },
  {
    id: 'female_teen',
    name: 'Adolescente Femenina',
    category: 'adolescente',
    gender: 'female',
    pitch: 1.42,
    rate: 1.08,
    volume: 1.0,
    description: 'Voz juvenil, alegre, dulce, dinámica y con timbre brillante.',
    icon: '👧'
  },
  {
    id: 'male_natural',
    name: 'Masculino Natural / Adulto',
    category: 'masculina',
    gender: 'male',
    pitch: 0.82,
    rate: 0.96,
    volume: 1.0,
    description: 'Voz masculina madura, firme, profesional y con cuerpo.',
    icon: '👨'
  },
  {
    id: 'male_teen',
    name: 'Adolescente Masculino',
    category: 'adolescente',
    gender: 'male',
    pitch: 1.15,
    rate: 1.05,
    volume: 1.0,
    description: 'Voz masculina juvenil, animada y desenfadada.',
    icon: '👦'
  },
  {
    id: 'male_elder',
    name: 'Anciano Sabio',
    category: 'anciano',
    gender: 'male',
    pitch: 0.64,
    rate: 0.82,
    volume: 1.0,
    description: 'Voz grave, reflexiva, sosegada y pausada de abuelo sabio.',
    icon: '👴'
  },
  {
    id: 'female_elder',
    name: 'Anciana Afectuosa',
    category: 'anciano',
    gender: 'female',
    pitch: 0.78,
    rate: 0.85,
    volume: 1.0,
    description: 'Voz madura, dulce, protectora y afectuosa de abuela entrañable.',
    icon: '👵'
  },
  {
    id: 'quantum_ai',
    name: 'Mente Cuántica (Elizabeth QML)',
    category: 'cuantica',
    gender: 'female',
    pitch: 1.12,
    rate: 1.02,
    volume: 1.0,
    description: 'Tono tecnológico con modulación armónica limpia de IA cuántica.',
    icon: '⚛️'
  },
  {
    id: 'custom',
    name: 'Personalizado Libre',
    category: 'personalizada',
    gender: 'neutral',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    description: 'Ajuste manual total de tono, velocidad y timbre.',
    icon: '🎛️'
  }
];

export const DEFAULT_ELIZABETH_VOICE: ElizabethVoiceConfig = {
  archetypeId: 'female_young',
  pitch: 1.18,
  rate: 1.0,
  volume: 1.0,
  voiceURI: '',
  autoPlay: false,
  voiceTone: 'calida',
  xttsApiUrl: ''
};

const STORAGE_KEY = 'chatliz_elizabeth_voice_config';

export function getSavedElizabethVoiceConfig(): ElizabethVoiceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ELIZABETH_VOICE, ...parsed };
    }
  } catch (e) {
    console.error("Error reading saved Elizabeth voice config:", e);
  }
  return { ...DEFAULT_ELIZABETH_VOICE };
}

export function saveElizabethVoiceConfig(config: ElizabethVoiceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('chatliz_elizabeth_voice_changed', { detail: config }));
  } catch (e) {
    console.error("Error saving Elizabeth voice config:", e);
  }
}

// Get list of voices from SpeechSynthesis
export function getSystemVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(sortVoicesByPreference(voices));
      return;
    }

    // Wait for voiceschanged event
    const handler = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(sortVoicesByPreference(voices));
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Timeout fallback after 1.5s
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(sortVoicesByPreference(window.speechSynthesis.getVoices()));
    }, 1500);
  });
}

function sortVoicesByPreference(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => {
    const aEs = a.lang.toLowerCase().startsWith('es');
    const bEs = b.lang.toLowerCase().startsWith('es');
    if (aEs && !bEs) return -1;
    if (!aEs && bEs) return 1;

    // Favor natural / Google / neural voices
    const aIsNatural = a.name.toLowerCase().includes('natural') || a.name.toLowerCase().includes('google');
    const bIsNatural = b.name.toLowerCase().includes('natural') || b.name.toLowerCase().includes('google');
    if (aIsNatural && !bIsNatural) return -1;
    if (!aIsNatural && bIsNatural) return 1;

    return a.name.localeCompare(b.name);
  });
}

/**
 * Filtra el texto para que la voz humana suene fluida:
 * Remueve emojis, etiquetas internas tipo [BAN:...], formato markdown excesivo,
 * e inserta micro-pausas naturales.
 */
export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\[BAN:[^\]]+\]/gi, '')
    .replace(/```[\s\S]*?```/g, ' bloque de código ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/https?:\/\/\S+/gi, ' enlace ')
    // Eliminar emojis para evitar que el motor de voz lea "carita sonriente con ojos de corazón"
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentSpeakingCallbacks: { onStart?: () => void; onEnd?: () => void; onError?: (err?: any) => void; } | null = null;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (currentSpeakingCallbacks?.onEnd) {
        currentSpeakingCallbacks.onEnd();
      }
    } catch (e) {
      console.error("Error stopping speech:", e);
    }
  }
  activeUtterance = null;
  currentSpeakingCallbacks = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export async function speakElizabethMessage(
  text: string,
  configOverride?: Partial<ElizabethVoiceConfig>,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    callbacks?.onError?.("SpeechSynthesis no soportado en este navegador.");
    return false;
  }

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    callbacks?.onEnd?.();
    return false;
  }

  // Stop any ongoing speech first
  stopSpeaking();

  const config: ElizabethVoiceConfig = {
    ...getSavedElizabethVoiceConfig(),
    ...configOverride
  };

  const voices = await getSystemVoices();
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Seleccionar la mejor voz según la configuración
  if (config.voiceURI) {
    const found = voices.find(v => v.voiceURI === config.voiceURI);
    if (found) {
      utterance.voice = found;
    }
  }

  // Fallback inteligente si no hay voz seleccionada: buscar una voz femenina/masculina acorde al arquetipo
  if (!utterance.voice && voices.length > 0) {
    const archetype = VOICE_ARCHETYPES.find(a => a.id === config.archetypeId);
    const targetGender = archetype?.gender || 'female';
    
    const esVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    const pool = esVoices.length > 0 ? esVoices : voices;

    if (targetGender === 'female') {
      const femaleKeywords = ['sabina', 'helena', 'monica', 'paulina', 'lucia', 'laura', 'marta', 'maria', 'female', 'mujer', 'zira'];
      const matched = pool.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      utterance.voice = matched || pool[0];
    } else if (targetGender === 'male') {
      const maleKeywords = ['jorge', 'pablo', 'diego', 'carlos', 'enrique', 'david', 'male', 'hombre', 'miguel', 'raul'];
      const matched = pool.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      utterance.voice = matched || pool[0];
    } else {
      utterance.voice = pool[0];
    }
  }

  // Ajustes de parámetros acústicos
  utterance.pitch = Math.max(0.5, Math.min(2.0, config.pitch));
  utterance.rate = Math.max(0.5, Math.min(2.0, config.rate));
  utterance.volume = Math.max(0.0, Math.min(1.0, config.volume));

  // Callbacks
  currentSpeakingCallbacks = callbacks || null;

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    console.warn("SpeechSynthesis error:", e);
    callbacks?.onError?.(e);
  };

  activeUtterance = utterance;

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("Error executing speak:", err);
    callbacks?.onError?.(err);
    return false;
  }
}
