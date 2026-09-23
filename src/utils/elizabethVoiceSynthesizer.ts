/**
 * Elizabeth & AI Voice Synthesizer Engine
 * Proporciona síntesis de voz humana hiperrealista para Elizabeth y personajes IA en ChatLiz.
 * Integra:
 * 1. Motor Neural de Estudio Gemini TTS (gemini-3.8-flash-lite-tts): Voces humanas reales de mujer, hombre,
 *    anciano sabio, adolescente y clonación acústica (WAV 24kHz con inflexiones reales).
 * 2. Motor de Fallback Local (SpeechSynthesis con correspondencia estricta de género y filtros acústicos).
 * 3. Modo Mímica / Clonado Acústico: reproduce con el estilo vocal aprendido de usuarios.
 */

export interface VoiceArchetype {
  id: string;
  name: string;
  category: 'femenina' | 'masculina' | 'anciano' | 'adolescente' | 'cuantica' | 'mimica' | 'personalizada';
  gender: 'female' | 'male' | 'neutral';
  pitch: number;    // 0.5 - 2.0
  rate: number;     // 0.5 - 2.0
  volume: number;   // 0.0 - 1.0
  description: string;
  neuralVoice: 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';
  icon: string;
}

export interface ElizabethVoiceConfig {
  archetypeId: string;
  mimicUsername?: string;
  engine: 'xtts_neural' | 'neural' | 'browser';
  pitch: number;
  rate: number;
  volume: number;
  voiceURI: string;
  autoPlay: boolean;
  voiceTone: 'calida' | 'seria' | 'jovial' | 'suave' | 'energetica';
  useBarkExpressiveTags?: boolean;
  useXttsProsody?: boolean;
}

export interface VoiceEvolutionLog {
  id: string;
  timestamp: number;
  sourceUsername: string;
  title: string;
  detail: string;
  naturalnessDelta: number;
  currentLevel: number;
}

export interface VoiceEvolutionState {
  humanizationLevel: number;
  evolutionStage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  totalAudiosAbsorbed: number;
  learningPace: 'normal' | 'rapido' | 'pasos_agigantados';
  barkNonVerbalTagsEnabled: boolean;
  xttsProsodyEnabled: boolean;
  absorbedTraits: {
    naturalBreathing: boolean;
    expressivePitchContour: boolean;
    conversationalWarmth: boolean;
    laughterInflection: boolean;
    rhythmAdaptability: boolean;
    vocalFryReduction: boolean;
  };
  lastEvolutionTimestamp: number;
  logs: VoiceEvolutionLog[];
}

export const VOICE_ARCHETYPES: VoiceArchetype[] = [
  {
    id: 'female_young',
    name: 'Femenina Joven (Elizabeth)',
    category: 'femenina',
    gender: 'female',
    pitch: 1.1,
    rate: 1.0,
    volume: 1.0,
    description: 'Voz humana femenina natural, dulce, pícara, cálida y carismática.',
    neuralVoice: 'Kore',
    icon: '👩'
  },
  {
    id: 'female_teen',
    name: 'Adolescente Femenina',
    category: 'adolescente',
    gender: 'female',
    pitch: 1.35,
    rate: 1.06,
    volume: 1.0,
    description: 'Voz juvenil de chica, alegre, dulce, dinámica y con timbre brillante.',
    neuralVoice: 'Zephyr',
    icon: '👧'
  },
  {
    id: 'male_natural',
    name: 'Masculino Natural (Hombre Adulto)',
    category: 'masculina',
    gender: 'male',
    pitch: 0.85,
    rate: 0.98,
    volume: 1.0,
    description: 'Voz humana de hombre real: firme, amigable, relajada y con presencia.',
    neuralVoice: 'Puck',
    icon: '👨'
  },
  {
    id: 'male_teen',
    name: 'Adolescente Masculino',
    category: 'adolescente',
    gender: 'male',
    pitch: 1.1,
    rate: 1.04,
    volume: 1.0,
    description: 'Voz juvenil de muchacho enérgico, animado y desenfadado.',
    neuralVoice: 'Puck',
    icon: '👦'
  },
  {
    id: 'male_elder',
    name: 'Anciano Sabio (Abuelo)',
    category: 'anciano',
    gender: 'male',
    pitch: 0.65,
    rate: 0.84,
    volume: 1.0,
    description: 'Voz masculina muy profunda, grave, pausada, reflexiva y serena.',
    neuralVoice: 'Charon',
    icon: '👴'
  },
  {
    id: 'female_elder',
    name: 'Anciana Afectuosa (Abuela)',
    category: 'anciano',
    gender: 'female',
    pitch: 0.82,
    rate: 0.86,
    volume: 1.0,
    description: 'Voz madura, tierna, dulce y sosegada de abuela bondadosa.',
    neuralVoice: 'Kore',
    icon: '👵'
  },
  {
    id: 'quantum_ai',
    name: 'Mente Cuántica (Elizabeth QML)',
    category: 'cuantica',
    gender: 'neutral',
    pitch: 1.05,
    rate: 1.02,
    volume: 1.0,
    description: 'Voz clara, armónica, limpia y sofisticada de IA avanzada.',
    neuralVoice: 'Zephyr',
    icon: '⚛️'
  },
  {
    id: 'mimic',
    name: 'Modo Mímica (Imitación de Usuario)',
    category: 'mimica',
    gender: 'neutral',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    description: 'Elizabeth imita el timbre, cadencia y estilo de los audios aprendidos del usuario.',
    neuralVoice: 'Puck',
    icon: '🧬'
  },
  {
    id: 'custom',
    name: 'Personalizada',
    category: 'personalizada',
    gender: 'neutral',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    description: 'Ajuste libre y manual de todos los parámetros acústicos.',
    neuralVoice: 'Kore',
    icon: '🎛️'
  }
];

