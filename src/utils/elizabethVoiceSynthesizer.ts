/**
 * Elizabeth & AI Voice Synthesizer Engine - Exclusivo Coqui XTTS v2
 * Genera locución hiperrealista en tiempo real sin motores robóticos locales.
 * Contiene el catálogo completo de voces oficiales de Coqui XTTS v2.
 */

export interface VoiceArchetype {
  id: string;
  name: string;
  category: 'femenina_xtts' | 'masculina_xtts' | 'espanol_xtts' | 'internacional_xtts' | 'clon_xtts';
  gender: 'female' | 'male' | 'neutral';
  pitch: number;    // 0.5 - 2.0
  rate: number;     // 0.5 - 2.0
  volume: number;   // 0.0 - 1.0
  description: string;
  speakerTag: string;
  icon: string;
  accent?: string;
}

export interface ElizabethVoiceConfig {
  archetypeId: string;
  mimicUsername?: string;
  engine: 'xtts_v2';
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

// CATÁLOGO COMPLETO DE VOCES OFICIALES COQUI XTTS v2
export const VOICE_ARCHETYPES: VoiceArchetype[] = [
  // ========================================================
  // 1. VOCES ESPAÑOL NATIVO E IBEROAMERICANAS (COQUI XTTS v2)
  // ========================================================
  {
    id: 'elizabeth_suprema',
    name: 'Elizabeth Suprema (Firma Oficial)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.05,
    rate: 1.0,
    volume: 1.0,
    description: 'Voz insignia de Elizabeth: dulce, empática, cálida, pícara y viva en español.',
    speakerTag: 'Elizabeth-Official-XTTS',
    icon: '👑',
    accent: 'Español Oficial'
  },
  {
    id: 'sofia_latina',
    name: 'Sofía (Español Nativo Dinámico)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.05,
    rate: 1.02,
    volume: 1.0,
    description: 'Español nativo: viva, cercana, alegre, muy carismática y natural.',
    speakerTag: 'Sofia Latina XTTS',
    icon: '💃',
    accent: 'Latinoamérica'
  },
  {
    id: 'valentina_dulce',
    name: 'Valentina (Español Nativo Tierno)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.06,
    rate: 0.98,
    volume: 1.0,
    description: 'Español nativo: amorosa, tierna, cálida y de trato fraternal entrañable.',
    speakerTag: 'Valentina Dulce XTTS',
    icon: '💖',
    accent: 'Hispanoamérica'
  },
  {
    id: 'camila_serena',
    name: 'Camila (Español Nativo Apacible)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
    description: 'Español nativo: pausada, tranquila, armónica y reconfortante.',
    speakerTag: 'Camila Serena XTTS',
    icon: '🍃',
    accent: 'Hispanoamérica'
  },
  {
    id: 'lucia_melodica',
    name: 'Lucía (Español Rioplatense Suave)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.03,
    rate: 1.0,
    volume: 1.0,
    description: 'Cadencia rioplatense melodiosa, fresca, dulce y espontánea.',
    speakerTag: 'Lucia Rioplatense XTTS',
    icon: '🎵',
    accent: 'Rioplatense'
  },
  {
    id: 'carmen_poetica',
    name: 'Carmen (Español Andaluz Lírico)',
    category: 'espanol_xtts',
    gender: 'female',
    pitch: 1.02,
    rate: 0.96,
    volume: 1.0,
    description: 'Cálida, lírica, poética, con inflexiones expresivas y sentidas.',
    speakerTag: 'Carmen Andaluza XTTS',
    icon: '🌹',
    accent: 'Andaluz / Lírico'
  },
  {
    id: 'mateo_entusiasta',
    name: 'Mateo (Español Nativo Vivaz)',
    category: 'espanol_xtts',
    gender: 'male',
    pitch: 0.96,
    rate: 1.04,
    volume: 1.0,
    description: 'Español nativo: enérgico, juvenil, motivador y simpático.',
    speakerTag: 'Mateo Entusiasta XTTS',
    icon: '🔥',
    accent: 'Latinoamérica'
  },
  {
    id: 'lucas_conversacional',
    name: 'Lucas (Español Nativo Cercano)',
    category: 'espanol_xtts',
    gender: 'male',
    pitch: 0.92,
    rate: 0.99,
    volume: 1.0,
    description: 'Español nativo: relajado, espontáneo, cotidiano y cercano.',
    speakerTag: 'Lucas Conversacional XTTS',
    icon: '🎙️',
    accent: 'Hispanoamérica'
  },
  {
    id: 'eugenio_reflexivo',
    name: 'Eugenio (Español Nativo Culto)',
    category: 'espanol_xtts',
    gender: 'male',
    pitch: 0.84,
    rate: 0.9,
    volume: 1.0,
    description: 'Español nativo: culto, pausado, reflexivo, claro y sosegado.',
    speakerTag: 'Eugenio Reflexivo XTTS',
    icon: '📖',
    accent: 'Castellano Culto'
  },
  {
    id: 'diego_locutor',
    name: 'Diego (Español Radiofónico Firme)',
    category: 'espanol_xtts',
    gender: 'male',
    pitch: 0.88,
    rate: 0.97,
    volume: 1.0,
    description: 'Voz de locución profunda, firme, convincente y bien modulada.',
    speakerTag: 'Diego Locutor XTTS',
    icon: '📻',
    accent: 'Locución Profesional'
  },
  {
    id: 'javier_castizo',
    name: 'Javier (Español Peninsular Castizo)',
    category: 'espanol_xtts',
    gender: 'male',
    pitch: 0.9,
    rate: 1.01,
    volume: 1.0,
    description: 'Articulación peninsular nítida, franca, directa y con presencia.',
    speakerTag: 'Javier Peninsular XTTS',
    icon: '🏰',
    accent: 'Español Peninsular'
  },

  // ========================================================
  // 2. VOCES FEMENINAS OFICIALES COQUI XTTS v2
  // ========================================================
  {
    id: 'claribel_dervla',
    name: 'Claribel Dervla (Cálida y Narrativa)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.0,
    rate: 0.98,
    volume: 1.0,
    description: 'Tono sedoso, suave y envolvente, perfecta para narración profunda y apoyo empático.',
    speakerTag: 'Claribel Dervla',
    icon: '🌸',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'daisy_studious',
    name: 'Daisy Studious (Clara y Expresiva)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.08,
    rate: 1.02,
    volume: 1.0,
    description: 'Voz joven, académica, articulada, lúcida y con inflexiones muy claras.',
    speakerTag: 'Daisy Studious',
    icon: '🎀',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'gracie_wiseman',
    name: 'Gracie Wiseman (Serena y Elegante)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.95,
    rate: 0.94,
    volume: 1.0,
    description: 'Tono maduro, calmo, reflexivo, con cadencia sosegada y distinguida.',
    speakerTag: 'Gracie Wiseman',
    icon: '💎',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'tammie_ema',
    name: 'Tammie Ema (Alegre y Juguetona)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.12,
    rate: 1.05,
    volume: 1.0,
    description: 'Expresiva, chispeante, vivaz y con risitas espontáneas naturales.',
    speakerTag: 'Tammie Ema',
    icon: '✨',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'alison_dietlinde',
    name: 'Alison Dietlinde (Cristalina y Distinguida)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.02,
    rate: 0.98,
    volume: 1.0,
    description: 'Sofisticada, cristalina, tranquila y con pronunciación impecable.',
    speakerTag: 'Alison Dietlinde',
    icon: '🕊️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'ana_florence',
    name: 'Ana Florence (Melódica y Afectuosa)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.04,
    rate: 0.99,
    volume: 1.0,
    description: 'Cálida, tierna, melódica y con entonación muy conversacional.',
    speakerTag: 'Ana Florence',
    icon: '🌷',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'annmarie_nele',
    name: 'Annmarie Nele (Juvenil y Dinámica)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.1,
    rate: 1.04,
    volume: 1.0,
    description: 'Joven, entusiasta, rápida y llena de vitalidad contemporánea.',
    speakerTag: 'Annmarie Nele',
    icon: '⭐',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'asya_anara',
    name: 'Asya Anara (Suave y Reconfortante)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.98,
    rate: 0.92,
    volume: 1.0,
    description: 'Susurrada, dulce, tersa, pacífica e ideal para relajación y confidencias.',
    speakerTag: 'Asya Anara',
    icon: '🌙',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'brenda_stern',
    name: 'Brenda Stern (Segura y Decidida)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.96,
    rate: 1.0,
    volume: 1.0,
    description: 'Firme, asertiva, ejecutiva y con gran presencia vocal y autoridad.',
    speakerTag: 'Brenda Stern',
    icon: '💼',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'gitta_nikolina',
    name: 'Gitta Nikolina (Artística y Vibrante)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.06,
    rate: 1.01,
    volume: 1.0,
    description: 'Artística, apasionada, melodiosa y con rica resonancia armónica.',
    speakerTag: 'Gitta Nikolina',
    icon: '🎭',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'henriette_usha',
    name: 'Henriette Usha (Profunda y Refinada)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.92,
    rate: 0.92,
    volume: 1.0,
    description: 'Noble, solemne, profunda y con textura elegante.',
    speakerTag: 'Henriette Usha',
    icon: '🏛️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'sofia_hellen',
    name: 'Sofia Hellen (Nórdica Luminosa)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.04,
    rate: 1.0,
    volume: 1.0,
    description: 'Brillante, cristalina, modulada y con aire nórdico sereno.',
    speakerTag: 'Sofia Hellen',
    icon: '❄️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'suvi_tausku',
    name: 'Suvi Tausku (Vivaz y Espontánea)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.07,
    rate: 1.03,
    volume: 1.0,
    description: 'Ágil, fresca, espontánea y con cadencia rítmica limpia.',
    speakerTag: 'Suvi Tausku',
    icon: '🌿',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'nova_hogarth',
    name: 'Nova Hogarth (Vanguardista y Moderna)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.05,
    rate: 1.02,
    volume: 1.0,
    description: 'Moderna, futurista, inteligente y con timbre distintivo.',
    speakerTag: 'Nova Hogarth',
    icon: '🔮',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'maja_ruoho',
    name: 'Maja Ruoho (Pausada y Calma)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.96,
    rate: 0.94,
    volume: 1.0,
    description: 'Pausada, envolvente, con resonancia equilibrada y tranquila.',
    speakerTag: 'Maja Ruoho',
    icon: '🌊',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'uta_objen',
    name: 'Uta Objen (Sosegada y Armoniosa)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.98,
    rate: 0.95,
    volume: 1.0,
    description: 'Dulce, sosegada, armoniosa y de escucha placentera.',
    speakerTag: 'Uta Objen',
    icon: '🌾',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'lidia_deniza',
    name: 'Lidia Deniza (Mediterránea Cálida)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.02,
    rate: 0.98,
    volume: 1.0,
    description: 'Rica en armónicos, cálida, expresiva y reconfortante.',
    speakerTag: 'Lidia Deniza',
    icon: '☀️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'charelle_behnke',
    name: 'Charelle Behnke (Conversacional Fluida)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.04,
    rate: 1.02,
    volume: 1.0,
    description: 'Espontánea, coloquial, amigable y muy fluida.',
    speakerTag: 'Charelle Behnke',
    icon: '💬',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'claudette_michaud',
    name: 'Claudette Michaud (Parisina Elegante)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 0.99,
    rate: 0.95,
    volume: 1.0,
    description: 'Elegante, delicada, cadenciosa y refinada.',
    speakerTag: 'Claudette Michaud',
    icon: '🗼',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'imelda_santos',
    name: 'Imelda Santos (Afectuosa y Melódica)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.03,
    rate: 0.99,
    volume: 1.0,
    description: 'Trato fraterno, calidez envolvente y timbre dulce.',
    speakerTag: 'Imelda Santos',
    icon: '🌺',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'szilvia_vadasz',
    name: 'Szilvia Vadasz (Articulada y Nítida)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.01,
    rate: 0.98,
    volume: 1.0,
    description: 'Precisa, lúcida, con entonación musical armónica.',
    speakerTag: 'Szilvia Vadasz',
    icon: '🎻',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'danielle_bosco',
    name: 'Danielle Bosco (Vivaz y Brillante)',
    category: 'femenina_xtts',
    gender: 'female',
    pitch: 1.06,
    rate: 1.03,
    volume: 1.0,
    description: 'Cadencia rítmica viva, expresiva, brillante y jovial.',
    speakerTag: 'Danielle Bosco',
    icon: '✨',
    accent: 'Oficial XTTS v2'
  },

  // ========================================================
  // 3. VOCES MASCULINAS OFICIALES COQUI XTTS v2
  // ========================================================
  {
    id: 'damian_black',
    name: 'Damian Black (Profunda y Cinematográfica)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.85,
    rate: 0.95,
    volume: 1.0,
    description: 'Profunda, cinematográfica, segura, magnética y con gran presencia.',
    speakerTag: 'Damian Black',
    icon: '🎬',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'craig_gutsy',
    name: 'Craig Gutsy (Enérgico y Audaz)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.95,
    rate: 1.02,
    volume: 1.0,
    description: 'Joven, animado, enérgico, audaz y carismático.',
    speakerTag: 'Craig Gutsy',
    icon: '⚡',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'viktor_einar',
    name: 'Viktor Einar (Elegante y Profesional)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.9,
    rate: 0.97,
    volume: 1.0,
    description: 'Elegante, europea, profesional, sobria y articulada.',
    speakerTag: 'Viktor Einar',
    icon: '🎩',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'andrew_chipper',
    name: 'Andrew Chipper (Conversacional y Amigable)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.98,
    rate: 1.02,
    volume: 1.0,
    description: 'Alegre, conversacional, amigable, cálido y espontáneo.',
    speakerTag: 'Andrew Chipper',
    icon: '☕',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'badr_odhiambo',
    name: 'Badr Odhiambo (Resonante y Confiable)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.88,
    rate: 0.95,
    volume: 1.0,
    description: 'Resonante, grave, firme, confiable y serena.',
    speakerTag: 'Badr Odhiambo',
    icon: '🛡️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'dionisio_schuyler',
    name: 'Dionisio Schuyler (Reflexiva y Serena)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.82,
    rate: 0.88,
    volume: 1.0,
    description: 'Profunda, sosegada, reflexiva, sabia y calmada.',
    speakerTag: 'Dionisio Schuyler',
    icon: '📜',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'royston_min',
    name: 'Royston Min (Moderna y Fresca)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 1.0,
    rate: 1.04,
    volume: 1.0,
    description: 'Moderna, juvenil, fresca, dinámica y natural.',
    speakerTag: 'Royston Min',
    icon: '🎧',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'baldur_sanjin',
    name: 'Baldur Sanjin (Sólida y Firme)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.86,
    rate: 0.92,
    volume: 1.0,
    description: 'Grave, sólida, pausada, firme y con gran empaque.',
    speakerTag: 'Baldur Sanjin',
    icon: '🏔️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'torsten_traugott',
    name: 'Torsten Traugott (Autoridad Sobria)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.84,
    rate: 0.92,
    volume: 1.0,
    description: 'Madura, sobria, con autoridad calmada y firmeza.',
    speakerTag: 'Torsten Traugott',
    icon: '⚖️',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'renato_marie',
    name: 'Renato Marie (Melódica y Expresiva)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.93,
    rate: 0.98,
    volume: 1.0,
    description: 'Resonancia italiana cálida, melódica y elocuente.',
    speakerTag: 'Renato Marie',
    icon: '🎻',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'zacharie_aimios',
    name: 'Zacharie Aimios (Narrador Envolvente)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.89,
    rate: 0.94,
    volume: 1.0,
    description: 'Narrativa, empática, suave y con gran profundidad comunicativa.',
    speakerTag: 'Zacharie Aimios',
    icon: '📖',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'willem_driesen',
    name: 'Willem Driesen (Clara y Cercana)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.94,
    rate: 1.02,
    volume: 1.0,
    description: 'Desenfadada, directa, optimista y cordial.',
    speakerTag: 'Willem Driesen',
    icon: '🚲',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'abramo_gaspari',
    name: 'Abramo Gaspari (Rica y Teatral)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.86,
    rate: 0.93,
    volume: 1.0,
    description: 'Barítono resonante, elocuente y con matices teatrales.',
    speakerTag: 'Abramo Gaspari',
    icon: '🎭',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'ilmar_kallas',
    name: 'Ilmar Kallas (Analítica y Sobria)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.87,
    rate: 0.93,
    volume: 1.0,
    description: 'Pausada, precisa, metódica y sosegada.',
    speakerTag: 'Ilmar Kallas',
    icon: '🧭',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'eerik_vesterinen',
    name: 'Eerik Vesterinen (Estable y Seria)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.85,
    rate: 0.91,
    volume: 1.0,
    description: 'Grave, sólida, apacible y de gran serenidad.',
    speakerTag: 'Eerik Vesterinen',
    icon: '🌲',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'tamas_nyilas',
    name: 'Tamas Nyilas (Dinámica y Asertiva)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.95,
    rate: 1.01,
    volume: 1.0,
    description: 'Enfática, segura, dinámica y resuelta.',
    speakerTag: 'Tamas Nyilas',
    icon: '🚀',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'jan_kolar',
    name: 'Jan Kolar (Franca y Directa)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.92,
    rate: 0.99,
    volume: 1.0,
    description: 'Directa, afable, cotidiana y con dicción cristalina.',
    speakerTag: 'Jan Kolar',
    icon: '🎯',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'ludvig_skov',
    name: 'Ludvig Skov (Joven y Despierta)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.98,
    rate: 1.03,
    volume: 1.0,
    description: 'Juvenil, atenta, ágil y participativa.',
    speakerTag: 'Ludvig Skov',
    icon: '💡',
    accent: 'Oficial XTTS v2'
  },
  {
    id: 'chidubem_odo',
    name: 'Chidubem Odo (Cálido Barítono)',
    category: 'masculina_xtts',
    gender: 'male',
    pitch: 0.84,
    rate: 0.94,
    volume: 1.0,
    description: 'Grave, cálida, entrañable y con hermosa resonancia.',
    speakerTag: 'Chidubem Odo',
    icon: '🌍',
    accent: 'Oficial XTTS v2'
  },

  // ========================================================
  // 4. CLONACIÓN ZERO-SHOT Y MÍMICA
  // ========================================================
  {
    id: 'mimic',
    name: 'Mímica / Clon Zero-Shot',
    category: 'clon_xtts',
    gender: 'neutral',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    description: 'Clona e imita en tiempo real la voz aprendida de cualquier usuario o archivo con XTTS v2.',
    speakerTag: 'User-ZeroShot-Clone',
    icon: '🧬',
    accent: 'Zero-Shot XTTS v2'
  }
];

export const DEFAULT_ELIZABETH_VOICE: ElizabethVoiceConfig = {
  archetypeId: 'elizabeth_suprema',
  mimicUsername: '',
  engine: 'xtts_v2',
  pitch: 1.05,
  rate: 1.0,
  volume: 1.0,
  voiceURI: '',
  autoPlay: false,
  voiceTone: 'calida',
  useBarkExpressiveTags: true,
  useXttsProsody: true
};

const STORAGE_KEY = 'chatliz_elizabeth_voice_config_v4';

// Mapeo automático de IDs antiguos robóticos o legados a las nuevas voces oficiales XTTS v2
function normalizeArchetypeId(id: string): string {
  if (!id) return 'elizabeth_suprema';
  const legacyMap: Record<string, string> = {
    // Voces robóticas eliminadas
    femenino: 'elizabeth_suprema',
    masculino: 'lucas_conversacional',
    anciano: 'dionisio_schuyler',
    female: 'elizabeth_suprema',
    male: 'lucas_conversacional',
    elder: 'dionisio_schuyler',
    female_young: 'elizabeth_suprema',
    female_teen: 'annmarie_nele',
    female_elder: 'gracie_wiseman',
    male_natural: 'lucas_conversacional',
    male_teen: 'craig_gutsy',
    male_elder: 'dionisio_schuyler',
    quantum_ai: 'alison_dietlinde',
    browser_speech: 'elizabeth_suprema',
    browser: 'elizabeth_suprema',
    custom: 'elizabeth_suprema'
  };
  return legacyMap[id] || id;
}

export function getSavedElizabethVoiceConfig(): ElizabethVoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_ELIZABETH_VOICE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('chatliz_elizabeth_voice_config_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      const archetypeId = normalizeArchetypeId(parsed.archetypeId || 'elizabeth_suprema');
      return {
        ...DEFAULT_ELIZABETH_VOICE,
        ...parsed,
        archetypeId,
        engine: 'xtts_v2', // Exclusivo XTTS v2
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
  const archetypeId = config.archetypeId ? normalizeArchetypeId(config.archetypeId) : current.archetypeId;
  const updated: ElizabethVoiceConfig = {
    ...current,
    ...config,
    archetypeId,
    engine: 'xtts_v2' // Siempre XTTS v2
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

// Catálogo de Avatares Visuales HD para cada Voz de Coqui XTTS v2
export const VOICE_AVATARS: Record<string, string> = {
  elizabeth_suprema: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  sofia_latina: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80",
  valentina_dulce: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80",
  camila_serena: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80",
  lucia_melodica: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80",
  carmen_poetica: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=240&auto=format&fit=crop&q=80",
  mateo_entusiasta: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
  lucas_conversacional: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  eugenio_reflexivo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  diego_locutor: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80",
  javier_castizo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
  claribel_dervla: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
  daisy_studious: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
  gracie_wiseman: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=240&auto=format&fit=crop&q=80",
  tammie_ema: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=240&auto=format&fit=crop&q=80",
  alison_dietlinde: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=240&auto=format&fit=crop&q=80",
  ana_florence: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=240&auto=format&fit=crop&q=80",
  annmarie_nele: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=240&auto=format&fit=crop&q=80",
  asya_anara: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=240&auto=format&fit=crop&q=80",
  brenda_stern: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=240&auto=format&fit=crop&q=80",
  gitta_nikolina: "https://images.unsplash.com/photo-1534751516642-a1714f57a3e7?w=240&auto=format&fit=crop&q=80",
  henriette_usha: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80",
  sofia_hellen: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80",
  suvi_tausku: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=240&auto=format&fit=crop&q=80",
  nova_hogarth: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&auto=format&fit=crop&q=80",
  maja_ruoho: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=240&auto=format&fit=crop&q=80",
  uta_objen: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=240&auto=format&fit=crop&q=80",
  lidia_deniza: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80",
  charelle_behnke: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80",
  claudette_michaud: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80",
  imelda_santos: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=240&auto=format&fit=crop&q=80",
  szilvia_vadasz: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=240&auto=format&fit=crop&q=80",
  danielle_bosco: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  damian_black: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
  craig_gutsy: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
  viktor_einar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  andrew_chipper: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
  badr_odhiambo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  dionisio_schuyler: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
  royston_min: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
  baldur_sanjin: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
  torsten_traugott: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80",
  renato_marie: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  zacharie_aimios: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
  willem_driesen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  abramo_gaspari: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
  ilmar_kallas: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80",
  eerik_vesterinen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  tamas_nyilas: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80",
  jan_kolar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80",
  ludvig_skov: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
  chidubem_odo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80",
  mimic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80"
};

export function getVoiceAvatarUrl(archOrId: VoiceArchetype | string): string {
  const id = typeof archOrId === 'string' ? archOrId : archOrId.id;
  if (VOICE_AVATARS[id]) return VOICE_AVATARS[id];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;
}

export function getVoiceSamplePhrase(arch: VoiceArchetype): string {
  return `¡Hola! Soy ${arch.name}. Mi locución funciona con el motor Coqui XTTS v2 de estudio, con acento ${arch.accent || 'oficial'} y tono completamente humano.`;
}

// Stub para compatibilidad hacia atrás
export async function getSystemVoices(): Promise<any[]> {
  return [];
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

let activeAudioElement: HTMLAudioElement | null = null;
let currentSpeakingCallbacks: { onStart?: () => void; onEnd?: () => void; onError?: (err?: any) => void; } | null = null;

export function stopSpeaking(): void {
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

  if (currentSpeakingCallbacks?.onEnd) {
    currentSpeakingCallbacks.onEnd();
  }

  currentSpeakingCallbacks = null;
}

export function isSpeaking(): boolean {
  return !!(activeAudioElement && !activeAudioElement.paused);
}

/**
 * Función Principal para hablar un mensaje de Elizabeth:
 * 1. Invoca el motor Coqui XTTS v2 a través de /api/ai/synthesize_voice o /api/ai/xtts/synthesize
 * 2. Reproduce audio WAV cristalino de 24kHz con la voz oficial de XTTS v2 seleccionada.
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
    ...configOverride,
    engine: 'xtts_v2'
  };

  currentSpeakingCallbacks = callbacks || null;

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
        useBarkExpressiveTags: config.useBarkExpressiveTags ?? true,
        useXttsProsody: config.useXttsProsody ?? true
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
        console.error("Error en reproducción de audio XTTS v2:", err);
        activeAudioElement = null;
        callbacks?.onError?.(err);
      };

      activeAudioElement = audio;
      await audio.play();
      return true;
    } else {
      console.error("API de voz XTTS v2 devolvió error:", data?.error);
      callbacks?.onError?.(data?.error);
      return false;
    }
  } catch (err) {
    console.error("Fallo al conectar con endpoint de voz XTTS v2:", err);
    callbacks?.onError?.(err);
    return false;
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
 * Provocar salto evolutivo instantáneo
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
  return new Promise(async (resolve, reject) => {
    if (socket && socket.connected) {
      socket.emit("clone_voice_from_sample", { cloneName, sampleAudioBase64, sampleText }, (res: any) => {
        if (res?.success) return resolve(res);
        cloneVoiceWithXttsApi(cloneName, sampleAudioBase64, sampleText).then(resolve).catch(reject);
      });
      return;
    }

    try {
      const res = await cloneVoiceWithXttsApi(cloneName, sampleAudioBase64, sampleText);
      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Utility para procesar síntesis directa con Coqui XTTS v2
 */
export async function synthesizeVoiceWithXTTS(
  text: string,
  options?: {
    archetypeId?: string;
    mimicUsername?: string;
    speakerAudioBase64?: string;
    language?: string;
    pitch?: number;
    rate?: number;
    speed?: number;
    voiceTone?: string;
    useBarkExpressiveTags?: boolean;
    useXttsProsody?: boolean;
  }
): Promise<{ success: boolean; audioBase64?: string; engine?: string; durationSeconds?: number; error?: string }> {
  try {
    const res = await fetch("/api/ai/xtts/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        archetypeId: options?.archetypeId,
        mimicUsername: options?.mimicUsername,
        speakerAudioBase64: options?.speakerAudioBase64,
        language: options?.language || "es",
        pitch: options?.pitch,
        rate: options?.rate,
        speed: options?.speed,
        voiceTone: options?.voiceTone,
        useBarkExpressiveTags: options?.useBarkExpressiveTags ?? true,
        useXttsProsody: options?.useXttsProsody ?? true
      })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al procesar audio en XTTS v2" };
  }
}

/**
 * Utility para clonar voz directamente mediante el endpoint REST de XTTS v2
 */
export async function cloneVoiceWithXttsApi(
  cloneName: string,
  sampleAudioBase64: string,
  sampleText?: string
): Promise<any> {
  const res = await fetch("/api/ai/xtts/clone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cloneName, sampleAudioBase64, sampleText })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Fallo en clonación con XTTS v2");
  }
  return data;
}

/**
 * Utility para consultar el estado del motor Coqui XTTS v2
 */
export async function fetchXttsStatus(): Promise<any> {
  try {
    const res = await fetch("/api/ai/xtts/status");
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
