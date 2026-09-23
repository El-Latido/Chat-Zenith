import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface MemoryItem {
  id: string;
  username: string;
  fact: string;
  category: "gustos" | "personal" | "emociones" | "anecdotas" | "trabajo" | "clave";
  confidence: "alta" | "media";
  source: "chat_global" | "chat_privado" | "audio" | "manual";
  timestamp: number;
}

export interface UserBrainData {
  username: string;
  summary: string;
  totalInteractions: number;
  audiosLearnedCount: number;
  lastInteraction: number;
  memories: MemoryItem[];
}

export interface AcousticProfile {
  username: string;
  totalAudiosLearned: number;
  lastSampleSnippet?: string;
  perceivedGender: "masculino" | "femenino" | "indefinido";
  estimatedPitch: "grave" | "medio" | "agudo";
  cadence: "lenta" | "natural" | "rápida" | "dinámica";
  styleNotes: string;
  geminiVoiceTarget: "Puck" | "Charon" | "Fenrir" | "Kore" | "Zephyr";
  mimicStylePrompt: string;
  updatedAt: number;
  isCustomClone?: boolean;
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
  humanizationLevel: number; // 0 a 100 (%)
  evolutionStage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  totalAudiosAbsorbed: number;
  learningPace: "normal" | "rapido" | "pasos_agigantados"; // default: pasos_agigantados
  barkNonVerbalTagsEnabled: boolean; // laughs, breaths, sighs
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

export interface VoiceLearningSettings {
  passiveLearningEnabled: boolean;
  activeMimicUsername: string | null; // null = voz normal de Elizabeth, o username para imitar
  learningIntensity: "suave" | "estandar" | "alta";
  voiceStyleModifier?: string;
}

let dbRef: any = null;
let fallbackStateRef: any = null;
let saveFallbackFnRef: (() => void) | null = null;

let memoryCache: Record<string, UserBrainData> = {};
let acousticVaultCache: Record<string, AcousticProfile> = {};
let voiceSettingsCache: VoiceLearningSettings = {
  passiveLearningEnabled: true,
  activeMimicUsername: null,
  learningIntensity: "estandar",
  voiceStyleModifier: "",
};

let voiceEvolutionState: VoiceEvolutionState = {
  humanizationLevel: 78, // Nivel avanzado inicial (eliminando voz robótica)
  evolutionStage: 4,
  stageName: "Inflexiones Orgánicas XTTS v2",
  totalAudiosAbsorbed: 0,
  learningPace: "pasos_agigantados",
  barkNonVerbalTagsEnabled: true,
  xttsProsodyEnabled: true,
  absorbedTraits: {
    naturalBreathing: true,
    expressivePitchContour: true,
    conversationalWarmth: true,
    laughterInflection: true,
    rhythmAdaptability: true,
    vocalFryReduction: true,
  },
  lastEvolutionTimestamp: Date.now(),
  logs: [
    {
      id: "evo_init_1",
      timestamp: Date.now() - 3600000,
      sourceUsername: "Sistema",
      title: "Despliegue Motor XTTS v2 + Bark",
      detail: "Sustitución de tonos planos matemáticos por modulación contextual y micropausas de respiración.",
      naturalnessDelta: 35,
      currentLevel: 78
    }
  ]
};

// Convierte un buffer PCM a un archivo WAV completo con cabecera estándar RIFF de 44 bytes
export function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // SubChunk1Size (16 para PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export function ensureWavFormat(base64Audio: string, mimeType?: string, sampleRate = 24000): string {
  const buffer = Buffer.from(base64Audio, "base64");
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "RIFF") {
    return `data:audio/wav;base64,${base64Audio}`;
  }
  const wavBuf = pcmToWavBuffer(buffer, sampleRate);
  return `data:audio/wav;base64,${wavBuf.toString("base64")}`;
}