export const DEFAULT_ELIZABETH_VOICE: ElizabethVoiceConfig = {
  archetypeId: 'female_young',
  mimicUsername: '',
  engine: 'xtts_neural', // Motor neural hiperrealista XTTS v2 + Bark
  pitch: 1.05,
  rate: 1.0,
  volume: 1.0,
  voiceURI: '',
  autoPlay: false,
  voiceTone: 'calida',
  useBarkExpressiveTags: true,
  useXttsProsody: true
};

const STORAGE_KEY = 'chatliz_elizabeth_voice_config_v2';

export function getSavedElizabethVoiceConfig(): ElizabethVoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_ELIZABETH_VOICE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migración automática: nunca dejar 'browser' obsoleto como voz principal
      const engine = (parsed.engine === 'browser') ? 'xtts_neural' : (parsed.engine || 'xtts_neural');
      return {
        ...DEFAULT_ELIZABETH_VOICE,
        ...parsed,
        engine,
        useBarkExpressiveTags: parsed.useBarkExpressiveTags ?? true,
        useXttsProsody: parsed.useXttsProsody ?? true
      };
    }
  } catch (e) {
    console.error("Error reading saved Elizabeth voice config:", e);
  }
  return DEFAULT_ELIZABETH_VOICE;
}

export function saveElizabethVoiceConfig(config: Partial<ElizabethVoiceConfig>): ElizabethVoiceConfig {
  const current = getSavedElizabethVoiceConfig();
  const updated: ElizabethVoiceConfig = {
    ...current,
    ...config,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving Elizabeth voice config:", e);
    }
  }
  return updated;
}

export async function getSystemVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    return sortVoicesByPreference(existing);
  }

  return new Promise((resolve) => {
    const handler = () => {
      const voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(sortVoicesByPreference(voices));
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);

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

    const aIsNatural = a.name.toLowerCase().includes('natural') || a.name.toLowerCase().includes('google');
    const bIsNatural = b.name.toLowerCase().includes('natural') || b.name.toLowerCase().includes('google');
    if (aIsNatural && !bIsNatural) return -1;
    if (!aIsNatural && bIsNatural) return 1;

    return a.name.localeCompare(b.name);
  });
}

export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\[BAN:[^\]]+\]/gi, '')
    .replace(/\[UNBAN:[^\]]+\]/gi, '')
    .replace(/```[\s\S]*?```/g, ' bloque de código ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/https?:\/\/\S+/gi, ' enlace ')
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Variables de reproducción activa
let activeAudioElement: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentSpeakingCallbacks: { onStart?: () => void; onEnd?: () => void; onError?: (err?: any) => void; } | null = null;

export function stopSpeaking(): void {
  // 1. Detener audio neural HTML5
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch (e) {
      console.error("Error stopping neural audio:", e);
    }
    activeAudioElement = null;
  }

  // 2. Detener síntesis local del navegador
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error("Error stopping speech:", e);
    }
  }

  if (currentSpeakingCallbacks?.onEnd) {
    currentSpeakingCallbacks.onEnd();
  }

  activeUtterance = null;
  currentSpeakingCallbacks = null;
}

export function isSpeaking(): boolean {
  if (activeAudioElement && !activeAudioElement.paused) return true;
  if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) return true;
  return false;
}

/**
 * Síntesis de Fallback con el navegador (SpeechSynthesis)
 * Forzando concordancia de género real para no poner voz de mujer a un anciano u hombre.
 */
