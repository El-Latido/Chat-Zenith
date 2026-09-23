import React, { useState, useEffect } from 'react';
import { Bot, X, CheckCircle, Key, Zap, Eye, EyeOff, Radio, RefreshCw, AlertCircle, ShieldCheck, Sparkles, Trash2, Volume2, VolumeX, Mic, Sliders, Play, Square } from 'lucide-react';
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
  isSpeaking 
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
  const [activeTab, setActiveTab] = useState<'tokens' | 'profile' | 'voice' | 'dj'>('tokens');
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4">
       <div className="bg-[#12141c] p-5 sm:p-7 rounded-3xl w-full max-w-lg shadow-2xl relative border border-fuchsia-500/25 max-h-[92vh] flex flex-col">
         {/* Botón cerrar */}
         <button 
           onClick={() => setAdminConfigAiOpen(false)} 
           className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-10"
         >
            <X size={20} />
         </button>

         {/* Cabecera */}
         <div className="mb-4">
           <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-400 flex items-center gap-2">
              <Bot size={24} className="text-fuchsia-400" />
              Panel de Administración de {aiUsername}
           </h2>
           <p className="text-xs text-gray-400 mt-1">
             Solo accesible por el Administrador Supremo (Axiss).
           </p>
         </div>

         {/* Selector de pestañas */}
         <div className="grid grid-cols-4 bg-[#0a0a14] p-1 rounded-2xl border border-white/5 gap-1 mb-4">
           <button
             type="button"
             onClick={() => setActiveTab('tokens')}
             className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all ${
               activeTab === 'tokens'
                 ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Key size={13} className={activeTab === 'tokens' ? 'text-amber-400' : ''} />
             <span className="hidden sm:inline">APIs</span>
             <span className="sm:hidden">APIs</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('profile')}
             className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all ${
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
             className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all ${
               activeTab === 'voice'
                 ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
             }`}
           >
             <Volume2 size={13} className={activeTab === 'voice' ? 'text-pink-400' : ''} />
             <span>Voz</span>
           </button>

           <button
             type="button"
             onClick={() => setActiveTab('dj')}
             className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all ${
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
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 font-medium text-xs animate-in fade-in">
               <CheckCircle size={18} className="shrink-0" />
               <p>{successMsg}</p>
            </div>
         )}

         {/* Contenido scrolleable */}
         <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
           
           {/* TAB 1: TOKENS & APIS */}
           {activeTab === 'tokens' && (
             <div className="space-y-4">
               {/* Banner de Seguridad & Persistencia en Base de Datos */}
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
                 <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                 <div>
                   <span className="font-bold text-emerald-200">Almacenamiento seguro en la Base de Datos:</span>
                   <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
                     Las claves de API se guardan en la base de datos Firestore y <strong>no en el código fuente</strong>. Puedes poner tu token, modificarlo o eliminarlo libremente sin que Git ni GitHub bloqueen tus commits.
                   </p>
                 </div>
               </div>

               {/* Resumen de estado actual */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                 <div>
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                     <span className="text-xs font-bold text-gray-200">Proveedor en uso:</span>
                     <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                       {activeProviderName === 'gemini' ? 'Google Gemini' : (groqBackupName || 'Groq Backup')}
                     </span>
                   </div>
                   <p className="text-[11px] text-gray-400 mt-1">
                     Conmutación bidireccional activa: si se acota un token, usa el otro de inmediato.
                   </p>
                 </div>
                 <ShieldCheck size={26} className="text-cyan-400 opacity-80" />
               </div>

               {/* Nombre de la API de Respaldo */}
               <div className="bg-[#181a26] p-4 rounded-2xl border border-white/5 space-y-3">
                 <div>
                   <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                     <Zap size={14} className="text-amber-400" />
                     Nombre de la API de Respaldo
                   </label>
                   <p className="text-[11px] text-gray-400 mb-2">
                     Identificador del respaldo para los logs y la conmutación (por ej. ChatLiz-Groq-Backup).
                   </p>
                   <input
                     type="text"
                     value={groqBackupName}
                     onChange={(e) => setGroqBackupName(e.target.value)}
                     placeholder="ChatLiz-Groq-Backup"
                     className="w-full bg-[#0a0a14] px-3 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors font-mono"
                   />
                 </div>

                 {/* Token de la API de Respaldo (Groq) */}
                 <div>
                   <label className="text-xs font-bold text-amber-300 flex items-center justify-between mb-1">
                     <span className="flex items-center gap-1.5">
                       <Key size={14} className="text-amber-400" />
                       Token / API Key de Respaldo (Groq Token)
                     </span>
                     <div className="flex items-center gap-2">
                       {groqBackupKey ? (
                         <button
                           type="button"
                           onClick={() => {
                             setGroqBackupKey('');
                             setTestResult(null);
                           }}
                           className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                           title="Eliminar clave"
                         >
                           <Trash2 size={11} />
                           <span>Eliminar</span>
                         </button>
                       ) : null}
                       <button
                         type="button"
                         onClick={() => setShowGroqKey(!showGroqKey)}
                         className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                       >
                         {showGroqKey ? <EyeOff size={13} /> : <Eye size={13} />}
                         <span>{showGroqKey ? 'Ocultar' : 'Ver token'}</span>
                       </button>
                     </div>
                   </label>
                   <div className="relative">
                     <input
                       type={showGroqKey ? 'text' : 'password'}
                       value={groqBackupKey}
                       onChange={(e) => setGroqBackupKey(e.target.value)}
                       placeholder="Pega aquí la API Key"
                       className="w-full bg-[#0a0a14] px-3 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors font-mono pr-24"
                     />
                     <button
                       type="button"
                       disabled={testingGroq}
                       onClick={() => handleTestToken('groq')}
                       className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg text-[11px] border border-amber-500/30 flex items-center gap-1 transition-all disabled:opacity-50"
                     >
                       {testingGroq ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                       <span>Probar</span>
                     </button>
                   </div>
                 </div>
               </div>

               {/* Token de Gemini (Google AI) */}
               <div className="bg-[#181a26] p-4 rounded-2xl border border-white/5 space-y-3">
                 <div>
                   <label className="text-xs font-bold text-cyan-300 flex items-center justify-between mb-1">
                     <span className="flex items-center gap-1.5">
                       <Sparkles size={14} className="text-cyan-400" />
                       API Key de Google Gemini (Opcional / Personalizada)
                     </span>
                     <div className="flex items-center gap-2">
                       {geminiKey ? (
                         <button
                           type="button"
                           onClick={() => {
                             setGeminiKey("");
                             setTestResult(null);
                           }}
                           className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                           title="Eliminar clave"
                         >
                           <Trash2 size={11} />
                           <span>Eliminar</span>
                         </button>
                       ) : null}
                       <button
                       type="button"
                       onClick={() => setShowGeminiKey(!showGeminiKey)}
                       className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                     >
                       {showGeminiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                       <span>{showGeminiKey ? 'Ocultar' : 'Ver token'}</span>
                     </button>
                      </div>
                    </label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Si la dejas vacía, usará la clave predeterminada del servidor.
                   </p>
                   <div className="relative">
                     <input
                       type={showGeminiKey ? 'text' : 'password'}
                       value={geminiKey}
                       onChange={(e) => setGeminiKey(e.target.value)}
                       placeholder="AIzaSy... (o vacía para usar la del servidor)"
                       className="w-full bg-[#0a0a14] px-3 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono pr-24"
                     />
                     <button
                       type="button"
                       disabled={testingGemini}
                       onClick={() => handleTestToken('gemini')}
                       className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-lg text-[11px] border border-cyan-500/30 flex items-center gap-1 transition-all disabled:opacity-50"
                     >
                       {testingGemini ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       <span>Probar</span>
                     </button>
                   </div>
                 </div>
               </div>

               {/* Prioridad de Proveedores */}
               <div className="bg-[#181a26] p-4 rounded-2xl border border-white/5 space-y-2">
                 <label className="text-xs font-bold text-gray-200">Prioridad Inicial del Modelo</label>
                 <div className="grid grid-cols-2 gap-2">
                   <button
                     type="button"
                     onClick={() => setPreferredProvider('gemini')}
                     className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                       preferredProvider === 'gemini'
                         ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                         : 'bg-[#0a0a14] border-white/5 text-gray-400 hover:text-white'
                     }`}
                   >
                     <div className="font-bold flex items-center gap-1.5 mb-1">
                       <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                       Gemini Primero
                     </div>
                     <p className="text-[10px] text-gray-400">Groq actúa de respaldo si Gemini se queda sin tokens.</p>
                   </button>

                   <button
                     type="button"
                     onClick={() => setPreferredProvider('groq')}
                     className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                       preferredProvider === 'groq'
                         ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                         : 'bg-[#0a0a14] border-white/5 text-gray-400 hover:text-white'
                     }`}
                   >
                     <div className="font-bold flex items-center gap-1.5 mb-1">
                       <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                       Groq Primero
                     </div>
                     <p className="text-[10px] text-gray-400">Gemini actúa de respaldo si Groq agota su límite.</p>
                   </button>
                 </div>
               </div>

               {/* Resultado del test */}
               {testResult && (
                 <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                   testResult.success
                     ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                     : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                 }`}>
                   {testResult.success ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                   <div>
                     <p className="font-bold uppercase tracking-wider text-[10px]">{testResult.provider === 'groq' ? groqBackupName : 'Gemini'}</p>
                     <p>{testResult.msg}</p>
                   </div>
                 </div>
               )}

               {/* Botón de Guardado de Tokens */}
               <button
                 type="button"
                 disabled={savingTokens}
                 onClick={handleSaveApiTokens}
                 className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {savingTokens ? <RefreshCw size={15} className="animate-spin" /> : <Key size={15} />}
                 <span>Guardar Tokens y Configuración de IA</span>
               </button>
             </div>
           )}

           {/* TAB 2: PERFIL & VOZ */}
           {activeTab === 'profile' && (
             <div className="space-y-4">
               <div className="flex flex-col items-center mb-4">
                 <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-fuchsia-400 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-24 h-24 rounded-full border border-fuchsia-400/50 p-1 relative z-10 bg-[#0a0a16] shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center overflow-hidden [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                       {aiProfileForm.profilePic ? (
                          <img referrerPolicy="no-referrer" src={aiProfileForm.profilePic} alt="avatar" className="w-full h-full object-cover rounded-full" />
                       ) : (
                          <Bot size={36} className="text-fuchsia-400" />
                       )}
                       <input 
                         type="file" 
                         title="Subir foto de perfil IA" 
                         className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                         accept="image/*" 
                         onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                const MAX_SIZE = 400;

                                if (width > height) {
                                  if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                  }
                                } else {
                                  if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', profilePic: dataUrl});
                              };
                              img.src = event.target?.result as string;
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
                   let callbackCalled = false;
                   const timeoutId = setTimeout(() => {
                       if (!callbackCalled) {
                           setSuccessMsg('Guardado localmente (Timeout del servidor)');
                       }
                   }, 4000);

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
                       callbackCalled = true;
                       clearTimeout(timeoutId);
                       if (res.success || res.success === undefined) {
                           setSuccessMsg(`¡Perfil de ${aiUsername} guardado con éxito!`);
                       } else {
                           alert("Error: " + res.error);
                       }
                   });
                 }}
                 className="w-full mt-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_4px_14px_rgba(217,70,239,0.3)]"
               >
                 Guardar Perfil de {aiUsername}
               </button>
             </div>
           )}

           {/* TAB: VOZ & SINTETIZADOR DE ELIZABETH */}
           {activeTab === 'voice' && (
             <div className="space-y-4 text-xs">
               {/* Header informativo */}
               <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-[#181a26] p-3.5 rounded-2xl border border-pink-500/25 flex items-start gap-3">
                 <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0 mt-0.5">
                   <Volume2 size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                     Sintetizador de Voz de {aiUsername}
                     <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                       HD Multi-Voz
                     </span>
                   </h3>
                   <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                     Elige el arquetipo de voz (femenina, adolescente, masculina, anciano, cuántica) y ajusta libremente el tono (grave o agudo) y la velocidad.
                   </p>
                 </div>
               </div>

               {/* Arquetipos / Presets de Voz */}
               <div className="space-y-2">
                 <label className="font-bold text-gray-200 flex items-center justify-between text-xs">
                   <span>Arquetipos y Presets de Voz</span>
                   <span className="text-[11px] text-pink-400 font-normal">8 perfiles disponibles</span>
                 </label>
                 <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
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
                           <span>Tono: {arch.pitch.toFixed(2)}x</span>
                           <span>Vel: {arch.rate.toFixed(2)}x</span>
                         </div>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Ajustes Acústicos (Sliders de Tono, Velocidad, Volumen) */}
               <div className="bg-[#181a26] p-3.5 rounded-2xl border border-white/5 space-y-3.5">
                 <div className="flex items-center justify-between">
                   <span className="font-bold text-gray-200 flex items-center gap-1.5">
                     <Sliders size={13} className="text-pink-400" />
                     Ajuste Fino de Tono & Frecuencia
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

                 {/* Slider de Tono / Pitch */}
                 <div className="space-y-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-gray-300">Tono (Pitch): {voiceConfig.pitch < 0.9 ? 'Grave' : voiceConfig.pitch > 1.3 ? 'Agudo' : 'Medio'}</span>
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
                   <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                     <span>0.5x (Voz Grave / Anciano)</span>
                     <span>1.0x (Normal)</span>
                     <span>2.0x (Agudo / Juvenil)</span>
                   </div>
                 </div>

                 {/* Slider de Velocidad / Rate */}
                 <div className="space-y-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-gray-300">Velocidad (Cadencia)</span>
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
                   <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                     <span>0.5x (Lento y pausado)</span>
                     <span>1.0x (Natural)</span>
                     <span>1.8x (Rápido)</span>
                   </div>
                 </div>

                 {/* Slider de Volumen */}
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

               {/* Voz del Sistema / Dispositivo */}
               <div className="space-y-1.5">
                 <label className="font-bold text-gray-300 flex items-center justify-between text-xs">
                   <span>Motor de Voz del Sistema</span>
                   <span className="text-[10px] text-gray-400">{systemVoices.length} voces detectadas</span>
                 </label>
                 <select
                   value={voiceConfig.voiceURI}
                   onChange={(e) => setVoiceConfig({ ...voiceConfig, voiceURI: e.target.value })}
                   className="w-full bg-[#0a0a16] p-2.5 rounded-xl border border-white/10 outline-none focus:border-pink-500 text-white text-xs"
                 >
                   <option value="">Voz Óptima Automática (Recomendado)</option>
                   {systemVoices.map((v) => (
                     <option key={v.voiceURI} value={v.voiceURI}>
                       {v.name} ({v.lang}) {v.lang.toLowerCase().startsWith('es') ? '★ Español' : ''}
                     </option>
                   ))}
                 </select>
               </div>

               {/* Tono Emocional */}
               <div className="space-y-1.5">
                 <label className="font-bold text-gray-300 text-xs">Matiz de Expresión</label>
                 <div className="grid grid-cols-5 gap-1.5">
                   {(['calida', 'seria', 'jovial', 'suave', 'energetica'] as const).map((tone) => (
                     <button
                       key={tone}
                       type="button"
                       onClick={() => setVoiceConfig({ ...voiceConfig, voiceTone: tone })}
                       className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold capitalize border transition-all text-center ${
                         voiceConfig.voiceTone === tone
                           ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 border-pink-500/50 text-white'
                           : 'bg-[#181a26] border-white/5 text-gray-400 hover:text-white'
                       }`}
                     >
                       {tone}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Interruptor Auto-Play en Chat */}
               <label className="flex items-center justify-between p-3 rounded-xl bg-[#181a26] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                 <div className="flex flex-col">
                   <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                     <Mic size={13} className="text-pink-400" />
                     Auto-reproducir voz de {aiUsername}
                   </span>
                   <span className="text-[10px] text-gray-400">
                     Lee automáticamente en voz alta los mensajes que envíe {aiUsername} al chat.
                   </span>
                 </div>
                 <input
                   type="checkbox"
                   checked={voiceConfig.autoPlay}
                   onChange={(e) => setVoiceConfig({ ...voiceConfig, autoPlay: e.target.checked })}
                   className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                 />
               </label>

               {/* Botones de Prueba en Vivo y Guardado */}
               <div className="pt-2 flex flex-col gap-2">
                 <button
                   type="button"
                   onClick={() => {
                     if (isPlayingVoice) {
                       stopSpeaking();
                       setIsPlayingVoice(false);
                       return;
                     }
                     setIsPlayingVoice(true);
                     const samplePhrases = [
                       `¡Hola Axiss! Soy ${aiUsername}, tu compañera y administradora de ChatLiz. ¿Cómo se escucha mi tono de voz ahora?`,
                       `¡Me encanta esta voz! Puedes cambiar mi tono a más agudo, grave, adolescente o anciano cuando desees.`,
                       `Sistemas cuánticos sincronizados. Lista para cuidar y animar el chat contigo.`
                     ];
                     const selectedPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
                     speakElizabethMessage(selectedPhrase, voiceConfig, {
                       onStart: () => setIsPlayingVoice(true),
                       onEnd: () => setIsPlayingVoice(false),
                       onError: () => setIsPlayingVoice(false),
                     });
                   }}
                   className={`w-full p-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
                     isPlayingVoice
                       ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                       : 'bg-white/10 text-white hover:bg-white/15 border-white/10'
                   }`}
                 >
                   {isPlayingVoice ? (
                     <>
                       <Square size={14} className="fill-rose-400 text-rose-400" />
                       <span>Detener Prueba de Voz</span>
                     </>
                   ) : (
                     <>
                       <Play size={14} className="fill-pink-400 text-pink-400" />
                       <span>Probar Voz en Vivo ({voiceConfig.pitch.toFixed(2)}x)</span>
                     </>
                   )}
                 </button>

                 <button
                   type="button"
                   disabled={savingVoice}
                   onClick={() => {
                     setSavingVoice(true);
                     saveElizabethVoiceConfig(voiceConfig);
                     setAiProfileForm((prev: any) => ({ ...prev, voiceConfig }));
                     socket.emit("update_ai_config", {
                       aiUsername,
                       voiceConfig,
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
                       setSavingVoice(false);
                       if (res?.success || res?.success === undefined) {
                         setSuccessMsg(`¡Configuración de voz y tono de ${aiUsername} guardada con éxito!`);
                       } else {
                         alert("Error al guardar: " + res?.error);
                       }
                     });
                   }}
                   className="w-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
                 >
                   <CheckCircle size={14} />
                   <span>{savingVoice ? 'Guardando Voz...' : `Guardar Voz de ${aiUsername}`}</span>
                 </button>
               </div>
             </div>
           )}

           {/* TAB 3: DJ & CONTROL */}
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