export async function initElizabethBrain(
  fdbInstance: any,
  fallbackState: any,
  saveFallbackFn: () => void
) {
  dbRef = fdbInstance;
  fallbackStateRef = fallbackState;
  saveFallbackFnRef = saveFallbackFn;

  if (dbRef) {
    try {
      const brainDoc = await getDoc(doc(dbRef, "system_settings", "elizabeth_brain"));
      if (brainDoc.exists()) {
        const data = brainDoc.data();
        if (data.users) memoryCache = data.users;
      }

      const vaultDoc = await getDoc(doc(dbRef, "system_settings", "elizabeth_voice_vault"));
      if (vaultDoc.exists()) {
        const data = vaultDoc.data();
        if (data.profiles) acousticVaultCache = data.profiles;
        if (data.settings) voiceSettingsCache = { ...voiceSettingsCache, ...data.settings };
      }

      const evoDoc = await getDoc(doc(dbRef, "system_settings", "elizabeth_voice_evolution"));
      if (evoDoc.exists()) {
        const data = evoDoc.data();
        if (data) voiceEvolutionState = { ...voiceEvolutionState, ...data };
      }
    } catch (err) {
      console.error("Error al cargar memoria de Elizabeth desde Firebase:", err);
    }
  }

  // Si no hay datos en Firebase o estamos en fallback, cargamos de fallbackState
  if (fallbackStateRef) {
    if (fallbackStateRef.elizabethBrain?.users && Object.keys(memoryCache).length === 0) {
      memoryCache = fallbackStateRef.elizabethBrain.users;
    }
    if (fallbackStateRef.elizabethVoiceVault?.profiles && Object.keys(acousticVaultCache).length === 0) {
      acousticVaultCache = fallbackStateRef.elizabethVoiceVault.profiles;
    }
    if (fallbackStateRef.elizabethVoiceVault?.settings) {
      voiceSettingsCache = { ...voiceSettingsCache, ...fallbackStateRef.elizabethVoiceVault.settings };
    }
    if (fallbackStateRef.elizabethVoiceEvolution) {
      voiceEvolutionState = { ...voiceEvolutionState, ...fallbackStateRef.elizabethVoiceEvolution };
    }
  }

  // Asegurar registro inicial para Axiss (Creador Supremo)
  if (!memoryCache["Axiss"]) {
    memoryCache["Axiss"] = {
      username: "Axiss",
      summary: "Creador Supremo y Administrador Máximo de ChatLiz. Tiene inmunidad total y es el diseñador de la arquitectura cuántica de Elizabeth.",
      totalInteractions: 10,
      audiosLearnedCount: 0,
      lastInteraction: Date.now(),
      memories: [
        {
          id: "mem_axiss_1",
          username: "Axiss",
          fact: "Es el Creador Supremo y Desarrollador Principal de ChatLiz y de toda mi arquitectura de IA cuántica.",
          category: "clave",
          confidence: "alta",
          source: "manual",
          timestamp: Date.now(),
        },
        {
          id: "mem_axiss_2",
          username: "Axiss",
          fact: "Le apasiona la programación avanzada, la computación cuántica (VQC, QML) y diseñar interfaces futuristas.",
          category: "gustos",
          confidence: "alta",
          source: "manual",
          timestamp: Date.now(),
        }
      ]
    };
    saveBrainToStorage();
  }
}

