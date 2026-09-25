import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  CheckCircle,
  Key,
  Zap,
  Eye,
  EyeOff,
  Radio,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  Sliders,
  Play,
  Square,
  Brain,
  Dna,
  Plus,
  User,
  Check,
  MessageSquare,
  Upload,
  Wind,
  Smile,
  Flame,
  ArrowUpRight,
  Search
} from 'lucide-react';
import { socket } from '../socket';
import {
  VOICE_ARCHETYPES,
  VoiceArchetype,
  ElizabethVoiceConfig,
  getSavedElizabethVoiceConfig,
  saveElizabethVoiceConfig,
  speakElizabethMessage,
  stopSpeaking,
  isSpeaking,
  VoiceEvolutionState,
  VoiceEvolutionLog,
  requestInstantEvolutionLeap,
  requestVoiceCloneFromSample,
  getVoiceAvatarUrl,
  getVoiceSamplePhrase
} from '../utils/elizabethVoiceSynthesizer';

interface AdminConfigAiModalProps {
  aiUsername: string;
  setAdminConfigAiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiProfileForm: {
    profilePic: string;
    statusMessage: string;
    systemInstruction?: string;
    username?: string;
    bubbleColor?: string;
    bubbleBorder?: string;
    bubbleShape?: string;
    bubbleTexture?: string;
    voiceConfig?: ElizabethVoiceConfig;
  };
  setAiProfileForm: React.Dispatch<React.SetStateAction<any>>;
}