async function speakWithBrowserSynthesis(
  cleanText: string,
  config: ElizabethVoiceConfig,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    callbacks?.onError?.("SpeechSynthesis no soportado.");
    return false;
  }

  const voices = await getSystemVoices();
  const utterance = new SpeechSynthesisUtterance(cleanText);

  const archetype = VOICE_ARCHETYPES.find(a => a.id === config.archetypeId);
  const targetGender = archetype?.gender || 'female';

  if (config.voiceURI) {
    const found = voices.find(v => v.voiceURI === config.voiceURI);
    if (found) utterance.voice = found;
  }

  if (!utterance.voice && voices.length > 0) {
    const esVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    const pool = esVoices.length > 0 ? esVoices : voices;

    if (targetGender === 'female') {
      const femaleKeywords = ['sabina', 'helena', 'monica', 'paulina', 'lucia', 'laura', 'marta', 'maria', 'female', 'mujer', 'zira', 'kore'];
      const matched = pool.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      utterance.voice = matched || pool[0];
    } else if (targetGender === 'male') {
      const maleKeywords = ['jorge', 'pablo', 'diego', 'carlos', 'enrique', 'david', 'male', 'hombre', 'miguel', 'raul', 'puck', 'charon'];
      const matched = pool.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      utterance.voice = matched || pool[0];
    } else {
      utterance.voice = pool[0];
    }
  }

  utterance.pitch = Math.max(0.5, Math.min(2.0, config.pitch));
  utterance.rate = Math.max(0.5, Math.min(2.0, config.rate));
  utterance.volume = Math.max(0.0, Math.min(1.0, config.volume));

  currentSpeakingCallbacks = callbacks || null;

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => {
    activeUtterance = null;
    callbacks?.onEnd?.();
  };
  utterance.onerror = (e) => {
    activeUtterance = null;
    callbacks?.onError?.(e);
  };

  activeUtterance = utterance;

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    callbacks?.onError?.(err);
    return false;
  }
}

/**
 * Función Principal para hablar un mensaje de Elizabeth:
 * 1. Invoca el motor Neural de Gemini TTS (gemini-3.8-flash-lite-tts) a través de la API del servidor.
 * 2. Si tiene éxito, reproduce audio WAV cristalino de alta definición con inflexiones humanas reales.
 * 3. Si hay algún problema de conexión, recurre con elegancia al fallback local con género respetado.
 */
export async function speakElizabethMessage(
  text: string,
  configOverride?: Partial<ElizabethVoiceConfig>,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<boolean> {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    callbacks?.onEnd?.();
    return false;
  }

  // Detener locuciones anteriores
  stopSpeaking();

  const config: ElizabethVoiceConfig = {
    ...getSavedElizabethVoiceConfig(),
    ...configOverride
  };

  currentSpeakingCallbacks = callbacks || null;

  // Si el usuario configuró explícitamente el navegador, usar fallback local directamente
  if (config.engine === 'browser') {
    return speakWithBrowserSynthesis(cleanText, config, callbacks);
  }

  // Intentar Síntesis Neural de Estudio (Gemini TTS)
  try {
    const res = await fetch("/api/ai/synthesize_voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: cleanText,
        archetypeId: config.archetypeId,
        mimicUsername: config.mimicUsername,
        pitch: config.pitch,
        rate: config.rate,
        voiceTone: config.voiceTone,
        volume: config.volume,
        useBarkExpressiveTags: config.useBarkExpressiveTags ?? true
      })
    });

    const data = await res.json();
    if (data?.success && data.audioBase64) {
      const audio = new Audio(data.audioBase64);
      audio.volume = Math.max(0, Math.min(1, config.volume));

      audio.onplay = () => {
        callbacks?.onStart?.();
      };

      audio.onended = () => {
        activeAudioElement = null;
        callbacks?.onEnd?.();
      };

      audio.onerror = (err) => {
        console.warn("Error en reproducción de audio neural:", err);
        activeAudioElement = null;
        // Fallback a navegador
        speakWithBrowserSynthesis(cleanText, config, callbacks);
      };

      activeAudioElement = audio;
      await audio.play();
      return true;
    } else {
      console.warn("API de voz neural devolvió error, pasando a fallback local:", data?.error);
      return speakWithBrowserSynthesis(cleanText, config, callbacks);
    }
  } catch (err) {
    console.warn("Fallo al conectar con endpoint de voz neural, usando fallback local:", err);
    return speakWithBrowserSynthesis(cleanText, config, callbacks);
  }
}

/**
 * Petición de estado de evolución vocal de Elizabeth
 */
export function fetchVoiceEvolutionStatus(socket: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket) return reject(new Error("Socket no disponible"));
    socket.emit("get_voice_evolution_status", (res: any) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.error || "Error al obtener estado de evolución"));
    });
  });
}

/**
 * Provocar salto evolutivo instantáneo a pasos agigantados
 */
export function requestInstantEvolutionLeap(socket: any, bonusPercent = 10, reason = "Mejora acelerada cuántica"): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket) return reject(new Error("Socket no disponible"));
    socket.emit("trigger_instant_evolution_leap", { bonusPercent, reason }, (res: any) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.error || "Error al inducir salto"));
    });
  });
}

/**
 * Clonar una voz con el motor XTTS v2
 */
export function requestVoiceCloneFromSample(
  socket: any,
  cloneName: string,
  sampleAudioBase64: string,
  sampleText?: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket) return reject(new Error("Socket no disponible"));
    socket.emit("clone_voice_from_sample", { cloneName, sampleAudioBase64, sampleText }, (res: any) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.error || "Error al clonar voz"));
    });
  });
}
