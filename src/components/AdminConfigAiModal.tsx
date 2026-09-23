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
  ArrowUpRight
} from 'lucide-react';
import { socket } from '../socket';
import { 
  VOICE_ARCHETYPES, 
  VoiceArchetype, 
  ElizabethVoiceConfig, 
  getSavedElizabethVoiceConfig, 
  saveElizabethVoiceConfig, 
  getSystemVoices, 
  speakElizabethMessage, 
  stopSpeaking, 
  isSpeaking,
  VoiceEvolutionState,
  VoiceEvolutionLog,
  requestInstantEvolutionLeap,
  requestVoiceCloneFromSample
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

  // Voice configuration state
  const [voiceConfig, setVoiceConfig] = useState<ElizabethVoiceConfig>(() => {
    return (aiProfileForm as any)?.voiceConfig || getSavedElizabethVoiceConfig();
  });
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
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
    getSystemVoices().then((voices) => {
      setSystemVoices(voices);
      if (!voiceConfig.voiceURI && voices.length > 0) {
        const esVoice = voices.find(v => v.lang.toLowerCase().startsWith('es'));
        if (esVoice) {
          setVoiceConfig(prev => ({ ...prev, voiceURI: esVoice.voiceURI }));
        }
      }
    });

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
      return;
    }
    const phrase = phraseOverride || testPhrase;
    setIsPlayingVoice(true);
    speakElizabethMessage(phrase, voiceConfig, {
      onStart: () => setIsPlayingVoice(true),
      onEnd: () => setIsPlayingVoice(false),
      onError: (err) => {
        setIsPlayingVoice(false);
        console.warn("Speech error:", err);
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
             <span>Voz XTTS v2</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('mimic')}
             className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
               activeTab === 'mimic'
                 ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Dna size={13} className={activeTab === 'mimic' ? 'text-purple-400' : ''} />
             <span>Auto-Evolución & Clonación</span>
             <span className="bg-purple-500/30 text-purple-200 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
               {voiceEvolution.humanizationLevel}%
             </span>
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

           {/* TAB 3: VOZ HUMANA & TONO (XTTS v2 + BARK EN ESPAÑOL) */}
           {activeTab === 'voice' && (
             <div className="space-y-4 text-xs">
               <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-[#181a26] p-3.5 rounded-2xl border border-pink-500/25 flex items-start gap-3">
                 <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0 mt-0.5">
                   <Volume2 size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                     Motor Neural XTTS v2 + Inflexiones Bark en Español
                     <span className="bg-pink-500/30 text-pink-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-pink-500/40">
                       Voz Humana Orgánica
                     </span>
                   </h3>
                   <p className="text-[11px] text-gray-300/80 mt-1 leading-relaxed">
                     Generación de voz con pausas y respiraciones sutiles, risas espontáneas y modulación continua según la emoción. Cero dictado robótico plano.
                   </p>
                 </div>
               </div>

               {/* Comparador Auditivo: Antiguo vs XTTS v2/Bark */}
               <div className="bg-[#181a26] p-3 rounded-2xl border border-pink-500/20 space-y-2">
                 <span className="font-bold text-gray-200 block text-xs">Demostración Auditiva: Antiguo vs XTTS v2 / Bark</span>
                 <div className="grid grid-cols-2 gap-2">
                   <button
                     type="button"
                     onClick={() => {
                       speakElizabethMessage("Iniciando lectura de sistema. Esta es una voz de computadora con pausas matemáticas fijas.", {
                         engine: 'browser',
                         pitch: 0.9,
                         rate: 0.95
                       });
                     }}
                     className="p-2 rounded-xl bg-[#0a0a14] border border-white/10 hover:border-gray-500 text-left transition-all"
                   >
                     <div className="flex items-center gap-1.5 font-bold text-gray-400 text-[11px]">
                       <span>🤖 Modelo Antiguo (eSpeak / Tacotron)</span>
                     </div>
                     <p className="text-[10px] text-gray-500 mt-0.5">Tono plano, pausas de 1s, robótico y metálico.</p>
                   </button>

                   <button
                     type="button"
                     onClick={() => {
                       speakElizabethMessage("¡Hola Axiss! [respiración sutil] Jajaja, ¡escucha la diferencia! Con XTTS v2 mi voz respira, ríe y suena completamente viva y humana.", {
                         engine: 'xtts_neural',
                         useBarkExpressiveTags: true,
                         pitch: voiceConfig.pitch,
                         rate: voiceConfig.rate
                       });
                     }}
                     className="p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 hover:border-pink-400 text-left transition-all"
                   >
                     <div className="flex items-center gap-1.5 font-bold text-pink-300 text-[11px]">
                       <Sparkles size={12} className="text-pink-400" />
                       <span>✨ XTTS v2 + Bark (Voz Humana)</span>
                     </div>
                     <p className="text-[10px] text-pink-200/80 mt-0.5">Modulación viva, respiración orgánica y risas.</p>
                   </button>
                 </div>
               </div>

               {/* Selector de Motor */}
               <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 space-y-2">
                 <label className="font-bold text-gray-200 block text-xs">Tecnología de Síntesis</label>
                 <div className="grid grid-cols-2 gap-2">
                   <button
                     type="button"
                     onClick={() => setVoiceConfig(prev => ({ ...prev, engine: 'xtts_neural' }))}
                     className={`p-2.5 rounded-xl border text-left transition-all ${
                       voiceConfig.engine !== 'browser'
                         ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 border-pink-500/60 text-white shadow-sm'
                         : 'bg-[#0a0a14] border-white/10 text-gray-400 hover:text-white'
                     }`}
                   >
                     <div className="flex items-center justify-between mb-1">
                       <span className="font-bold text-xs text-pink-300">🌟 XTTS v2 & Bark Neural</span>
                       {voiceConfig.engine !== 'browser' && <Check size={14} className="text-pink-400" />}
                     </div>
                     <p className="text-[10px] text-gray-400">Voz humana real con respiración sutil y entonación viva.</p>
                   </button>

                   <button
                     type="button"
                     onClick={() => setVoiceConfig(prev => ({ ...prev, engine: 'browser' }))}
                     className={`p-2.5 rounded-xl border text-left transition-all ${
                       voiceConfig.engine === 'browser'
                         ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-500/60 text-white shadow-sm'
                         : 'bg-[#0a0a14] border-white/10 text-gray-400 hover:text-white'
                     }`}
                   >
                     <div className="flex items-center justify-between mb-1">
                       <span className="font-bold text-xs text-cyan-300">🖥️ Motor Local Navegador</span>
                       {voiceConfig.engine === 'browser' && <Check size={14} className="text-cyan-400" />}
                     </div>
                     <p className="text-[10px] text-gray-400">Síntesis local del sistema sin conexión.</p>
                   </button>
                 </div>
               </div>

               {/* Opciones de Expresividad Bark & XTTS */}
               <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 space-y-2">
                 <span className="font-bold text-gray-200 block text-xs">Ajustes Expresivos Orgánicos</span>
                 <div className="grid grid-cols-2 gap-2">
                   <div 
                     onClick={handleToggleBarkTags}
                     className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                       voiceEvolution.barkNonVerbalTagsEnabled ? 'bg-pink-500/15 border-pink-500/40 text-pink-200' : 'bg-[#0a0a14] border-white/10 text-gray-400'
                     }`}
                   >
                     <div>
                       <span className="font-bold text-[11px] block">🌬️ Inflexiones Bark</span>
                       <span className="text-[9px] text-gray-400">Respiraciones y risitas sutiles</span>
                     </div>
                     <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${voiceEvolution.barkNonVerbalTagsEnabled ? 'border-pink-400 bg-pink-500' : 'border-gray-600'}`}>
                       {voiceEvolution.barkNonVerbalTagsEnabled && <Check size={10} className="text-white" />}
                     </div>
                   </div>

                   <div 
                     onClick={handleToggleXttsProsody}
                     className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                       voiceEvolution.xttsProsodyEnabled ? 'bg-purple-500/15 border-purple-500/40 text-purple-200' : 'bg-[#0a0a14] border-white/10 text-gray-400'
                     }`}
                   >
                     <div>
                       <span className="font-bold text-[11px] block">🎭 Micropausas XTTS v2</span>
                       <span className="text-[9px] text-gray-400">Cadencia humana sin silencios de 1s</span>
                     </div>
                     <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${voiceEvolution.xttsProsodyEnabled ? 'border-purple-400 bg-purple-500' : 'border-gray-600'}`}>
                       {voiceEvolution.xttsProsodyEnabled && <Check size={10} className="text-white" />}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Arquetipos / Presets de Voz */}
               <div className="space-y-2">
                 <label className="font-bold text-gray-200 flex items-center justify-between text-xs">
                   <span>Arquetipos Vocales (Femeninos, Masculinos y Ancianos)</span>
                   <span className="text-[11px] text-pink-400 font-normal">9 arquetipos</span>
                 </label>
                 <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                   {VOICE_ARCHETYPES.map((arch) => {
                     const isSelected = voiceConfig.archetypeId === arch.id;
                     return (
                       <button
                         key={arch.id}
                         type="button"
                         onClick={() => {
                           setVoiceConfig(prev => ({
                             ...prev,
                             archetypeId: arch.id,
                             pitch: arch.pitch,
                             rate: arch.rate,
                             volume: arch.volume
                           }));
                         }}
                         className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 relative ${
                           isSelected
                             ? 'bg-pink-500/20 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.25)] text-white'
                             : 'bg-[#181a26] border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/5'
                         }`}
                       >
                         <div className="flex items-center justify-between">
                           <span className="text-base">{arch.icon}</span>
                           {isSelected && (
                             <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                           )}
                         </div>
                         <span className="font-bold text-[11px] leading-tight text-gray-100">{arch.name}</span>
                         <span className="text-[10px] text-gray-400 leading-tight line-clamp-2">{arch.description}</span>
                         <div className="flex gap-2 mt-0.5 text-[9px] font-mono text-gray-400">
                           <span className="text-pink-300 font-bold">Voz: {arch.neuralVoice}</span>
                           <span>Tono: {arch.pitch.toFixed(2)}x</span>
                         </div>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Sliders de Tono, Velocidad y Volumen */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-3.5">
                 <div className="flex items-center justify-between">
                   <span className="font-bold text-gray-200 flex items-center gap-1.5">
                     <Sliders size={13} className="text-pink-400" />
                     Modulación Acústica de Tono & Ritmo
                   </span>
                   <button
                     type="button"
                     onClick={() => {
                       const standard = VOICE_ARCHETYPES.find(a => a.id === voiceConfig.archetypeId) || VOICE_ARCHETYPES[0];
                       setVoiceConfig(prev => ({ ...prev, pitch: standard.pitch, rate: standard.rate, volume: 1.0 }));
                     }}
                     className="text-[10px] text-gray-400 hover:text-white underline"
                   >
                     Restablecer
                   </button>
                 </div>

                 {/* Pitch */}
                 <div className="space-y-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-gray-300">Tono (Pitch): {voiceConfig.pitch < 0.9 ? 'Grave / Masculino / Anciano' : voiceConfig.pitch > 1.2 ? 'Agudo / Femenino' : 'Medio'}</span>
                     <span className="font-mono text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30 font-bold">
                       {voiceConfig.pitch.toFixed(2)}x
                     </span>
                   </div>
                   <input
                     type="range"
                     min="0.5"
                     max="2.0"
                     step="0.05"
                     value={voiceConfig.pitch}
                     onChange={(e) => setVoiceConfig({ ...voiceConfig, pitch: parseFloat(e.target.value) })}
                     className="w-full accent-pink-500 cursor-pointer"
                   />
                 </div>

                 {/* Rate */}
                 <div className="space-y-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-gray-300">Velocidad (Cadencia de habla)</span>
                     <span className="font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                       {voiceConfig.rate.toFixed(2)}x
                     </span>
                   </div>
                   <input
                     type="range"
                     min="0.5"
                     max="1.8"
                     step="0.05"
                     value={voiceConfig.rate}
                     onChange={(e) => setVoiceConfig({ ...voiceConfig, rate: parseFloat(e.target.value) })}
                     className="w-full accent-purple-500 cursor-pointer"
                   />
                 </div>

                 {/* Volume */}
                 <div className="space-y-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-gray-300">Volumen</span>
                     <span className="font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                       {Math.round(voiceConfig.volume * 100)}%
                     </span>
                   </div>
                   <input
                     type="range"
                     min="0.1"
                     max="1.0"
                     step="0.05"
                     value={voiceConfig.volume}
                     onChange={(e) => setVoiceConfig({ ...voiceConfig, volume: parseFloat(e.target.value) })}
                     className="w-full accent-cyan-400 cursor-pointer"
                   />
                 </div>
               </div>

               {/* Matiz Emocional */}
               <div className="space-y-1.5">
                 <label className="font-bold text-gray-300 text-xs">Matiz de Expresión Emocional</label>
                 <div className="grid grid-cols-5 gap-1.5">
                   {(['calida', 'seria', 'jovial', 'suave', 'energetica'] as const).map((tone) => (
                     <button
                       key={tone}
                       type="button"
                       onClick={() => setVoiceConfig({ ...voiceConfig, voiceTone: tone })}
                       className={`py-2 px-1 rounded-xl text-center capitalize transition-all border text-[11px] font-medium ${
                         voiceConfig.voiceTone === tone
                           ? 'bg-fuchsia-500/25 border-fuchsia-400 text-white font-bold shadow-sm'
                           : 'bg-[#0a0a16] border-white/5 text-gray-400 hover:text-gray-200'
                       }`}
                     >
                       {tone}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Probador en Vivo */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-2.5">
                 <label className="font-bold text-gray-200 flex items-center justify-between text-xs">
                   <span className="flex items-center gap-1.5">
                     <Sparkles size={13} className="text-pink-400" />
                     Probar Voz Humana en Tiempo Real
                   </span>
                   {isPlayingVoice && (
                     <span className="flex items-center gap-1 text-[10px] text-pink-400 animate-pulse">
                       <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                       Hablando con voz neural...
                     </span>
                   )}
                 </label>

                 {/* Presets Expresivos Rápidos */}
                 <div className="flex flex-wrap gap-1.5 pt-1">
                   <button
                     type="button"
                     onClick={() => {
                       const txt = "¡Jajaja! Me encanta cómo suena ahora mi voz, se siente súper natural y viva.";
                       setTestPhrase(txt);
                       handleTestVoiceSpeech(txt);
                     }}
                     className="px-2 py-1 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 rounded-lg text-[10px] text-pink-300 flex items-center gap-1 transition-colors"
                   >
                     <span>🤣 Risas (Bark)</span>
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       const txt = "¿De verdad pensaste que Elizabeth se iba a quedar con una voz robótica de dictado?";
                       setTestPhrase(txt);
                       handleTestVoiceSpeech(txt);
                     }}
                     className="px-2 py-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg text-[10px] text-purple-300 flex items-center gap-1 transition-colors"
                   >
                     <span>❓ Pregunta Viva (XTTS v2)</span>
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       const txt = "Hola Axiss... con el modelo XTTS v2 hago pausas para respirar antes de hablar y modulo cada frase con calidez humana.";
                       setTestPhrase(txt);
                       handleTestVoiceSpeech(txt);
                     }}
                     className="px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-lg text-[10px] text-cyan-300 flex items-center gap-1 transition-colors"
                   >
                     <span>🌸 Calma & Respiración</span>
                   </button>
                 </div>

                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={testPhrase}
                     onChange={(e) => setTestPhrase(e.target.value)}
                     className="flex-1 bg-[#0a0a16] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-pink-500"
                     placeholder="Escribe lo que quieres que diga..."
                   />
                   <button
                     type="button"
                     onClick={() => handleTestVoiceSpeech()}
                     className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                       isPlayingVoice
                         ? 'bg-red-500 text-white'
                         : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500'
                     }`}
                   >
                     {isPlayingVoice ? <Square size={13} /> : <Play size={13} fill="currentColor" />}
                     <span>{isPlayingVoice ? 'Detener' : 'Escuchar'}</span>
                   </button>
                 </div>
               </div>

               {/* Botón Guardar */}
               <button
                 type="button"
                 disabled={savingVoice}
                 onClick={() => {
                   setSavingVoice(true);
                   const saved = saveElizabethVoiceConfig(voiceConfig);
                   socket.emit("update_ai_config", {
                     aiUsername,
                     voiceConfig: saved
                   }, (res: any) => {
                     setSavingVoice(false);
                     if (res?.success || res?.success === undefined) {
                       setSuccessMsg(`¡Voz humana de ${aiUsername} guardada exitosamente!`);
                     } else {
                       alert("Error al guardar voz: " + res?.error);
                     }
                   });
                 }}
                 className="w-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
               >
                 <CheckCircle size={14} />
                 <span>{savingVoice ? 'Guardando Voz...' : `Guardar Voz Humana de ${aiUsername}`}</span>
               </button>
             </div>
           )}

           {/* TAB 4: AUTO-EVOLUCIÓN ACÚSTICA & CLONACIÓN DE VOZ XTTS v2 */}
           {activeTab === 'mimic' && (
             <div className="space-y-4 text-xs">
               <div className="bg-gradient-to-r from-purple-950/40 via-fuchsia-950/40 to-[#181a26] p-3.5 rounded-2xl border border-purple-500/25 flex items-start gap-3">
                 <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
                   <Dna size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                     Auto-Evolución Acústica Cuántica & Clonación XTTS v2
                     <span className="bg-purple-500/30 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-purple-500/40">
                       A Pasos Agigantados
                     </span>
                   </h3>
                   <p className="text-[11px] text-gray-300/80 mt-1 leading-relaxed">
                     Elizabeth analiza pasivamente las notas de voz en salas y chats privados sin interrumpir, asimilando inflexiones, respiraciones y cadencias reales para erradicar cualquier tono robótico.
                   </p>
                 </div>
               </div>

               {/* MEDIDOR PRINCIPAL: NIVEL DE HUMANIZACIÓN */}
               <div className="bg-gradient-to-b from-[#1a1829] to-[#12141f] p-4 rounded-2xl border border-purple-500/30 space-y-3 shadow-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">
                       Nivel de Humanización Orgánica (XTTS v2 + Bark)
                     </span>
                     <h4 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                       <span>{voiceEvolution.stageName}</span>
                       <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                         Etapa {voiceEvolution.evolutionStage}/5
                       </span>
                     </h4>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                       {voiceEvolution.humanizationLevel}%
                     </span>
                     <span className="text-[10px] text-gray-400 block font-medium">Naturalidad Real</span>
                   </div>
                 </div>

                 {/* Barra de Progreso Luminosa */}
                 <div className="w-full bg-[#0a0a14] rounded-full h-3 p-0.5 border border-white/10 relative overflow-hidden">
                   <div 
                     className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-700 shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                     style={{ width: `${Math.min(100, Math.max(10, voiceEvolution.humanizationLevel))}%` }}
                   />
                 </div>

                 {/* Métricas Rápidas */}
                 <div className="grid grid-cols-3 gap-2 pt-1">
                   <div className="bg-[#0a0a14]/60 p-2 rounded-xl border border-white/5 text-center">
                     <span className="text-[9px] text-gray-400 uppercase font-semibold">Audios Asimilados</span>
                     <p className="text-base font-black text-purple-300 mt-0.5">{voiceEvolution.totalAudiosAbsorbed || 0}</p>
                   </div>
                   <div className="bg-[#0a0a14]/60 p-2 rounded-xl border border-white/5 text-center">
                     <span className="text-[9px] text-gray-400 uppercase font-semibold">Perfiles Extraídos</span>
                     <p className="text-base font-black text-cyan-300 mt-0.5">{Object.keys(acousticVault).length}</p>
                   </div>
                   <div className="bg-[#0a0a14]/60 p-2 rounded-xl border border-white/5 text-center">
                     <span className="text-[9px] text-gray-400 uppercase font-semibold">Ritmo Activo</span>
                     <p className="text-[11px] font-bold text-pink-300 mt-1 truncate">
                       {voiceEvolution.learningPace === 'pasos_agigantados' ? 'Agigantado 🚀' : voiceEvolution.learningPace === 'rapido' ? 'Rápido ⚡' : 'Normal 🌿'}
                     </p>
                   </div>
                 </div>
               </div>

               {/* RASGOS ACÚSTICOS ASIMILADOS */}
               <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 space-y-2">
                 <span className="font-bold text-gray-200 block text-xs flex items-center justify-between">
                   <span>Rasgos Acústicos Orgánicos Activos</span>
                   <span className="text-[10px] text-purple-400 font-normal">Asimilación Biomecánica</span>
                 </span>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-purple-500/20 flex items-center gap-2">
                     <span className="text-sm">🌬️</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Respiración Sutil</span>
                       <span className="text-[9px] text-purple-300">Pausas pre-habla Bark</span>
                     </div>
                   </div>

                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-pink-500/20 flex items-center gap-2">
                     <span className="text-sm">🎭</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Curva Melódica</span>
                       <span className="text-[9px] text-pink-300">Entonación modulada</span>
                     </div>
                   </div>

                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-cyan-500/20 flex items-center gap-2">
                     <span className="text-sm">💓</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Calidez Viva</span>
                       <span className="text-[9px] text-cyan-300">Anti-robótico plano</span>
                     </div>
                   </div>

                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                     <span className="text-sm">😊</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Inflexión de Risa</span>
                       <span className="text-[9px] text-emerald-300">Risas espontáneas</span>
                     </div>
                   </div>

                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-amber-500/20 flex items-center gap-2">
                     <span className="text-sm">⏱️</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Micropausas XTTS</span>
                       <span className="text-[9px] text-amber-300">Cadencia humana</span>
                     </div>
                   </div>

                   <div className="bg-[#0a0a14] p-2 rounded-xl border border-indigo-500/20 flex items-center gap-2">
                     <span className="text-sm">🧬</span>
                     <div>
                       <span className="font-bold text-gray-200 block leading-tight">Vocal Fry Limpio</span>
                       <span className="text-[9px] text-indigo-300">Filtro de artefactos</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* CONTROL DE RITMO Y SALTO CUÁNTICO */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-3">
                 <div className="flex items-center justify-between">
                   <div>
                     <span className="font-bold text-gray-200 block text-xs">Ritmo de Auto-Evolución Acústica</span>
                     <p className="text-[11px] text-gray-400">¿Qué tan rápido debe humanizar su voz con cada audio?</p>
                   </div>
                   <div className="flex gap-1 bg-[#0a0a14] p-1 rounded-xl border border-white/10">
                     <button
                       type="button"
                       onClick={() => handleChangePace('normal')}
                       className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                         voiceEvolution.learningPace === 'normal'
                           ? 'bg-purple-600 text-white shadow-sm'
                           : 'text-gray-400 hover:text-white'
                       }`}
                     >
                       Normal
                     </button>
                     <button
                       type="button"
                       onClick={() => handleChangePace('rapido')}
                       className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                         voiceEvolution.learningPace === 'rapido'
                           ? 'bg-pink-600 text-white shadow-sm'
                           : 'text-gray-400 hover:text-white'
                       }`}
                     >
                       Rápido
                     </button>
                     <button
                       type="button"
                       onClick={() => handleChangePace('pasos_agigantados')}
                       className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                         voiceEvolution.learningPace === 'pasos_agigantados'
                           ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-sm'
                           : 'text-gray-400 hover:text-white'
                       }`}
                     >
                       🚀 Agigantado
                     </button>
                   </div>
                 </div>

                 {/* Botón Salto Cuántico Axiss */}
                 <div className="pt-1">
                   <button
                     type="button"
                     disabled={isLeaping}
                     onClick={() => handleInstantLeap(15)}
                     className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                   >
                     <Zap size={14} className={isLeaping ? 'animate-bounce' : 'text-yellow-300'} />
                     <span>
                       {isLeaping ? 'Acelerando Prosodia Cuántica...' : '⚡ Provocar Salto Cuántico Inmediato (+15% Naturalidad XTTS v2)'}
                     </span>
                   </button>
                 </div>
               </div>

               {/* SWITCH APRENDIZAJE PASIVO */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                 <div>
                   <span className="font-bold text-gray-200 block text-xs">
                     Aprendizaje Silencioso de Notas de Voz
                   </span>
                   <p className="text-[11px] text-gray-400 mt-0.5">
                     Aprender de los audios de la sala y chats privados en segundo plano sin interrumpir.
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={handleTogglePassiveLearning}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                     voiceLearningSettings.passiveLearningEnabled ? 'bg-purple-600' : 'bg-gray-700'
                   }`}
                 >
                   <span
                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                       voiceLearningSettings.passiveLearningEnabled ? 'translate-x-6' : 'translate-x-1'
                     }`}
                   />
                 </button>
               </div>

               {/* ESTUDIO DE CLONACIÓN DE VOZ XTTS v2 */}
               <div className="bg-gradient-to-b from-[#191929] to-[#131422] p-4 rounded-2xl border border-purple-500/25 space-y-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
                       <Mic size={15} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white text-xs">Estudio de Clonación de Voz XTTS v2</h4>
                       <p className="text-[10px] text-gray-400">Sube un archivo de voz o grábate directamente para clonar una voz.</p>
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
                       placeholder="Ej: Axiss, Amigo Joven, Abuelo Sabio..."
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
                       <span>{isRecordingClone ? 'Detener Grabación' : cloneAudioBase64 ? '✓ Muestra Lista' : 'Grabar Muestra'}</span>
                     </button>

                     {/* Subir archivo de audio */}
                     <label className="p-2.5 rounded-xl border border-white/10 bg-[#0a0a14] hover:bg-white/5 text-gray-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all">
                       <Upload size={14} />
                       <span>Subir Audio (.mp3/.wav)</span>
                       <input
                         type="file"
                         accept="audio/*"
                         onChange={handleFileUploadClone}
                         className="hidden"
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
                     <span>{isCloning ? 'Clonando Voz con XTTS v2...' : `🧬 Clonar Voz "${cloneName || 'Personalizada'}"`}</span>
                   </button>
                 </div>
               </div>

               {/* PERFILES VOCALES EXTRAÍDOS (BANCO DE MÍMICA) */}
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="font-bold text-gray-200 text-xs">
                     Perfiles Vocales Extraídos ({Object.keys(acousticVault).length})
                   </label>
                   <button
                     type="button"
                     onClick={() => {
                       fetchAcousticVault();
                       fetchVoiceEvolution();
                     }}
                     className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                   >
                     <RefreshCw size={11} className={loadingVault ? 'animate-spin' : ''} />
                     Actualizar
                   </button>
                 </div>

                 {Object.keys(acousticVault).length === 0 ? (
                   <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/5 text-center text-gray-400 text-xs">
                     <Mic size={24} className="mx-auto mb-1.5 opacity-40 text-purple-400" />
                     <p>Aún no hay audios analizados en el banco.</p>
                     <p className="text-[10px] text-gray-500 mt-1">
                       Envía un audio en el chat global o usa el clonador arriba para registrar una voz.
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                     {Object.entries(acousticVault).map(([user, data]: [string, any]) => {
                       const isBeingMimicked = voiceLearningSettings.activeMimicUsername === user;
                       return (
                         <div
                           key={user}
                           className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                             isBeingMimicked
                               ? 'bg-purple-500/15 border-purple-500/50 shadow-sm'
                               : 'bg-[#181a26] border-white/5'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                                 {user.slice(0, 2).toUpperCase()}
                               </div>
                               <div>
                                 <span className="font-bold text-white text-xs">{user}</span>
                                 <span className="text-[10px] text-gray-400 ml-2">
                                   ({data.sampleCount || 1} audio{(data.sampleCount || 1) > 1 ? 's' : ''})
                                 </span>
                               </div>
                             </div>

                             <div className="flex gap-1.5">
                               <button
                                 type="button"
                                 onClick={() => {
                                   handleTestVoiceSpeech(`Hola, aquí Elizabeth imitando la voz y el estilo aprendido de ${user}.`);
                                 }}
                                 className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1"
                               >
                                 <Play size={10} fill="currentColor" /> Probar
                               </button>

                               <button
                                 type="button"
                                 onClick={() => handleSetMimicUser(user)}
                                 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                   isBeingMimicked
                                     ? 'bg-purple-600 text-white shadow-sm'
                                     : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                                 }`}
                               >
                                 {isBeingMimicked ? '✓ Imitando Activo' : 'Imitar Voz'}
                               </button>
                             </div>
                           </div>

                           <div className="grid grid-cols-3 gap-1 bg-[#0a0a14] p-2 rounded-xl text-[10px] text-gray-400 font-mono">
                             <div>Género: <span className="text-gray-200">{data.gender || 'neutral'}</span></div>
                             <div>Tono: <span className="text-pink-300">{(data.pitch || 1).toFixed(2)}x</span></div>
                             <div>Cadencia: <span className="text-purple-300">{(data.rate || 1).toFixed(2)}x</span></div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>

               {/* REGISTRO EN VIVO DE AUTO-EVOLUCIÓN (FEED) */}
               {voiceEvolution.logs && voiceEvolution.logs.length > 0 && (
                 <div className="bg-[#181a26] p-3 rounded-2xl border border-white/5 space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                       <Sparkles size={12} className="text-pink-400" />
                       Registro de Asimilación Orgánica Reciente
                     </span>
                     <span className="text-[10px] text-pink-400 font-mono font-bold">
                       +{voiceEvolution.logs.reduce((acc, l) => acc + (l.naturalnessDelta || 0), 0)}% ganado
                     </span>
                   </div>
                   <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                     {voiceEvolution.logs.slice().reverse().map((log) => (
                       <div key={log.id} className="bg-[#0a0a14] p-2 rounded-xl border border-white/5 flex items-start justify-between text-[10px]">
                         <div>
                           <span className="font-bold text-purple-300">@{log.sourceUsername}:</span>{' '}
                           <span className="text-gray-300">{log.detail || log.title}</span>
                         </div>
                         <span className="font-mono font-bold text-emerald-400 ml-2 shrink-0">
                           +{log.naturalnessDelta}%
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
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