export function AdminConfigAiModal({ setAdminConfigAiOpen, aiProfileForm, setAiProfileForm, aiUsername }: AdminConfigAiModalProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'profile' | 'voice' | 'mimic' | 'memories' | 'dj'>('tokens');
  const [successMsg, setSuccessMsg] = useState('');

  // Tokens & API configuration state
  const [groqBackupName, setGroqBackupName] = useState('ChatLiz-Groq-Backup');
  const [groqBackupKey, setGroqBackupKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'groq'>('gemini');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [savingTokens, setSavingTokens] = useState(false);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; msg: string } | null>(null);
  const [activeProviderName, setActiveProviderName] = useState<string>('gemini');
  const [providerStatusInfo, setProviderStatusInfo] = useState<any>(null);

  // Voice configuration state (Exclusivo Coqui XTTS v2)
  const [voiceConfig, setVoiceConfig] = useState<ElizabethVoiceConfig>(() => {
    return (aiProfileForm as any)?.voiceConfig || getSavedElizabethVoiceConfig();
  });
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [testPhrase, setTestPhrase] = useState('¡Hola Axiss! Esta es mi voz humana real generada con síntesis neural de estudio.');

  // Mimic & Passive Acoustic Learning state
  const [acousticVault, setAcousticVault] = useState<Record<string, any>>({});
  const [voiceLearningSettings, setVoiceLearningSettings] = useState<any>({
    passiveLearningEnabled: true,
    activeMimicUsername: '',
    mimicModeEnabled: false,
    totalLearnedAudios: 0
  });
  const [loadingVault, setLoadingVault] = useState(false);

  // XTTS v2 & Bark Auto-Evolution State
  const [voiceEvolution, setVoiceEvolution] = useState<VoiceEvolutionState>({
    humanizationLevel: 85,
    evolutionStage: 4,
    stageName: "Inflexiones Orgánicas XTTS v2",
    totalAudiosAbsorbed: 16,
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
    logs: []
  });
  const [isLeaping, setIsLeaping] = useState(false);
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<'todas' | 'femenina_xtts' | 'masculina_xtts' | 'espanol_xtts' | 'clon_xtts'>('todas');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // Voice Cloning Studio State (XTTS v2)
  const [cloneName, setCloneName] = useState('');
  const [cloneAudioBase64, setCloneAudioBase64] = useState('');
  const [cloneSampleText, setCloneSampleText] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [isRecordingClone, setIsRecordingClone] = useState(false);
  const cloneMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cloneChunksRef = useRef<Blob[]>([]);

  // Memories State
  const [allBrains, setAllBrains] = useState<Record<string, any>>({});
  const [selectedUserForMemories, setSelectedUserForMemories] = useState<string>('Axiss');
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [newMemoryFact, setNewMemoryFact] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<'gustos' | 'personal' | 'anecdotas' | 'emociones'>('personal');
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    socket.emit("get_ai_api_config", (res: any) => {
      if (res?.success && res.config) {
        if (res.config.groqBackupName) setGroqBackupName(res.config.groqBackupName);
        if (res.config.groqBackupKey) setGroqBackupKey(res.config.groqBackupKey);
        if (res.config.geminiKey) setGeminiKey(res.config.geminiKey);
        if (res.config.preferredProvider) setPreferredProvider(res.config.preferredProvider);
        if (res.config.activeProvider) setActiveProviderName(res.config.activeProvider);
        if (res.config.providerStatus) setProviderStatusInfo(res.config.providerStatus);
      }
    });
  }, []);

  const fetchAcousticVault = () => {
    setLoadingVault(true);
    socket.emit("get_voice_learning_vault", (res: any) => {
      setLoadingVault(false);
      if (res?.success) {
        if (res.vault) setAcousticVault(res.vault);
        if (res.settings) setVoiceLearningSettings(res.settings);
      }
    });
  };

  const fetchVoiceEvolution = () => {
    socket.emit("get_voice_evolution_status", (res: any) => {
      if (res?.success) {
        if (res.evolution) setVoiceEvolution(res.evolution);
        if (res.vault) setAcousticVault(res.vault);
        if (res.settings) setVoiceLearningSettings(res.settings);
      }
    });
  };

  const fetchAllMemories = () => {
    setLoadingMemories(true);
    socket.emit("get_all_elizabeth_memories", (res: any) => {
      setLoadingMemories(false);
      if (res?.success && res.brains) {
        setAllBrains(res.brains);
        const users = Object.keys(res.brains);
        if (users.length > 0 && !res.brains[selectedUserForMemories]) {
          setSelectedUserForMemories(users[0]);
        }
      }
    });
  };

  // Escuchar eventos en vivo de auto-evolución acústica
  useEffect(() => {
    const handleVoiceEvolved = (data: { state: VoiceEvolutionState; log?: VoiceEvolutionLog }) => {
      if (data?.state) {
        setVoiceEvolution(data.state);
      }
      if (data?.log) {
        setSuccessMsg(`🚀 ¡Evolución Acústica! +${data.log.naturalnessDelta}% naturalidad asimilada de @${data.log.sourceUsername}`);
      }
    };

    socket.on("elizabeth_voice_evolved", handleVoiceEvolved);
    return () => {
      socket.off("elizabeth_voice_evolved", handleVoiceEvolved);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'mimic') {
      fetchAcousticVault();
      fetchVoiceEvolution();
    } else if (activeTab === 'voice') {
      fetchVoiceEvolution();
    } else if (activeTab === 'memories') {
      fetchAllMemories();
    }
  }, [activeTab]);

  useEffect(() => {
     if (successMsg) {
        const timer = setTimeout(() => {
           setSuccessMsg('');
        }, 3500);
        return () => clearTimeout(timer);
     }
  }, [successMsg]);

  const handleTestToken = (provider: 'groq' | 'gemini') => {
    if (provider === 'groq') setTestingGroq(true);
    if (provider === 'gemini') setTestingGemini(true);
    setTestResult(null);

    socket.emit("test_ai_token", {
      provider,
      token: provider === 'groq' ? groqBackupKey : geminiKey
    }, (res: any) => {
      if (provider === 'groq') setTestingGroq(false);
      if (provider === 'gemini') setTestingGemini(false);
      if (res?.success) {
        setTestResult({ provider, success: true, msg: res.message });
      } else {
        setTestResult({ provider, success: false, msg: res?.error || "Fallo en la prueba de conexión" });
      }
    });
  };

  const handleSaveApiTokens = () => {
    setSavingTokens(true);
    socket.emit("update_ai_api_config", {
      groqBackupName: groqBackupName.trim(),
      groqBackupKey: groqBackupKey.trim(),
      geminiKey: geminiKey.trim(),
      preferredProvider
    }, (res: any) => {
      setSavingTokens(false);
      if (res?.success) {
        setSuccessMsg(res.message || "¡Tokens y configuración de IA guardados exitosamente!");
        if (res.config?.activeProvider) setActiveProviderName(res.config.activeProvider);
      } else {
        alert("Error al guardar: " + (res?.error || "Error desconocido"));
      }
    });
  };

  const handleTogglePassiveLearning = () => {
    const nextState = !voiceLearningSettings.passiveLearningEnabled;
    socket.emit("update_voice_learning_settings", {
      passiveLearningEnabled: nextState
    }, (res: any) => {
      if (res?.success && res.settings) {
        setVoiceLearningSettings(res.settings);
        setSuccessMsg(nextState
          ? "Aprendizaje pasivo activado: Elizabeth aprenderá silenciosamente de cada audio."
          : "Aprendizaje pasivo pausado.");
      }
    });
  };

  const handleSetMimicUser = (username: string) => {
    socket.emit("update_voice_learning_settings", {
      activeMimicUsername: username,
      mimicModeEnabled: true
    }, (res: any) => {
      if (res?.success && res.settings) {
        setVoiceLearningSettings(res.settings);
        setVoiceConfig(prev => ({
          ...prev,
          archetypeId: 'mimic',
          mimicUsername: username
        }));
        saveElizabethVoiceConfig({
          archetypeId: 'mimic',
          mimicUsername: username
        });
        setSuccessMsg(`¡Modo Mímica activado! Elizabeth ahora imitará a @${username}.`);
      }
    });
  };

  const handleInstantLeap = (bonus = 15) => {
    setIsLeaping(true);
    requestInstantEvolutionLeap(socket, bonus, "Salto cuántico inducido por Axiss")
      .then((res) => {
        setIsLeaping(false);
        if (res?.state) setVoiceEvolution(res.state);
        setSuccessMsg(`⚡ ¡Salto Cuántico! Nivel de humanización: ${res?.state?.humanizationLevel || 90}% (${res?.state?.stageName || 'XTTS v2'})`);
      })
      .catch((err) => {
        setIsLeaping(false);
        alert("Error en salto evolutivo: " + err.message);
      });
  };

  const handleChangePace = (pace: 'normal' | 'rapido' | 'pasos_agigantados') => {
    socket.emit("update_voice_evolution_settings", { learningPace: pace }, (res: any) => {
      if (res?.success && res.settings) {
        setVoiceEvolution(prev => ({ ...prev, learningPace: pace }));
        setSuccessMsg(`Ritmo de auto-evolución ajustado a: ${pace === 'pasos_agigantados' ? 'A Pasos Agigantados 🚀' : pace === 'rapido' ? 'Rápido ⚡' : 'Normal 🌿'}`);
      }
    });
  };

  const handleToggleBarkTags = () => {
    const nextVal = !voiceEvolution.barkNonVerbalTagsEnabled;
    socket.emit("update_voice_evolution_settings", { barkNonVerbalTagsEnabled: nextVal }, (res: any) => {
      if (res?.success) {
        setVoiceEvolution(prev => ({ ...prev, barkNonVerbalTagsEnabled: nextVal }));
        setVoiceConfig(prev => ({ ...prev, useBarkExpressiveTags: nextVal }));
        saveElizabethVoiceConfig({ useBarkExpressiveTags: nextVal });
        setSuccessMsg(nextVal ? "Inflexiones Bark activadas (respiración y risas espontáneas)." : "Inflexiones Bark pausadas.");
      }
    });
  };

  const handleToggleXttsProsody = () => {
    const nextVal = !voiceEvolution.xttsProsodyEnabled;
    socket.emit("update_voice_evolution_settings", { xttsProsodyEnabled: nextVal }, (res: any) => {
      if (res?.success) {
        setVoiceEvolution(prev => ({ ...prev, xttsProsodyEnabled: nextVal }));
        setVoiceConfig(prev => ({ ...prev, useXttsProsody: nextVal }));
        saveElizabethVoiceConfig({ useXttsProsody: nextVal });
        setSuccessMsg(nextVal ? "Prosodia XTTS v2 activada (micropausas dinámicas)." : "Prosodia XTTS v2 pausada.");
      }
    });
  };

  const handleFileUploadClone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("El archivo de audio no debe exceder 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCloneAudioBase64(base64);
      if (!cloneName) {
        const clean = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
        setCloneName(clean);
      }
      setSuccessMsg("Muestra de audio cargada para clonación.");
    };
    reader.readAsDataURL(file);
  };

  const handleToggleRecordClone = async () => {
    if (isRecordingClone) {
      if (cloneMediaRecorderRef.current && cloneMediaRecorderRef.current.state === "recording") {
        cloneMediaRecorderRef.current.stop();
      }
      setIsRecordingClone(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        cloneChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) cloneChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(cloneChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setCloneAudioBase64(reader.result as string);
            setSuccessMsg("Grabación capturada lista para clonar.");
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        cloneMediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecordingClone(true);
      } catch (err) {
        console.error("Error al grabar para clonación:", err);
        alert("No se pudo acceder al micrófono para grabar la muestra.");
      }
    }
  };

  const handleCloneVoice = () => {
    const name = cloneName.trim();
    if (!name) {
      alert("Por favor ingresa un nombre para la voz clonada (ej: 'Axiss' o 'Voz Joven').");
      return;
    }
    if (!cloneAudioBase64) {
      alert("Por favor sube o graba un audio de muestra.");
      return;
    }
    setIsCloning(true);
    requestVoiceCloneFromSample(socket, name, cloneAudioBase64, cloneSampleText)
      .then((res) => {
        setIsCloning(false);
        if (res?.success) {
          fetchAcousticVault();
          fetchVoiceEvolution();
          setCloneAudioBase64('');
          setCloneSampleText('');
          setSuccessMsg(`🎉 ¡Voz de "${name}" clonada exitosamente con motor XTTS v2!`);
        } else {
          alert("Error al clonar voz: " + (res?.error || "Error desconocido"));
        }
      })
      .catch((err) => {
        setIsCloning(false);
        alert("Fallo al clonar voz: " + err.message);
      });
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryFact.trim() || !selectedUserForMemories) return;
    setIsAddingMemory(true);
    socket.emit("add_elizabeth_memory", {
      username: selectedUserForMemories,
      fact: newMemoryFact.trim(),
      category: newMemoryCategory,
      confidence: "alta"
    }, (res: any) => {
      setIsAddingMemory(false);
      if (res?.success) {
        setNewMemoryFact('');
        fetchAllMemories();
        setSuccessMsg(`Recuerdo añadido al cerebro de Elizabeth para @${selectedUserForMemories}`);
      } else {
        alert("Error al guardar recuerdo: " + (res?.error || "Error"));
      }
    });
  };

  const handleDeleteMemory = (memoryId: string) => {
    socket.emit("delete_elizabeth_memory", {
      username: selectedUserForMemories,
      memoryId
    }, (res: any) => {
      if (res?.success) {
        fetchAllMemories();
        setSuccessMsg("Recuerdo eliminado del banco de memoria.");
      }
    });
  };

  const handleClearUserMemories = () => {
    if (!confirm(`¿Estás seguro de reiniciar todos los recuerdos de @${selectedUserForMemories}?`)) return;
    socket.emit("clear_user_memories", {
      username: selectedUserForMemories
    }, (res: any) => {
      if (res?.success) {
        fetchAllMemories();
        setSuccessMsg(`Memoria de @${selectedUserForMemories} reiniciada.`);
      }
    });
  };

  const handleTestVoiceSpeech = (phraseOverride?: string) => {
    if (isPlayingVoice) {
      stopSpeaking();
      setIsPlayingVoice(false);
      setPreviewingVoiceId(null);
      return;
    }
    const phrase = phraseOverride || testPhrase;
    setIsPlayingVoice(true);
    speakElizabethMessage(phrase, voiceConfig, {
      onStart: () => setIsPlayingVoice(true),
      onEnd: () => {
        setIsPlayingVoice(false);
        setPreviewingVoiceId(null);
      },
      onError: (err) => {
        setIsPlayingVoice(false);
        setPreviewingVoiceId(null);
        console.warn("Speech error:", err);
      }
    });
  };

  const handleTestSpecificVoice = (archetypeId: string, phraseOverride?: string) => {
    if (isPlayingVoice && previewingVoiceId === archetypeId) {
      stopSpeaking();
      setIsPlayingVoice(false);
      setPreviewingVoiceId(null);
      return;
    }
    stopSpeaking();
    const speaker = VOICE_ARCHETYPES.find(a => a.id === archetypeId);
    const phrase = phraseOverride || (speaker ? getVoiceSamplePhrase(speaker) : `Hola, soy Elizabeth con locución de estudio Coqui XTTS v2.`);
    setIsPlayingVoice(true);
    setPreviewingVoiceId(archetypeId);
    speakElizabethMessage(phrase, { ...voiceConfig, archetypeId, engine: 'xtts_v2' }, {
      onStart: () => setIsPlayingVoice(true),
      onEnd: () => {
        setIsPlayingVoice(false);
        setPreviewingVoiceId(null);
      },
      onError: (err) => {
        setIsPlayingVoice(false);
        setPreviewingVoiceId(null);
        console.warn("Speech error:", err);
      }
    });
  };

  const handleSaveVoiceConfig = () => {
    setSavingVoice(true);
    const saved = saveElizabethVoiceConfig(voiceConfig);
    const activeVoice = VOICE_ARCHETYPES.find(a => a.id === voiceConfig.archetypeId);
    socket.emit("update_ai_config", {
      aiUsername,
      voiceConfig: saved
    }, (res: any) => {
      setSavingVoice(false);
      if (res?.success || res?.success === undefined) {
        setSuccessMsg(`¡Voz de "${activeVoice?.name || 'Elizabeth'}" guardada exitosamente como voz oficial de ${aiUsername}!`);
      } else {
        alert("Error al guardar voz: " + res?.error);
      }
    });
  };

  const handleSelectAndSaveVoice = (arch: VoiceArchetype) => {
    const updated: ElizabethVoiceConfig = {
      ...voiceConfig,
      archetypeId: arch.id,
      pitch: arch.pitch,
      rate: arch.rate,
      volume: arch.volume,
      engine: 'xtts_v2'
    };
    setVoiceConfig(updated);
    setSavingVoice(true);
    const saved = saveElizabethVoiceConfig(updated);
    socket.emit("update_ai_config", {
      aiUsername,
      voiceConfig: saved
    }, (res: any) => {
      setSavingVoice(false);
      if (res?.success || res?.success === undefined) {
        setSuccessMsg(`¡Avatar y voz de "${arch.name}" guardados exitosamente para ${aiUsername}!`);
      } else {
        alert("Error al guardar voz: " + res?.error);
      }
    });
  };

  const currentBrain = allBrains[selectedUserForMemories] || { memories: [], stats: { totalMemories: 0, affinityLevel: "Conocido" } };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-4">
       <div className="bg-[#12141c] p-4 sm:p-6 rounded-3xl w-full max-w-xl shadow-2xl relative border border-fuchsia-500/25 max-h-[94vh] flex flex-col">
         {/* Botón cerrar */}
         <button
           onClick={() => {
             stopSpeaking();
             setAdminConfigAiOpen(false);
           }}
           className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-10"
         >
            <X size={19} />
         </button>

         {/* Cabecera */}
         <div className="mb-3 pr-8">
           <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-400 flex items-center gap-2">
              <Bot size={22} className="text-fuchsia-400 shrink-0" />
              Panel Maestro de {aiUsername}
           </h2>
           <p className="text-[11px] text-gray-400 mt-0.5">
             Centro de Control Cuántico, Voz Humana, Mímica Acústica & Almacén de Recuerdos.
           </p>
         </div>

         {/* Selector de pestañas */}
         <div className="flex bg-[#0a0a14] p-1 rounded-2xl border border-white/5 gap-1 mb-3 overflow-x-auto scrollbar-none">
           <button
             type="button"
             onClick={() => setActiveTab('tokens')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'tokens'
                 ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Key size={13} className={activeTab === 'tokens' ? 'text-amber-400' : ''} />
             <span>APIs</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('profile')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'profile'
                 ? 'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Bot size={13} className={activeTab === 'profile' ? 'text-fuchsia-400' : ''} />
             <span>Perfil</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('voice')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'voice'
                 ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Volume2 size={13} className={activeTab === 'voice' ? 'text-pink-400' : ''} />
             <span>Avatares de Voz XTTS v2</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('memories')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'memories'
                 ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Brain size={13} className={activeTab === 'memories' ? 'text-emerald-400' : ''} />
             <span>Recuerdos</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('dj')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'dj'
                 ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Radio size={13} className={activeTab === 'dj' ? 'text-cyan-400' : ''} />
             <span>DJ</span>
           </button>
         </div>

         {/* Alerta de Éxito */}
         {successMsg && (
            <div className="mb-3 p-2.5 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2.5 text-green-400 font-medium text-xs animate-in fade-in">
               <CheckCircle size={16} className="shrink-0" />
               <p>{successMsg}</p>
            </div>
         )}

         {/* Contenido scrolleable */}
         <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">

           {/* TAB 1: TOKENS & APIS */}
           {activeTab === 'tokens' && (
             <div className="space-y-4">
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
                 <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                 <div>
                   <span className="font-bold text-emerald-200">Almacenamiento seguro en Base de Datos:</span>
                   <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
                     Las claves se persisten en Firestore / Fallback y nunca en el código fuente.
                   </p>
                 </div>
               </div>

               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                 <div>
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                     <span className="text-xs font-bold text-gray-200">Proveedor activo:</span>
                     <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                       {activeProviderName === 'gemini' ? 'Google Gemini' : (groqBackupName || 'Groq Backup')}
                     </span>
                   </div>
                   <p className="text-[11px] text-gray-400 mt-1">
                     Conmutación bidireccional automática si se agota la cuota.
                   </p>
                 </div>
                 <ShieldCheck size={24} className="text-cyan-400 opacity-80" />
               </div>

               {/* Campos API */}
               <div className="bg-[#181a26] p-4 rounded-2xl border border-white/5 space-y-3">
                 <div>
                   <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                     <Zap size={14} className="text-amber-400" />
                     Nombre de la API de Respaldo
                   </label>
                   <input
                     type="text"
                     value={groqBackupName}
                     onChange={(e) => setGroqBackupName(e.target.value)}
                     className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
                     placeholder="Ej: ChatLiz-Groq-Backup"
                   />
                 </div>

                 <div>
                   <label className="text-xs font-bold text-amber-300 flex items-center justify-between mb-1">
                     <span className="flex items-center gap-1.5">
                       <Key size={14} className="text-amber-400" />
                       Token API de Groq
                     </span>
                     <button
                       type="button"
                       onClick={() => setShowGroqKey(!showGroqKey)}
                       className="text-gray-400 hover:text-white text-[10px] flex items-center gap-1"
                     >
                       {showGroqKey ? <EyeOff size={12} /> : <Eye size={12} />}
                       {showGroqKey ? 'Ocultar' : 'Ver'}
                     </button>
                   </label>
                   <div className="flex gap-2">
                     <input
                       type={showGroqKey ? 'text' : 'password'}
                       value={groqBackupKey}
                       onChange={(e) => setGroqBackupKey(e.target.value)}
                       placeholder="gsk_..."
                       className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-amber-400"
                     />
                     <button
                       type="button"
                       onClick={() => handleTestToken('groq')}
                       disabled={testingGroq || !groqBackupKey.trim()}
                       className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 transition-colors disabled:opacity-40"
                     >
                       {testingGroq ? <RefreshCw size={14} className="animate-spin" /> : 'Probar'}
                     </button>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-cyan-300 flex items-center justify-between mb-1">
                     <span className="flex items-center gap-1.5">
                       <Key size={14} className="text-cyan-400" />
                       Token API de Google Gemini (Recomendado para Voz Neural)
                     </span>
                     <button
                       type="button"
                       onClick={() => setShowGeminiKey(!showGeminiKey)}
                       className="text-gray-400 hover:text-white text-[10px] flex items-center gap-1"
                     >
                       {showGeminiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                       {showGeminiKey ? 'Ocultar' : 'Ver'}
                     </button>
                   </label>
                   <div className="flex gap-2">
                     <input
                       type={showGeminiKey ? 'text' : 'password'}
                       value={geminiKey}
                       onChange={(e) => setGeminiKey(e.target.value)}
                       placeholder="AIzaSy..."
                       className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-400"
                     />
                     <button
                       type="button"
                       onClick={() => handleTestToken('gemini')}
                       disabled={testingGemini || !geminiKey.trim()}
                       className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 transition-colors disabled:opacity-40"
                     >
                       {testingGemini ? <RefreshCw size={14} className="animate-spin" /> : 'Probar'}
                     </button>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-gray-200 block mb-1.5">
                     Proveedor Preferido Inicial
                   </label>
                   <div className="grid grid-cols-2 gap-2">
                     <button
                       type="button"
                       onClick={() => setPreferredProvider('gemini')}
                       className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                         preferredProvider === 'gemini'
                           ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                           : 'bg-[#0a0a14] border-white/10 text-gray-400'
                       }`}
                     >
                       <Zap size={14} /> Google Gemini
                     </button>
                     <button
                       type="button"
                       onClick={() => setPreferredProvider('groq')}
                       className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                         preferredProvider === 'groq'
                           ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                           : 'bg-[#0a0a14] border-white/10 text-gray-400'
                       }`}
                     >
                       <Zap size={14} /> {groqBackupName || 'Groq'}
                     </button>
                   </div>
                 </div>

                 {testResult && (
                   <div className={`p-3 rounded-xl text-xs border ${
                     testResult.success
                       ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                       : 'bg-red-500/10 border-red-500/30 text-red-300'
                   }`}>
                     <span className="font-bold">{testResult.success ? '✓ Éxito:' : '✗ Error:'}</span> {testResult.msg}
                   </div>
                 )}

                 <button
                   type="button"
                   onClick={handleSaveApiTokens}
                   disabled={savingTokens}
                   className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {savingTokens ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                   <span>Guardar Configuración de APIs</span>
                 </button>
               </div>
             </div>
           )}

           {/* TAB 2: PERFIL & AVATAR */}
           {activeTab === 'profile' && (
             <div className="space-y-4 text-xs">
               <div className="flex flex-col items-center">
                 <div className="relative group cursor-pointer">
                    <img
                       src={aiProfileForm.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                       alt="Avatar IA"
                       className="w-20 h-20 rounded-full object-cover border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[10px] text-white font-bold text-center px-1">Cambiar Foto</span>
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onload = (event) => {
                                setAiProfileForm({ ...aiProfileForm, profilePic: event.target?.result as string });
                             };
                             reader.readAsDataURL(file);
                          }
                       }} />
                    </div>
                 </div>
                 <span className="text-[11px] text-gray-500 mt-2 font-semibold uppercase tracking-wider">Haz clic para cambiar avatar</span>
               </div>

               <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-gray-300">Estado / Mensaje de Presentación</label>
                 <input
                    value={aiProfileForm.statusMessage || ''}
                    onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', statusMessage: e.target.value})}
                    maxLength={60}
                    placeholder="Ej: Administradora IA • En línea"
                    type="text"
                    className="w-full bg-[#0a0a16] p-2.5 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white text-xs"
                 />
               </div>

               <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-gray-300">Instrucciones de Identidad (system_instruction)</label>
                 <textarea
                    value={aiProfileForm.systemInstruction || ''}
                    onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: e.target.value})}
                    placeholder="Ej: Eres Elizabeth, administradora de Chat Liz. Eres carismática, divertida y justa..."
                    rows={4}
                    className="w-full bg-[#0a0a16] p-2.5 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white text-xs resize-none scrollbar-thin"
                 />
               </div>

               <button
                 type="button"
                 onClick={() => {
                   socket.emit("update_ai_config", {
                     aiUsername,
                     profilePic: aiProfileForm.profilePic,
                     statusMessage: aiProfileForm.statusMessage,
                     systemInstruction: aiProfileForm.systemInstruction,
                     bubbleColor: aiProfileForm.bubbleColor,
                     bubbleBorder: aiProfileForm.bubbleBorder,
                     bubbleShape: aiProfileForm.bubbleShape,
                     bubbleTexture: aiProfileForm.bubbleTexture,
                     groqBackupKey: groqBackupKey.trim(),
                     groqBackupName: groqBackupName.trim(),
                     geminiKey: geminiKey.trim(),
                     preferredProvider
                   }, (res: any) => {
                       if (res?.success || res?.success === undefined) {
                           setSuccessMsg(`¡Perfil de ${aiUsername} guardado con éxito!`);
                       } else {
                           alert("Error: " + res?.error);
                       }
                   });
                 }}
                 className="w-full mt-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_4px_14px_rgba(217,70,239,0.3)]"
               >
                 Guardar Perfil de {aiUsername}
               </button>
             </div>
           )}

           {/* TAB 3: AVATARES DE VOZ COQUI XTTS v2 & CLONACIÓN */}
           {activeTab === 'voice' && (
             <div className="space-y-4 text-xs">
               {/* Cabecera Exclusiva Coqui XTTS v2 - 100% Libre y Gratuito */}
               <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-[#181a26] p-3.5 rounded-2xl border border-pink-500/25 flex items-start gap-3">
                 <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0 mt-0.5">
                   <Volume2 size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-xs flex items-center gap-1.5 flex-wrap">
                     Avatares de Voz Oficiales Coqui XTTS v2
                     <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                       100% Gratuito • Sin API Key
                     </span>
                   </h3>
                   <p className="text-[11px] text-gray-300/80 mt-1 leading-relaxed">
                     Selecciona cualquier avatar de voz para Elizabeth. Puedes escuchar su tono en tiempo real y, con un solo clic en <strong>Guardar Voz</strong>, quedará configurada como la voz oficial de Elizabeth para mensajes y llamadas.
                   </p>
                 </div>
               </div>

               {/* TARJETA DE LA VOZ ACTUALMENTE ACTIVA EN ELIZABETH */}
               {(() => {
                 const activeSpeaker = VOICE_ARCHETYPES.find(a => a.id === voiceConfig.archetypeId) || VOICE_ARCHETYPES[0];
                 const isPreviewingActive = isPlayingVoice && previewingVoiceId === activeSpeaker.id;
                 return (
                   <div className="bg-gradient-to-b from-[#22162b] to-[#141522] p-3.5 rounded-2xl border-2 border-pink-500/60 shadow-[0_0_24px_rgba(236,72,153,0.25)]">
                     <div className="flex items-center justify-between gap-3">
                       <div className="flex items-center gap-3">
                         <div className="relative">
                           <img
                             src={getVoiceAvatarUrl(activeSpeaker)}
                             alt={activeSpeaker.name}
                             className="w-14 h-14 rounded-full object-cover border-2 border-pink-400 shadow-md ring-2 ring-pink-500/30"
                           />
                           <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black shadow">
                             EN USO
                           </span>
                         </div>
                         <div>
                           <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider block">
                             Voz Oficial de Elizabeth
                           </span>
                           <h4 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                             {activeSpeaker.name}
                             <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                               {activeSpeaker.accent || activeSpeaker.speakerTag}
                             </span>
                           </h4>
                           <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-1">
                             {activeSpeaker.description}
                           </p>
                         </div>
                       </div>

                       <div className="shrink-0 flex flex-col gap-1.5">
                         <button
                           type="button"
                           onClick={() => handleTestSpecificVoice(activeSpeaker.id)}
                           className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                             isPreviewingActive
                               ? 'bg-red-500 text-white border border-red-400 animate-pulse'
                               : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white'
                           }`}
                         >
                           {isPreviewingActive ? <Square size={13} /> : <Play size={13} fill="currentColor" />}
                           <span>{isPreviewingActive ? 'Detener' : 'Escuchar'}</span>
                         </button>
                       </div>
                     </div>
                   </div>
                 );
               })()}

               {/* BUSCADOR Y FILTROS DEL CATÁLOGO DE AVATARES */}
               <div className="space-y-2.5">
                 <div className="flex items-center justify-between flex-wrap gap-1">
                   <label className="font-bold text-gray-200 flex items-center gap-1.5 text-xs">
                     <span>Catálogo de Avatares Coqui XTTS v2</span>
                     <span className="text-[10px] text-pink-400 bg-pink-500/15 border border-pink-500/30 px-1.5 py-0.5 rounded-md font-mono font-bold">
                       {VOICE_ARCHETYPES.length} Avatares
                     </span>
                   </label>
                   <span className="text-[10px] text-gray-400">Escucha y guarda la que prefieras</span>
                 </div>

                 {/* Buscador */}
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input
                     type="text"
                     value={voiceSearchQuery}
                     onChange={(e) => setVoiceSearchQuery(e.target.value)}
                     placeholder="Buscar por nombre, acento o estilo (ej: Sofía, Lucas, Diego, Claribel, Damian...)"
                     className="w-full bg-[#0a0a16] border border-white/10 rounded-xl pl-9 pr-7 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/60 transition-colors"
                   />
                   {voiceSearchQuery && (
                     <button
                       type="button"
                       onClick={() => setVoiceSearchQuery('')}
                       className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs"
                     >
                       ✕
                     </button>
                   )}
                 </div>

                 {/* Filtro de Categorías */}
                 <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
                   {[
                     { id: 'todas', label: `Todos (${VOICE_ARCHETYPES.length})` },
                     { id: 'espanol_xtts', label: `Español Nativo (${VOICE_ARCHETYPES.filter(a => a.category === 'espanol_xtts').length})` },
                     { id: 'femenina_xtts', label: `Femeninas (${VOICE_ARCHETYPES.filter(a => a.gender === 'female').length})` },
                     { id: 'masculina_xtts', label: `Masculinas (${VOICE_ARCHETYPES.filter(a => a.gender === 'male').length})` },
                     { id: 'clon_xtts', label: `Clonados (1)` }
                   ].map(tab => (
                     <button
                       key={tab.id}
                       type="button"
                       onClick={() => setVoiceCategoryFilter(tab.id as any)}
                       className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
                         voiceCategoryFilter === tab.id
                           ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                           : 'bg-[#181a26] text-gray-400 hover:text-white border border-white/5'
                       }`}
                     >
                       {tab.label}
                     </button>
                   ))}
                 </div>

                 {/* GRID DE AVATARES DE VOZ XTTS v2 */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                   {VOICE_ARCHETYPES.filter(arch => {
                     if (voiceCategoryFilter === 'espanol_xtts' && arch.category !== 'espanol_xtts') return false;
                     if (voiceCategoryFilter === 'femenina_xtts' && arch.gender !== 'female') return false;
                     if (voiceCategoryFilter === 'masculina_xtts' && arch.gender !== 'male') return false;
                     if (voiceCategoryFilter === 'clon_xtts' && arch.category !== 'clon_xtts') return false;

                     if (voiceSearchQuery.trim()) {
                       const q = voiceSearchQuery.toLowerCase();
                       const match = arch.name.toLowerCase().includes(q) ||
                                     arch.description.toLowerCase().includes(q) ||
                                     arch.speakerTag.toLowerCase().includes(q) ||
                                     (arch.accent && arch.accent.toLowerCase().includes(q));
                       if (!match) return false;
                     }
                     return true;
                   }).map((arch) => {
                     const isSelected = voiceConfig.archetypeId === arch.id;
                     const isPreviewing = isPlayingVoice && previewingVoiceId === arch.id;
                     const avatarUrl = getVoiceAvatarUrl(arch);
                     return (
                       <div
                         key={arch.id}
                         className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                           isSelected
                             ? 'bg-gradient-to-b from-pink-950/30 to-[#1b172a] border-pink-500/80 shadow-[0_0_16px_rgba(236,72,153,0.3)] text-white ring-1 ring-pink-500/40'
                             : 'bg-[#181a26] border-white/5 text-gray-300 hover:border-pink-500/30 hover:bg-white/5'
                         }`}
                       >
                         <div className="flex items-start gap-3">
                           <div className="relative shrink-0">
                             <img
                               src={avatarUrl}
                               alt={arch.name}
                               className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${
                                 isSelected ? 'border-pink-400 ring-2 ring-pink-500/40' : 'border-white/10'
                               }`}
                             />
                             {isSelected && (
                               <span className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-0.5 shadow">
                                 <Check size={9} />
                               </span>
                             )}
                           </div>

                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between gap-1">
                               <h5 className="font-black text-xs text-white truncate">{arch.name}</h5>
                               <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-pink-300 font-mono shrink-0">
                                 {arch.accent || arch.speakerTag}
                               </span>
                             </div>
                             <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-tight">
                               {arch.description}
                             </p>
                           </div>
                         </div>

                         <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 mt-auto">
                           {/* Botón Escuchar */}
                           <button
                             type="button"
                             onClick={() => handleTestSpecificVoice(arch.id)}
                             className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                               isPreviewing
                                 ? 'bg-red-500/30 border-red-400 text-red-300 animate-pulse'
                                 : 'bg-white/5 hover:bg-white/10 border-white/10 text-pink-300 hover:text-pink-200'
                             }`}
                             title={`Escuchar voz de ${arch.name}`}
                           >
                             {isPreviewing ? <Square size={12} /> : <Play size={12} fill="currentColor" />}
                             <span>{isPreviewing ? 'Detener' : 'Escuchar'}</span>
                           </button>

                           {/* Botón Guardar para Elizabeth */}
                           <button
                             type="button"
                             disabled={savingVoice}
                             onClick={() => handleSelectAndSaveVoice(arch)}
                             className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                               isSelected
                                 ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-300'
                                 : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-sm'
                             }`}
                           >
                             <Check size={12} />
                             <span>{isSelected ? '✓ Voz Oficial' : 'Guardar Voz'}</span>
                           </button>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* ESTUDIO DE CLONACIÓN DE VOZ XTTS v2 */}
               <div className="bg-gradient-to-b from-[#191929] to-[#131422] p-4 rounded-2xl border border-purple-500/30 space-y-3 mt-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
                       <Mic size={15} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white text-xs">Estudio de Clonación de Voz XTTS v2</h4>
                       <p className="text-[10px] text-gray-400">Sube un archivo de voz o grábate con el micrófono para crear una voz personalizada.</p>
                     </div>
                   </div>
                   <span className="bg-purple-500/30 text-purple-200 text-[9px] px-2 py-0.5 rounded-full font-bold">
                     Zero-Shot Clone
                   </span>
                 </div>

                 <div className="space-y-2">
                   <div>
                     <label className="text-[10px] uppercase font-bold text-gray-300 block mb-1">Nombre de la Voz Clonada</label>
                     <input
                       type="text"
                       value={cloneName}
                       onChange={(e) => setCloneName(e.target.value)}
                       placeholder="Ej: Mi Voz, Amigo Joven, Narrador..."
                       className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                     {/* Grabar con Micrófono */}
                     <button
                       type="button"
                       onClick={handleToggleRecordClone}
                       className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                         isRecordingClone
                           ? 'bg-red-500 text-white border-red-400 animate-pulse'
                           : cloneAudioBase64
                             ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                             : 'bg-[#0a0a14] border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                       }`}
                     >
                       <Mic size={14} className={isRecordingClone ? 'animate-bounce' : ''} />
                       <span>{isRecordingClone ? 'Detener Grabación' : cloneAudioBase64 ? '✓ Muestra Lista' : 'Grabar con Micrófono'}</span>
                     </button>

                     {/* Subir archivo de audio */}
                     <label className="p-2.5 rounded-xl border border-white/10 bg-[#0a0a14] hover:bg-white/5 text-gray-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all">
                       <Upload size={14} />
                       <span>Subir Audio (.mp3/.wav)</span>
                       <input
                         type="file"
                         accept="audio/*"
                         className="hidden"
                         onChange={handleFileUploadClone}
                       />
                     </label>
                   </div>

                   {/* Botón Clonar */}
                   <button
                     type="button"
                     disabled={isCloning || !cloneAudioBase64 || !cloneName.trim()}
                     onClick={handleCloneVoice}
                     className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                       isCloning || !cloneAudioBase64 || !cloneName.trim()
                         ? 'bg-gray-800 text-gray-500 border border-white/5 cursor-not-allowed'
                         : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                     }`}
                   >
                     <Sparkles size={14} className={isCloning ? 'animate-spin' : ''} />
                     <span>{isCloning ? 'Clonando Voz con XTTS v2...' : 'Clonar Voz con XTTS v2'}</span>
                   </button>
                 </div>
               </div>
             </div>
           )}

           {/* TAB 5: ZONA DE ALMACENAMIENTO DE RECUERDOS (MEMORIA CONTINUA) */}
           {activeTab === 'memories' && (
             <div className="space-y-4 text-xs">
               <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-[#181a26] p-3.5 rounded-2xl border border-emerald-500/25 flex items-start gap-3">
                 <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 mt-0.5">
                   <Brain size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                     Zona de Almacenamiento de Recuerdos de {aiUsername}
                     <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/40">
                       Memoria Continua
                     </span>
                   </h3>
                   <p className="text-[11px] text-gray-300/80 mt-1 leading-relaxed">
                     Elizabeth almacena datos, gustos, anécdotas y detalles de cada conversación con cada usuario. Al hablar, consulta automáticamente estos recuerdos para brindar una experiencia humana inmersiva.
                   </p>
                 </div>
               </div>

               {/* Selector de Usuario */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                     <User size={13} className="text-emerald-400" />
                     Usuario Seleccionado
                   </label>
                   <button
                     type="button"
                     onClick={fetchAllMemories}
                     className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                   >
                     <RefreshCw size={11} className={loadingMemories ? 'animate-spin' : ''} />
                     Recargar
                   </button>
                 </div>

                 <div className="flex gap-2">
                   <select
                     value={selectedUserForMemories}
                     onChange={(e) => setSelectedUserForMemories(e.target.value)}
                     className="flex-1 bg-[#0a0a14] p-2.5 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-white text-xs font-semibold"
                   >
                     {Object.keys(allBrains).length === 0 ? (
                       <option value="Axiss">Axiss (Creador)</option>
                     ) : (
                       Object.keys(allBrains).map((uname) => (
                         <option key={uname} value={uname}>
                           {uname} ({allBrains[uname]?.memories?.length || 0} recuerdos)
                         </option>
                       ))
                     )}
                   </select>

                   <button
                     type="button"
                     onClick={handleClearUserMemories}
                     className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 transition-colors"
                     title="Reiniciar recuerdos de este usuario"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
               </div>

               {/* Métricas del Cerebro para este Usuario */}
               <div className="grid grid-cols-2 gap-2">
                 <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 text-center">
                   <span className="text-[10px] text-gray-400 uppercase font-semibold">Recuerdos Guardados</span>
                   <p className="text-xl font-black text-emerald-300 mt-0.5">
                     {currentBrain?.memories?.length || 0}
                   </p>
                 </div>
                 <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 text-center">
                   <span className="text-[10px] text-gray-400 uppercase font-semibold">Afinidad Relacional</span>
                   <p className="text-sm font-bold text-teal-300 mt-1">
                     {currentBrain?.stats?.affinityLevel || 'Cercana & Amigable'}
                   </p>
                 </div>
               </div>

               {/* Formulario para añadir recuerdo manual */}
               <form onSubmit={handleAddMemory} className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-2.5">
                 <label className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                   <Plus size={13} className="text-emerald-400" />
                   Registrar Recuerdo Manualmente en Elizabeth
                 </label>
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={newMemoryFact}
                     onChange={(e) => setNewMemoryFact(e.target.value)}
                     placeholder="Ej: Le apasiona la física cuántica y toma café sin azúcar..."
                     className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                     required
                   />
                   <select
                     value={newMemoryCategory}
                     onChange={(e: any) => setNewMemoryCategory(e.target.value)}
                     className="bg-[#0a0a14] border border-white/10 rounded-xl px-2.5 py-2 text-[11px] text-gray-300 focus:outline-none focus:border-emerald-500"
                   >
                     <option value="personal">Personal</option>
                     <option value="gustos">Gustos</option>
                     <option value="anecdotas">Anécdotas</option>
                     <option value="emociones">Emociones</option>
                   </select>
                   <button
                     type="submit"
                     disabled={isAddingMemory || !newMemoryFact.trim()}
                     className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-colors disabled:opacity-40"
                   >
                     {isAddingMemory ? <RefreshCw size={13} className="animate-spin" /> : 'Guardar'}
                   </button>
                 </div>
               </form>

               {/* Lista de Recuerdos */}
               <div className="space-y-2">
                 <label className="font-bold text-gray-200 text-xs">
                   Recuerdos Almacenados de @{selectedUserForMemories}
                 </label>

                 {(!currentBrain?.memories || currentBrain.memories.length === 0) ? (
                   <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/5 text-center text-gray-400 text-xs">
                     <Brain size={24} className="mx-auto mb-1.5 opacity-40 text-emerald-400" />
                     <p>Aún no hay recuerdos registrados para @{selectedUserForMemories}.</p>
                     <p className="text-[10px] text-gray-500 mt-1">
                       Habla con Elizabeth en el chat o agrega un recuerdo arriba para comenzar.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                     {currentBrain.memories.map((mem: any) => {
                       const categoryColors: Record<string, string> = {
                         gustos: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                         personal: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
                         anecdotas: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                         emociones: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                       };
                       const badgeColor = categoryColors[mem.category] || 'bg-gray-500/15 text-gray-300 border-gray-500/30';
                       return (
                         <div
                           key={mem.id}
                           className="bg-[#181a26] p-3 rounded-2xl border border-white/5 flex items-start justify-between gap-2.5 hover:border-white/10 transition-colors"
                         >
                           <div className="space-y-1">
                             <div className="flex items-center gap-1.5">
                               <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                 {mem.category}
                               </span>
                               <span className="text-[10px] text-gray-500">
                                 {new Date(mem.timestamp).toLocaleDateString()}
                               </span>
                             </div>
                             <p className="text-gray-200 text-xs leading-relaxed">
                               {mem.fact}
                             </p>
                           </div>

                           <button
                             type="button"
                             onClick={() => handleDeleteMemory(mem.id)}
                             className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                             title="Borrar recuerdo"
                           >
                             <Trash2 size={13} />
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* TAB 6: DJ & CONTROL */}
           {activeTab === 'dj' && (
             <div className="space-y-4">
               <div className="bg-[#181a26] p-4 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-gray-200 mb-3 flex items-center gap-2">
                    <Radio size={14} className="text-cyan-400" />
                    Asignar Rol de DJ
                  </h3>
                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const target = (e.target as any).djTarget.value;
                     const start = (e.target as any).djStart.value;
                     const end = (e.target as any).djEnd.value;
                     if (target && start && end) {
                        socket.emit('admin_set_dj_schedule', { targetUser: target, schedule: { start, end } });
                        (e.target as any).reset();
                        setSuccessMsg(`Horario de DJ asignado a ${target}.`);
                     }
                  }} className="flex flex-col gap-3">
                     <input name="djTarget" type="text" placeholder="Nombre de usuario" className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-400" required />
                     <div className="flex gap-2">
                        <input name="djStart" type="time" className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-400" required />
                        <span className="text-gray-500 self-center text-xs">-</span>
                        <input name="djEnd" type="time" className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-400" required />
                     </div>
                     <button type="submit" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold py-2.5 rounded-xl text-xs transition-colors border border-cyan-500/30">
                        Asignar DJ
                     </button>
                  </form>
               </div>

               <div className="bg-[#181a26] p-4 rounded-2xl border border-red-500/20">
                  <h3 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Control de Emergencia
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Corta inmediatamente cualquier transmisión o streaming de DJ activo en todas las salas.
                  </p>
                  <button
                     type="button"
                     onClick={() => {
                         socket.emit('admin_cut_transmission');
                         setSuccessMsg('Transmisión de DJ cortada exitosamente.');
                     }}
                     className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold py-2.5 rounded-xl text-xs transition-colors border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                     Cortar Transmisión DJ Activa
                  </button>
               </div>
             </div>
           )}

         </div>
       </div>
    </div>
  );
}