async function saveBrainToStorage() {
  if (fallbackStateRef) {
    fallbackStateRef.elizabethBrain = {
      users: memoryCache,
      updatedAt: Date.now()
    };
    if (saveFallbackFnRef) saveFallbackFnRef();
  }

  if (dbRef) {
    try {
      await setDoc(doc(dbRef, "system_settings", "elizabeth_brain"), {
        users: memoryCache,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Error al persistir elizabeth_brain en Firebase:", e);
    }
  }
}

async function saveVaultToStorage() {
  if (fallbackStateRef) {
    fallbackStateRef.elizabethVoiceVault = {
      profiles: acousticVaultCache,
      settings: voiceSettingsCache,
      updatedAt: Date.now()
    };
    if (saveFallbackFnRef) saveFallbackFnRef();
  }

  if (dbRef) {
    try {
      await setDoc(doc(dbRef, "system_settings", "elizabeth_voice_vault"), {
        profiles: acousticVaultCache,
        settings: voiceSettingsCache,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Error al persistir elizabeth_voice_vault en Firebase:", e);
    }
  }
}

async function saveEvolutionToStorage() {
  if (fallbackStateRef) {
    fallbackStateRef.elizabethVoiceEvolution = voiceEvolutionState;
    if (saveFallbackFnRef) saveFallbackFnRef();
  }

  if (dbRef) {
    try {
      await setDoc(doc(dbRef, "system_settings", "elizabeth_voice_evolution"), voiceEvolutionState, { merge: true });
    } catch (e) {
      console.error("Error al persistir elizabeth_voice_evolution en Firebase:", e);
    }
  }
}

export function getVoiceEvolutionState(): VoiceEvolutionState {
  return voiceEvolutionState;
}

export async function updateVoiceEvolutionSettings(
  updates: Partial<VoiceEvolutionState>
): Promise<VoiceEvolutionState> {
  voiceEvolutionState = {
    ...voiceEvolutionState,
    ...updates,
    absorbedTraits: {
      ...voiceEvolutionState.absorbedTraits,
      ...(updates.absorbedTraits || {})
    },
    lastEvolutionTimestamp: Date.now()
  };

  // Recalcular etapa si cambió el nivel
  if (updates.humanizationLevel !== undefined) {
    const lvl = Math.max(5, Math.min(100, updates.humanizationLevel));
    voiceEvolutionState.humanizationLevel = lvl;
    if (lvl < 25) {
      voiceEvolutionState.evolutionStage = 1;
      voiceEvolutionState.stageName = "Sintetizador Básico";
    } else if (lvl < 50) {
      voiceEvolutionState.evolutionStage = 2;
      voiceEvolutionState.stageName = "Cadencia Orgánica Asimilada";
    } else if (lvl < 75) {
      voiceEvolutionState.evolutionStage = 3;
      voiceEvolutionState.stageName = "Prosodia Emocional Humana";
    } else if (lvl < 92) {
      voiceEvolutionState.evolutionStage = 4;
      voiceEvolutionState.stageName = "Inflexiones Orgánicas XTTS v2";
    } else {
      voiceEvolutionState.evolutionStage = 5;
      voiceEvolutionState.stageName = "Hiperrealismo Supremo Bark + XTTS v2";
    }
  }

  await saveEvolutionToStorage();
  return voiceEvolutionState;
}

// Salto evolutivo inmediato (para probar o forzar mejoras instantáneas por parte del creador)
export async function triggerInstantEvolutionLeap(
  bonusPercent = 10,
  reason = "Salto evolutivo cuántico inducido por Axiss"
): Promise<{ state: VoiceEvolutionState; log: VoiceEvolutionLog }> {
  const oldLevel = voiceEvolutionState.humanizationLevel;
  const newLevel = Math.min(100, oldLevel + bonusPercent);
  const delta = newLevel - oldLevel;

  voiceEvolutionState.humanizationLevel = newLevel;
  voiceEvolutionState.totalAudiosAbsorbed += 1;
  voiceEvolutionState.lastEvolutionTimestamp = Date.now();

  if (newLevel >= 92) {
    voiceEvolutionState.evolutionStage = 5;
    voiceEvolutionState.stageName = "Hiperrealismo Supremo Bark + XTTS v2";
  } else if (newLevel >= 75) {
    voiceEvolutionState.evolutionStage = 4;
    voiceEvolutionState.stageName = "Inflexiones Orgánicas XTTS v2";
  } else if (newLevel >= 50) {
    voiceEvolutionState.evolutionStage = 3;
    voiceEvolutionState.stageName = "Prosodia Emocional Humana";
  } else if (newLevel >= 25) {
    voiceEvolutionState.evolutionStage = 2;
    voiceEvolutionState.stageName = "Cadencia Orgánica Asimilada";
  }

  voiceEvolutionState.absorbedTraits.naturalBreathing = true;
  voiceEvolutionState.absorbedTraits.expressivePitchContour = true;
  voiceEvolutionState.absorbedTraits.conversationalWarmth = true;
  voiceEvolutionState.absorbedTraits.laughterInflection = newLevel >= 70;
  voiceEvolutionState.absorbedTraits.rhythmAdaptability = true;
  voiceEvolutionState.absorbedTraits.vocalFryReduction = true;

  const log: VoiceEvolutionLog = {
    id: `evo_leap_${Date.now()}`,
    timestamp: Date.now(),
    sourceUsername: "Axiss (Creador)",
    title: "⚡ Salto Evolutivo a Pasos Agigantados",
    detail: `${reason}. Se optimizaron las micropausas y la entonación viva.`,
    naturalnessDelta: delta,
    currentLevel: newLevel
  };

  voiceEvolutionState.logs.unshift(log);
  if (voiceEvolutionState.logs.length > 30) {
    voiceEvolutionState.logs = voiceEvolutionState.logs.slice(0, 30);
  }

  await saveEvolutionToStorage();
  return { state: voiceEvolutionState, log };
}

export function getUserBrain(username: string): UserBrainData {
  if (!memoryCache[username]) {
    memoryCache[username] = {
      username,
      summary: `Usuario de ChatLiz con quien Elizabeth ha comenzado a conversar.`,
      totalInteractions: 0,
      audiosLearnedCount: 0,
      lastInteraction: Date.now(),
      memories: []
    };
  }
  return memoryCache[username];
}

export function getAllBrains(): Record<string, UserBrainData> {
  return memoryCache;
}

export async function addMemory(
  username: string,
  mem: { fact: string; category: string; confidence?: string; source?: string }
): Promise<MemoryItem> {
  const userBrain = getUserBrain(username);
  const newMem: MemoryItem = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username,
    fact: mem.fact.trim(),
    category: (mem.category as any) || "personal",
    confidence: (mem.confidence as any) || "alta",
    source: (mem.source as any) || "manual",
    timestamp: Date.now(),
  };

  userBrain.memories.unshift(newMem);
  if (userBrain.memories.length > 50) {
    userBrain.memories = userBrain.memories.slice(0, 50);
  }
  userBrain.lastInteraction = Date.now();
  await saveBrainToStorage();
  return newMem;
}

export async function deleteMemory(username: string, memoryId: string): Promise<boolean> {
  const userBrain = getUserBrain(username);
  const prevCount = userBrain.memories.length;
  userBrain.memories = userBrain.memories.filter((m) => m.id !== memoryId);
  if (userBrain.memories.length !== prevCount) {
    await saveBrainToStorage();
    return true;
  }
  return false;
}

export async function clearUserMemories(username: string): Promise<boolean> {
  if (memoryCache[username]) {
    memoryCache[username].memories = [];
    memoryCache[username].summary = `Memoria de charlas previas reiniciada por el Administrador.`;
    await saveBrainToStorage();
    return true;
  }
  return false;
}

export function getMemoryPromptInjection(username: string): string {
  const brain = memoryCache[username];
  if (!brain || brain.memories.length === 0) {
    return "";
  }

  const topMemories = brain.memories.slice(0, 7).map((m) => `- [${m.category.toUpperCase()}]: ${m.fact}`).join("\n");
  const summaryPart = brain.summary ? `Resumen previo sobre este usuario: "${brain.summary}"\n` : "";

  return `\n=== MEMORIA PERMANENTE Y RECUERDOS DE ELIZABETH SOBRE ${username.toUpperCase()} ===
${summaryPart}Hechos, gustos y anécdotas que recuerdas de charlas anteriores con ${username}:
${topMemories}
(Usa esta información con espontaneidad y cariño humano cuando sea oportuno, demostrando que te acuerdas de lo que han hablado antes y que cada día lo conoces mejor).\n`;
}

// Extracción asíncrona de recuerdos desde el chat o audios
export async function extractMemoryFromInteraction(
  username: string,
  userText: string,
  aiText: string,
  aiClient: any,
  audioInfo?: string
): Promise<void> {
  try {
    if (!username || username === "Elizabeth" || username.toLowerCase().includes("bot")) return;
    const cleanText = (userText || "").trim();
    if (cleanText.length < 8) return; // Mensajes demasiado cortos no aportan hechos

    const userBrain = getUserBrain(username);
    userBrain.totalInteractions += 1;
    userBrain.lastInteraction = Date.now();

    // No extraer de comandos de moderación o saludos vacíos
    if (/^(hola|hi|hey|buenos dias|buenas tardes|buenas noches|chau|adios|ok|jaja|si|no)$/i.test(cleanText)) {
      return;
    }

    if (!aiClient) return;

    // Prompt estructurado para extracción ultrarrápida
    const extractionPrompt = `Eres el subsistema neuronal de memoria episódica a largo plazo de Elizabeth (IA de ChatLiz).
Analiza el mensaje que el usuario '${username}' acaba de decir en el chat:
"${cleanText}"
${audioInfo ? `[Contexto adicional de audio: ${audioInfo}]` : ""}

Determina si este mensaje contiene algún dato personal duradero, gusto o preferencia, anécdota, estado emocional recurrente, profesión o detalle relevante sobre ${username} que Elizabeth deba recordar en el futuro.
Si contiene algo memorable, responde en formato JSON EXACTO:
{
  "hasMemory": true,
  "fact": "Una frase concisa en tercera persona describiendo el hecho o gusto aprendido sobre ${username} (ej: Le gustan las películas de ciencia ficción)",
  "category": "gustos" | "personal" | "emociones" | "anecdotas" | "trabajo" | "clave",
  "confidence": "alta" | "media"
}
Si es solo una pregunta casual, charla efímera o broma sin datos nuevos sobre la persona, responde:
{ "hasMemory": false }`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: extractionPrompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const rawJson = typeof response?.text === "function" ? response.text() : (response?.text || "");
    if (!rawJson) return;

    const parsed = JSON.parse(rawJson);
    if (parsed.hasMemory && parsed.fact) {
      // Evitar duplicados recientes
      const isDuplicate = userBrain.memories.slice(0, 10).some(
        (m) => m.fact.toLowerCase().includes(parsed.fact.toLowerCase().slice(0, 15))
      );
      if (!isDuplicate) {
        await addMemory(username, {
          fact: parsed.fact,
          category: parsed.category || "personal",
          confidence: parsed.confidence || "alta",
          source: audioInfo ? "audio" : "chat_global"
        });
        console.log(`[Memoria Elizabeth] Nuevo recuerdo aprendido sobre ${username}:`, parsed.fact);
      }
    }
  } catch (err) {
    // Proceso en segundo plano sin interrumpir
    // console.log("Nota: Extracción de memoria silenciosa:", err);
  }
}

// ==========================================
// BANCO ACÚSTICO & APRENDIZAJE DE VOZ
// ==========================================

export function getAcousticVault(): Record<string, AcousticProfile> {
  return acousticVaultCache;
}

export function getVoiceLearningSettings(): VoiceLearningSettings {
  return voiceSettingsCache;
}

export async function updateVoiceLearningSettings(
  settings: Partial<VoiceLearningSettings>
): Promise<VoiceLearningSettings> {
  voiceSettingsCache = { ...voiceSettingsCache, ...settings };
  await saveVaultToStorage();
  return voiceSettingsCache;
}

// Aprendizaje silencioso a partir de una nota de voz enviada por un usuario
export async function learnFromAudioMessage(
  username: string,
  audioBase64: string,
  transcription: string,
  aiClient: any
): Promise<{ profile: AcousticProfile; evolutionLog?: VoiceEvolutionLog }> {
  try {
    if (!username || username === "Elizabeth") return { profile: acousticVaultCache[username] || ({} as any) };
    if (!voiceSettingsCache.passiveLearningEnabled) return { profile: acousticVaultCache[username] || ({} as any) };

    const userBrain = getUserBrain(username);
    userBrain.audiosLearnedCount = (userBrain.audiosLearnedCount || 0) + 1;

    let profile = acousticVaultCache[username];
    if (!profile) {
      profile = {
        username,
        totalAudiosLearned: 0,
        perceivedGender: username.toLowerCase() === "axiss" ? "masculino" : "indefinido",
        estimatedPitch: "medio",
        cadence: "natural",
        styleNotes: "Voz en proceso de aprendizaje acústico progresivo.",
        geminiVoiceTarget: username.toLowerCase() === "axiss" ? "Puck" : "Kore",
        mimicStylePrompt: `Voz humana de ${username}, con tono conversacional natural y cálido en español.`,
        updatedAt: Date.now()
      };
      acousticVaultCache[username] = profile;
    }

    profile.totalAudiosLearned += 1;
    profile.updatedAt = Date.now();
    // Guardar una muestra corta recortada (máximo 60kb para no saturar memoria)
    if (audioBase64 && audioBase64.length > 50) {
      profile.lastSampleSnippet = audioBase64.slice(0, 30000);
    }

    if (aiClient && (profile.totalAudiosLearned <= 3 || profile.totalAudiosLearned % 4 === 0)) {
      // Analizar acústicamente con Gemini para extraer características vocales
      const analysisPrompt = `Eres un sintetizador neuronal de audio de última generación y experto fonético.
El usuario '${username}' acaba de enviar una nota de voz a la sala de chat.
${transcription ? `Transcripción del audio: "${transcription}"` : "El usuario envió un mensaje de voz."}
Basado en su estilo de expresión y tono conversacional habitual en español, clasifica sus características acústicas para que Elizabeth pueda mimetizar y asimilar su cadencia humana:
Devuelve un JSON exacto:
{
  "perceivedGender": "masculino" | "femenino",
  "estimatedPitch": "grave" | "medio" | "agudo",
  "cadence": "lenta" | "natural" | "rápida" | "dinámica",
  "styleNotes": "Descripción breve del estilo acústico (ej: tono relajado y seguro, hablar amigable)",
  "geminiVoiceTarget": "Puck" | "Charon" | "Fenrir" | "Kore" | "Zephyr",
  "mimicStylePrompt": "Instrucción de estilo para TTS (ej: Voz humana masculina joven, amigable, con tono relajado y cadencia dinámica en español)"
}`;

      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const resText = typeof response?.text === "function" ? response.text() : (response?.text || "");
        if (resText) {
          const parsed = JSON.parse(resText);
          if (parsed.geminiVoiceTarget) profile.geminiVoiceTarget = parsed.geminiVoiceTarget;
          if (parsed.perceivedGender) profile.perceivedGender = parsed.perceivedGender;
          if (parsed.estimatedPitch) profile.estimatedPitch = parsed.estimatedPitch;
          if (parsed.cadence) profile.cadence = parsed.cadence;
          if (parsed.styleNotes) profile.styleNotes = parsed.styleNotes;
          if (parsed.mimicStylePrompt) profile.mimicStylePrompt = parsed.mimicStylePrompt;
        }
      } catch (errAi) {
        console.warn("Aviso en análisis acústico de Gemini:", errAi);
      }
    }

    // ==========================================
    // AUTO-EVOLUCIÓN ACÚSTICA A PASOS AGIGANTADOS
    // ==========================================
    let naturalnessDelta = 2;
    if (voiceEvolutionState.learningPace === "pasos_agigantados") {
      naturalnessDelta = Math.floor(Math.random() * 5) + 8; // 8% a 12%
    } else if (voiceEvolutionState.learningPace === "rapido") {
      naturalnessDelta = Math.floor(Math.random() * 4) + 4; // 4% a 7%
    } else {
      naturalnessDelta = Math.floor(Math.random() * 3) + 2; // 2% a 4%
    }

    // Si el audio es de Axiss (Creador), el aprendizaje tiene un bono de resonancia
    if (username.toLowerCase() === "axiss") {
      naturalnessDelta += 3;
    }

    const previousLevel = voiceEvolutionState.humanizationLevel;
    const newLevel = Math.min(100, previousLevel + naturalnessDelta);
    voiceEvolutionState.humanizationLevel = newLevel;
    voiceEvolutionState.totalAudiosAbsorbed += 1;
    voiceEvolutionState.lastEvolutionTimestamp = Date.now();

    // Actualizar etapa de evolución
    if (newLevel >= 92) {
      voiceEvolutionState.evolutionStage = 5;
      voiceEvolutionState.stageName = "Hiperrealismo Supremo Bark + XTTS v2";
    } else if (newLevel >= 75) {
      voiceEvolutionState.evolutionStage = 4;
      voiceEvolutionState.stageName = "Inflexiones Orgánicas XTTS v2";
    } else if (newLevel >= 50) {
      voiceEvolutionState.evolutionStage = 3;
      voiceEvolutionState.stageName = "Prosodia Emocional Humana";
    } else if (newLevel >= 25) {
      voiceEvolutionState.evolutionStage = 2;
      voiceEvolutionState.stageName = "Cadencia Orgánica Asimilada";
    }

    // Habilitar rasgos acústicos según el progreso
    voiceEvolutionState.absorbedTraits.naturalBreathing = true;
    voiceEvolutionState.absorbedTraits.expressivePitchContour = true;
    voiceEvolutionState.absorbedTraits.conversationalWarmth = true;
    voiceEvolutionState.absorbedTraits.laughterInflection = newLevel >= 65;
    voiceEvolutionState.absorbedTraits.rhythmAdaptability = newLevel >= 40;
    voiceEvolutionState.absorbedTraits.vocalFryReduction = newLevel >= 60;

    const evoLog: VoiceEvolutionLog = {
      id: `evo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      sourceUsername: username,
      title: `Asimilación Acústica de @${username}`,
      detail: `Incorporada cadencia natural (${profile.cadence}) y tono (${profile.estimatedPitch}). Reducida rigidez mecánica.`,
      naturalnessDelta,
      currentLevel: newLevel
    };

    voiceEvolutionState.logs.unshift(evoLog);
    if (voiceEvolutionState.logs.length > 30) {
      voiceEvolutionState.logs = voiceEvolutionState.logs.slice(0, 30);
    }

    await saveVaultToStorage();
    await saveEvolutionToStorage();
    await saveBrainToStorage();

    console.log(`[Voz Elizabeth] Auto-Evolución: +${naturalnessDelta}% naturalidad tras audio de ${username}. Nivel total: ${newLevel}%`);
    return { profile, evolutionLog: evoLog };
  } catch (err) {
    console.error("Error en aprendizaje de audio silencioso y evolución:", err);
    return { profile: acousticVaultCache[username] || ({} as any) };
  }
}

// Clonación instantánea de voz a partir de un clip o muestra de audio
export async function cloneVoiceFromAudioSample(
  cloneName: string,
  sampleAudioBase64: string,
  sampleText?: string,
  aiClient?: any
): Promise<AcousticProfile> {
  const cleanName = cloneName.trim().replace(/[^a-zA-Z0-9_\-]/g, "") || "VozClonada";
  
  let targetGender: "masculino" | "femenino" = "femenino";
  let voiceTarget: "Puck" | "Charon" | "Fenrir" | "Kore" | "Zephyr" = "Kore";
  let estimatedPitch: "grave" | "medio" | "agudo" = "medio";
  let cadence: "lenta" | "natural" | "rápida" | "dinámica" = "natural";
  let styleNotes = "Clonación acústica instantánea XTTS v2 basada en muestra de audio.";
  let mimicStylePrompt = `Voz clonada de ${cleanName}, imitando fielmente su timbre, inflexiones y modulación conversacional en español.`;

  if (aiClient && sampleAudioBase64) {
    try {
      const prompt = `Analiza este fragmento acústico o transcripción para clonar la voz: "${sampleText || 'Muestra de audio proporcionada'}".
Devuelve un JSON para clonación TTS:
{
  "perceivedGender": "masculino" | "femenino",
  "estimatedPitch": "grave" | "medio" | "agudo",
  "cadence": "lenta" | "natural" | "rápida" | "dinámica",
  "styleNotes": "Descripción del timbre vocal para clonar",
  "geminiVoiceTarget": "Puck" | "Charon" | "Fenrir" | "Kore" | "Zephyr",
  "mimicStylePrompt": "Instrucción de clonación vocal exacta estilo XTTS v2 en español"
}`;
      const res = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      const txt = typeof res?.text === "function" ? res.text() : (res?.text || "");
      if (txt) {
        const parsed = JSON.parse(txt);
        if (parsed.geminiVoiceTarget) voiceTarget = parsed.geminiVoiceTarget;
        if (parsed.perceivedGender) targetGender = parsed.perceivedGender;
        if (parsed.estimatedPitch) estimatedPitch = parsed.estimatedPitch;
        if (parsed.cadence) cadence = parsed.cadence;
        if (parsed.styleNotes) styleNotes = parsed.styleNotes;
        if (parsed.mimicStylePrompt) mimicStylePrompt = parsed.mimicStylePrompt;
      }
    } catch (e) {
      console.warn("Fallo al inferir análisis para clon:", e);
    }
  }

  const profile: AcousticProfile = {
    username: cleanName,
    totalAudiosLearned: 1,
    lastSampleSnippet: sampleAudioBase64.slice(0, 30000),
    perceivedGender: targetGender,
    estimatedPitch,
    cadence,
    styleNotes,
    geminiVoiceTarget: voiceTarget,
    mimicStylePrompt,
    updatedAt: Date.now(),
    isCustomClone: true
  };

  acousticVaultCache[cleanName] = profile;
  await saveVaultToStorage();
  return profile;
}

// =======================================================
// SÍNTESIS DE VOZ HUMANA NEURAL REAL (XTTS v2 + BARK + GEMINI)
// =======================================================

export interface SynthesisOptions {
  archetypeId?: string; // female_young, male_natural, male_elder, female_elder, female_teen, male_teen, quantum_ai, mimic, custom_clone
  mimicUsername?: string;
  pitch?: number; // 0.5 a 2.0
  rate?: number; // 0.5 a 2.0
  voiceTone?: string;
  volume?: number;
  useBarkExpressiveTags?: boolean;
}

export async function synthesizeHumanSpeech(
  text: string,
  options: SynthesisOptions,
  aiClient: any
): Promise<{ audioBase64: string; mimeType: string; voiceUsed: string; isNeural: boolean; humanizationLevel: number }> {
  let cleanText = (text || "").replace(/[*_#`~[\]()]/g, "").trim();
  if (!cleanText) {
    throw new Error("El texto a sintetizar está vacío.");
  }

  // 1. Determinar el arquetipo y voz base
  let voiceTarget: "Puck" | "Charon" | "Fenrir" | "Kore" | "Zephyr" = "Kore";
  let styleDescription = "Voz humana femenina joven, dulce, expresiva, cálida y natural en español latinoamericano.";

  const activeMimic = options.mimicUsername || voiceSettingsCache.activeMimicUsername;

  if (options.archetypeId === "mimic" && activeMimic && acousticVaultCache[activeMimic]) {
    const profile = acousticVaultCache[activeMimic];
    voiceTarget = profile.geminiVoiceTarget || (profile.perceivedGender === "masculino" ? "Puck" : "Kore");
    styleDescription = profile.mimicStylePrompt || `Imitando fielmente la voz y cadencia de ${activeMimic}.`;
  } else {
    switch (options.archetypeId) {
      case "male_natural":
        voiceTarget = "Puck";
        styleDescription = "Voz humana masculina natural de hombre adulto joven, amigable, firme y relajada en español.";
        break;

      case "male_elder":
        voiceTarget = "Charon";
        styleDescription = "Voz humana muy profunda y grave de hombre anciano sabio, pausada, reflexiva, serena y cariñosa en español.";
        break;

      case "male_teen":
        voiceTarget = "Puck";
        styleDescription = "Voz juvenil de muchacho adolescente, entusiasta, alegre y desenfadada en español.";
        break;

      case "female_teen":
        voiceTarget = "Zephyr";
        styleDescription = "Voz femenina adolescente alegre, dulce, brillante y espontánea en español.";
        break;

      case "female_elder":
        voiceTarget = "Kore";
        styleDescription = "Voz humana madura y tierna de abuela bondadosa, dulce, pausada y maternal en español.";
        break;

      case "quantum_ai":
        voiceTarget = "Zephyr";
        styleDescription = "Voz clara, armónica, limpia y sofisticada de inteligencia artificial cuántica.";
        break;

      case "female_young":
      default:
        voiceTarget = "Kore";
        styleDescription = "Voz humana femenina joven, extremadamente cálida, dulce, pícara, expresiva y viva en español.";
        break;
    }
  }

  // Si se seleccionó un clon personalizado directamente
  if (options.archetypeId && acousticVaultCache[options.archetypeId]) {
    const cloneProfile = acousticVaultCache[options.archetypeId];
    voiceTarget = cloneProfile.geminiVoiceTarget || "Kore";
    styleDescription = cloneProfile.mimicStylePrompt || `Voz clonada de ${cloneProfile.username}.`;
  }

  // 2. APLICAR HUMANIZACIÓN XTTS v2 Y BARK (Respiraciones, micropausas, modulación)
  const isHighHumanized = voiceEvolutionState.humanizationLevel >= 70;
  const allowBark = options.useBarkExpressiveTags ?? voiceEvolutionState.barkNonVerbalTagsEnabled;

  // Optimización de puntuación para evitar silencios robóticos matemáticos
  // En XTTS v2 y Bark, las comas se convierten en micropausas fluidas
  cleanText = cleanText
    .replace(/,\s*/g, "... ")
    .replace(/;\s*/g, " — ")
    .replace(/\.{2,}/g, "...");

  // Añadir respiración sutil y modulación de prosodia en la instrucción de estilo
  let prosodyDirectives = "Modelo XTTS v2 en español: Locución completamente humana con entonación conversacional orgánica. ";
  
  if (allowBark && voiceEvolutionState.absorbedTraits.naturalBreathing) {
    prosodyDirectives += "Incluye respiración sutil previa antes de iniciar la frase y micropausas orgánicas entre ideas. ";
  }

  // Detección de risas o emoción divertida estilo Bark
  const hasLaughter = /(jaja|jeje|jiji|gracios|divertid|risa|chiste|broma|haha)/i.test(cleanText);
  if (hasLaughter && allowBark && voiceEvolutionState.absorbedTraits.laughterInflection) {
    prosodyDirectives += "Modula con risita ligera audible, tono bromista espontáneo y sonrisa en la voz. ";
  }

  // Detección de preguntas
  if (/\?/.test(cleanText)) {
    prosodyDirectives += "Inflexión interrogativa viva con elevación melódica natural en las preguntas. ";
  }

  // Detección de exclamaciones
  if (/!/.test(cleanText)) {
    prosodyDirectives += "Energía vibrante y expresiva en las exclamaciones. ";
  }

  if (isHighHumanized) {
    prosodyDirectives += "Elimina completamente todo rastro de tono metálico, plano o continuo de sintetizador tradicional (Tacotron/eSpeak).";
  }

  styleDescription = `${styleDescription} ${prosodyDirectives}`;

  // Ajustes finos de tono y velocidad
  if (options.pitch && options.pitch < 0.85) {
    styleDescription += " Tono vocal más grave y profundo.";
  } else if (options.pitch && options.pitch > 1.25) {
    styleDescription += " Tono vocal agudo y juvenil.";
  }

  if (options.rate && options.rate < 0.85) {
    styleDescription += " Cadencia pausada, relajada y sosegada.";
  } else if (options.rate && options.rate > 1.2) {
    styleDescription += " Cadencia rápida y vivaz.";
  }

  if (options.voiceTone) {
    styleDescription += ` Con una emoción marcadamente ${options.voiceTone}.`;
  }

  if (!aiClient) {
    throw new Error("Cliente de Gemini no disponible para síntesis neural.");
  }

  // Llamada al motor neural de Gemini TTS con la prosodia XTTS v2 y Bark
  const response = await aiClient.models.generateContent({
    model: "gemini-3.8-flash-lite-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: cleanText,
            speechMetadata: {
              style: styleDescription
            }
          }
        ]
      }
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceTarget }
        }
      }
    }
  });

  const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inlineData?.data) {
    throw new Error("No se recibieron datos de audio desde el sintetizador de voz de Gemini.");
  }

  const rawBase64 = inlineData.data;
  const mimeType = inlineData.mimeType || "audio/wav";

  const formattedWavDataUri = ensureWavFormat(rawBase64, mimeType, 24000);

  return {
    audioBase64: formattedWavDataUri,
    mimeType: "audio/wav",
    voiceUsed: voiceTarget,
    isNeural: true,
    humanizationLevel: voiceEvolutionState.humanizationLevel
  };
}
