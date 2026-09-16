import React, { useState, useEffect } from 'react';
import { EyeOff, Settings, X, LogOut, Bot, Palette, Lock, User, Globe, MessageSquare } from 'lucide-react';
import { socket } from '../socket';
import { UserObj } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface ProfileConfigModalProps {
  user: UserObj & { password?: string };
  setUser: React.Dispatch<React.SetStateAction<UserObj & { password?: string, securityEmail?: string }>>;
  setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAdminConfigAiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  usersOnline: UserObj[];
  setAiProfileForm: React.Dispatch<React.SetStateAction<{ profilePic: string; statusMessage: string; systemInstruction: string; }>>;
  customFrames: Record<number, string>;
}

export function ProfileConfigModal({
  user, setUser, setIsConfigOpen, setAdminConfigAiOpen, usersOnline, setAiProfileForm, customFrames
}: ProfileConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'apariencia' | 'idioma' | 'cuenta'>('perfil');
  const [incognito, setIncognito] = useState((user as any).incognito || false);
  const [comentario, setComentario] = useState(user.statusMessage || '');
  const [pais, setPais] = useState(user.pais_idioma || 'es');
  const [password, setPassword] = useState(user.password || '');
  const [fotoURL, setFotoURL] = useState(user.profilePic || '');
  const [frameId, setFrameId] = useState<number | undefined>(user.frameId);
  const [isFriendsPublic, setIsFriendsPublic] = useState(user.is_friends_public || false);
  const [backgroundBase64, setBackgroundBase64] = useState(user.preferred_background || '');
  const [preferredTheme, setPreferredTheme] = useState(user.preferred_theme || localStorage.getItem("chatliz_theme") || 'mecha_celestial');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [bubbleColor, setBubbleColor] = useState(user.bubbleColor || '#121B2A');
  const [bubbleBorder, setBubbleBorder] = useState(user.bubbleBorder || 'border-[#5A52A5]/30');
  const [bubbleShape, setBubbleShape] = useState(user.bubbleShape || 'rounded-2xl rounded-tr-sm');
  const [bubbleTexture, setBubbleTexture] = useState(user.bubbleTexture || 'none');

  useEffect(() => {
    const match = (user.bubbleColor || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        setBubbleColor(`#${r}${g}${b}`);
    }
  }, [user.bubbleColor]);


  const toggleIncognito = () => {
     const nextVal = !incognito;
     setIncognito(nextVal);
     socket.emit("update_incognito", nextVal);
  };

  const handleSaveProfile = async () => {
    try {
      setSaveStatus("Guardando...");
      
      const r = parseInt(bubbleColor.slice(1,3), 16) || 18;
      const g = parseInt(bubbleColor.slice(3,5), 16) || 27;
      const b = parseInt(bubbleColor.slice(5,7), 16) || 42;
      const finalBubbleColor = `rgba(${r}, ${g}, ${b}, 0.95)`;

      const savePromise = setDoc(doc(db, "users", user.username!), {
        password: password,
        profilePic: fotoURL,
        frameId: frameId,
        statusMessage: comentario,
        pais_idioma: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: backgroundBase64,
        preferred_theme: preferredTheme,
        bubbleColor: finalBubbleColor,
        bubbleBorder: bubbleBorder,
        bubbleShape: bubbleShape,
        bubbleTexture: bubbleTexture,
        updatedAt: new Date()
      }, { merge: true });

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout al contactar con el servidor")), 10000));
      await Promise.race([savePromise, timeoutPromise]);
      
      localStorage.setItem("chatliz_theme", preferredTheme);
      window.dispatchEvent(new CustomEvent("chatliz_theme_changed", { detail: preferredTheme }));

      setUser(prev => ({
          ...prev,
          password,
          profilePic: fotoURL,
          frameId,
          statusMessage: comentario,
          pais_idioma: pais,
          is_friends_public: isFriendsPublic,
          preferred_background: backgroundBase64,
          preferred_theme: preferredTheme,
          bubbleColor: finalBubbleColor,
          bubbleBorder,
          bubbleShape,
          bubbleTexture
      }));

      socket.emit("broadcast_profile_change", {
        username: user.username,
        statusMessage: comentario,
        profilePic: fotoURL,
        frameId: frameId,
        countryLanguage: pais,
        is_friends_public: isFriendsPublic,
        preferred_background: backgroundBase64,
        preferred_theme: preferredTheme
      });

      setSaveStatus("¡Guardado correctamente!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus("Error al guardar.");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
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
          setter(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity pointer-events-auto" 
        onClick={() => setIsConfigOpen(false)}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#12141c] to-[#0a0a0f] rounded-3xl shadow-2xl border border-white/10 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-10 sm:mt-0 mb-10 sm:mb-0">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <div className="hidden md:flex items-center gap-3 px-3 py-4 mb-2">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
               <Settings className="text-white" size={20} />
             </div>
             <div>
               <h2 className="text-white font-bold text-lg leading-none">Ajustes</h2>
               <p className="text-xs text-gray-400 mt-1">Configura tu experiencia</p>
             </div>
          </div>
          
          <TabButton active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={<User size={18} />} label="Perfil" />
          <TabButton active={activeTab === 'idioma'} onClick={() => setActiveTab('idioma')} icon={<Globe size={18} />} label="Idioma y Sala" />
          <TabButton active={activeTab === 'apariencia'} onClick={() => setActiveTab('apariencia')} icon={<Palette size={18} />} label="Apariencia" />
          <TabButton active={activeTab === 'cuenta'} onClick={() => setActiveTab('cuenta')} icon={<Lock size={18} />} label="Privacidad y Cuenta" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-[70vh] md:h-[600px]">
          <div className="p-4 flex justify-end md:hidden border-b border-white/5">
             <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full">
               <X size={20} />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTab === 'perfil' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col items-center justify-center gap-4">
                   <div className="relative group cursor-pointer">
                      <div className="w-28 h-28 rounded-full border-4 border-cyan-500/30 overflow-hidden relative">
                         <img 
                           referrerPolicy="no-referrer" 
                           src={fotoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`} 
                           className="w-full h-full object-cover" 
                           alt="Profile" 
                         />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-bold text-white tracking-wider">CAMBIAR</span>
                         </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, setFotoURL)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                   </div>
                   <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                </div>

                <div className="space-y-3">
                   <label className="text-sm font-semibold text-gray-400 ml-1">Marco de Perfil</label>
                   
                   <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-3 bg-black/20 rounded-2xl border border-white/5">
                      <div 
                         className={`relative w-12 h-12 rounded-full cursor-pointer flex items-center justify-center border-2 ${!frameId ? 'border-cyan-400 bg-white/10' : 'border-transparent hover:bg-white/5'}`}
                         onClick={() => setFrameId(undefined)}
                         title="Sin Marco"
                      >
                         <X size={20} className="text-gray-400" />
                      </div>
                      {Array.from({ length: 40 }, (_, i) => i + 1).map(id => (
                         <div 
                            key={id}
                            className={`relative w-12 h-12 rounded-full cursor-pointer border-2 transition-all group ${frameId === id ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-transparent hover:scale-105 hover:bg-white/5'}`}
                            onClick={() => setFrameId(id)}
                            title={`Marco ${id}`}
                         >
                            <img 
                               src={customFrames[id] || `/frames/${id}.png`} 
                               className="w-full h-full object-contain scale-[1.35]"
                               style={customFrames[id] ? undefined : {
                                  WebkitMaskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)',
                                  maskImage: 'radial-gradient(circle closest-side, transparent 74%, black 75%)'
                               }}
                               alt={`Marco ${id}`}
                               onError={(e) => {
                                  // Fallback simple si la imagen no se ha subido aún
                                  (e.target as HTMLImageElement).src = `https://placehold.co/100x100/1a1a24/3a3a4c?text=${id}`;
                                  (e.target as HTMLImageElement).style.maskImage = 'none';
                                  (e.target as any).style.webkitMaskImage = 'none';
                               }}
                            />
                            {user.username === "Axiss" && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = window.prompt(`Ingresa la URL del marco ${id} (deja en blanco para usar el archivo local):`);
                                  if (url !== null) {
                                    socket.emit("set_custom_frame", { id, url });
                                  }
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-[10px] text-white font-bold"
                              >
                                EDIT
                              </button>
                            )}
                         </div>
                      ))}
                   </div>
                   <p className="text-xs text-cyan-400/70 ml-1 bg-cyan-400/10 p-2 rounded-lg border border-cyan-400/20">
                     💡 <b>Tip:</b> Sube tus 40 imágenes de marcos a la carpeta <code className="bg-black/50 px-1 rounded">public/frames/</code> en la barra lateral, nombrándolas <code className="bg-black/50 px-1 rounded">1.png</code> al <code className="bg-black/50 px-1 rounded">40.png</code>.
                   </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Estado o Biografía</label>
                  <input
                    type="text"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Escribe algo sobre ti..."
                    className="w-full bg-black/30 p-4 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors"
                  />
                </div>
              </div>
            )}

            {activeTab === 'idioma' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
                  <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                    <Globe size={18} /> Traducción Automática de Sala
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Al seleccionar un idioma, todos los mensajes de la sala se traducirán automáticamente a tu idioma preferido. Los demás usuarios verán tus mensajes en el idioma que ellos hayan elegido.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Mi Idioma Principal</label>
                  <select 
                    value={pais} 
                    onChange={e => setPais(e.target.value)} 
                    className="w-full bg-black/30 p-4 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="es">Español 🇪🇸</option>
                    <option value="en">English 🇺🇸</option>
                    <option value="pt">Português 🇧🇷</option>
                    <option value="fr">Français 🇫🇷</option>
                    <option value="de">Deutsch 🇩🇪</option>
                    <option value="it">Italiano 🇮🇹</option>
                    <option value="ru">Русский 🇷🇺</option>
                    <option value="ja">日本語 🇯🇵</option>
                    <option value="ko">한국어 🇰🇷</option>
                    <option value="zh">中文 🇨🇳</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'apariencia' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Theme Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Palette size={16} className="text-[#f472b6]" />
                      Tema Visual de la Interfaz
                    </label>
                    <span className="text-xs text-[#f472b6] font-medium bg-[#f472b6]/10 px-2.5 py-0.5 rounded-full border border-[#f472b6]/30">
                      Personalizable
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mecha Celestial Card */}
                    <div
                      onClick={() => setPreferredTheme('mecha_celestial')}
                      className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                        preferredTheme === 'mecha_celestial'
                          ? 'border-[#f472b6] bg-gradient-to-br from-[#24132b] via-[#160c1a] to-[#0f172a] shadow-[0_0_20px_rgba(244,114,182,0.3)]'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <span className="text-sm font-bold text-white">Mecha Celestial</span>
                        </div>
                        {preferredTheme === 'mecha_celestial' && (
                          <span className="text-[11px] font-bold text-[#f472b6] bg-[#f472b6]/20 px-2 py-0.5 rounded-full border border-[#f472b6]/40">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                        Consola de cristal rosa, marcos con filigrana plateada, gemas cian brillantes y burbujas ciruela/esmeralda.
                      </p>
                      
                      {/* Mini preview */}
                      <div className="p-2 rounded-xl bg-black/40 border border-[#94a3b8]/40 flex flex-col gap-1.5 mb-2">
                        <div className="self-start px-2 py-1 rounded-lg bg-[#24132b] border border-[#94a3b8]/60 text-[10px] text-pink-300 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span> Elizabeth
                        </div>
                        <div className="self-end px-2 py-1 rounded-lg bg-[#18443e] border border-[#94a3b8]/60 text-[10px] text-teal-200 font-medium flex items-center gap-1">
                          Tú <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
                        </div>
                      </div>

                      {preferredTheme === 'mecha_celestial' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackgroundBase64('/mecha_celestial_bg.jpg');
                          }}
                          className="w-full py-1.5 bg-[#f472b6]/15 hover:bg-[#f472b6]/25 border border-[#f472b6]/40 rounded-xl text-[11px] text-[#fbcfe8] font-medium transition-colors text-center"
                        >
                          Usar fondo Mecha Celestial
                        </button>
                      )}
                    </div>

                    {/* Cyberpunk Neón Card */}
                    <div
                      onClick={() => setPreferredTheme('default')}
                      className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                        preferredTheme === 'default'
                          ? 'border-cyan-400 bg-gradient-to-br from-[#0a1120] via-[#050811] to-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚡</span>
                          <span className="text-sm font-bold text-white">Cyberpunk Neón</span>
                        </div>
                        {preferredTheme === 'default' && (
                          <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                        Diseño futurista oscuro con acentos neón y líneas tecnológicas estilizadas.
                      </p>
                      {/* Mini preview */}
                      <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 mb-2">
                        <div className="self-start px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium">
                          Mensaje
                        </div>
                        <div className="self-end px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-[10px] text-cyan-300 font-medium">
                          Enviado
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Background */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">Fondo General de la Sala (URL o Archivo)</label>
                  <div className="flex flex-col gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                    <div className="flex gap-3 items-center">
                      {backgroundBase64 ? (
                         backgroundBase64.match(/\.(mp4|webm|ogg)$/i) ? (
                            <div className="h-16 w-16 rounded-xl bg-cyan-900/50 flex items-center justify-center text-xs text-cyan-400 font-bold border border-cyan-500/30">VIDEO</div>
                         ) : (
                            <img referrerPolicy="no-referrer" src={backgroundBase64} className="h-16 w-16 rounded-xl object-cover shadow-lg" alt="Fondo" />
                         )
                      ) : (
                         <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center text-xs text-gray-500 text-center leading-tight p-1">Por defecto (Admin)</div>
                      )}
                      
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setBackgroundBase64)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white text-center">
                            Subir Imagen local
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            const url = window.prompt("Ingresa la URL de una imagen o video (.mp4):");
                            if (url) setBackgroundBase64(url);
                          }}
                          className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl text-sm font-medium transition-colors text-cyan-400 border border-cyan-500/30 text-center"
                        >
                          Usar URL (Imagen/Video)
                        </button>
                      </div>

                      {backgroundBase64 && (
                        <button onClick={() => setBackgroundBase64('')} className="py-2 px-4 h-full bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors self-stretch flex items-center justify-center">
                           Restablecer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <hr className="border-white/5" />

                {/* Bubble Settings */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <MessageSquare size={16} className="text-cyan-400" />
                    Personalizar Mi Burbuja de Chat
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Color de Fondo</label>
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                           <input 
                             type="color" 
                             value={bubbleColor} 
                             onChange={(e) => setBubbleColor(e.target.value)} 
                             className="h-8 w-12 bg-transparent border-0 rounded cursor-pointer" 
                           />
                           <span className="text-xs text-gray-300 font-mono">{bubbleColor}</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Borde</label>
                        <select 
                          value={bubbleBorder} 
                          onChange={e => setBubbleBorder(e.target.value)} 
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="border-transparent">Sin Borde</option>
                            <option value="border-white/10">Sutil Claro</option>
                            <option value="border-[#5A52A5]/30">Morado Suave</option>
                            <option value="border-cyan-500">Cyan Neón</option>
                            <option value="border-pink-500">Rosa Neón</option>
                            <option value="border-green-500">Verde Esmeralda</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Forma de Esquinas</label>
                        <select 
                          value={bubbleShape} 
                          onChange={e => setBubbleShape(e.target.value)} 
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="rounded-2xl rounded-tr-sm">Clásico Chat</option>
                            <option value="rounded-2xl">Suave (2xl)</option>
                            <option value="rounded-md">Cuadrado (md)</option>
                            <option value="rounded-full">Píldora (full)</option>
                            <option value="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm">Hoja</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Efecto Visual</label>
                        <select 
                          value={bubbleTexture} 
                          onChange={e => setBubbleTexture(e.target.value)} 
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="none">Sólido (Liso)</option>
                            <option value="glass">Cristal (Glassmorphism)</option>
                            <option value="glow">Resplandor Exterior (Glow)</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cuenta' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                     <div>
                       <h4 className="text-sm font-bold text-white mb-1">Amigos Públicos</h4>
                       <p className="text-xs text-gray-400">Permite que otros vean tu lista de amigos.</p>
                     </div>
                     <button 
                       onClick={() => setIsFriendsPublic(!isFriendsPublic)} 
                       className={`relative w-12 h-6 rounded-full transition-colors ${isFriendsPublic ? 'bg-cyan-500' : 'bg-gray-600'}`}
                     >
                       <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isFriendsPublic ? 'translate-x-6' : ''}`} />
                     </button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${incognito ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-black/40"}`}>
                            <EyeOff size={24} className={`transition-all duration-300 ${incognito ? "text-white" : "text-gray-500"}`} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Modo Incógnito (Espía)</h4>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Desapareces de la lista, solo puedes usar chat privado.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={incognito} onChange={toggleIncognito} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                </div>


                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h4 className="text-sm font-bold text-white flex items-center gap-2">Personalización de Interfaz</h4>
                   
                   <div>
                       <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Color de Neón Principal</label>
                       <div className="flex gap-2 mt-2">
                           <input type="color" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" 
                               defaultValue={localStorage.getItem("chatliz_neon_color") || "#00f3ff"} 
                               onChange={(e) => {
                                   localStorage.setItem("chatliz_neon_color", e.target.value);
                                   window.dispatchEvent(new Event("chatliz_ui_update"));
                               }} 
                           />
                           <label className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/10 flex-1 cursor-pointer">
                              <span className="text-sm text-white/80 font-bold">Neón Arcoiris (Animado)</span>
                              <input type="checkbox" defaultChecked={localStorage.getItem("chatliz_rainbow_neon") === "true"} 
                                  onChange={(e) => {
                                      localStorage.setItem("chatliz_rainbow_neon", e.target.checked.toString());
                                      window.dispatchEvent(new Event("chatliz_ui_update"));
                                  }} 
                              />
                           </label>
                       </div>
                   </div>

                   <div>
                       <label className="text-xs text-white/70 font-semibold uppercase tracking-wider">Fondo del Chat (URL)</label>
                       <input 
                           type="text" 
                           placeholder="https://ejemplo.com/fondo.jpg" 
                           defaultValue={localStorage.getItem("chatliz_chat_bg") || ""}
                           onChange={(e) => {
                               localStorage.setItem("chatliz_chat_bg", e.target.value);
                               window.dispatchEvent(new Event("chatliz_ui_update"));
                           }}
                           className="w-full bg-black/30 p-3 mt-1 rounded-xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors text-sm"
                       />
                       <p className="text-xs text-white/40 mt-1">Este fondo sólo será visible en tu dispositivo.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <h4 className="text-sm font-bold text-white flex items-center gap-2">Cambiar Contraseña</h4>
                   <input
                     type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     placeholder="Nueva contraseña..."
                     className="w-full bg-black/30 p-4 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors"
                   />
                </div>

                {user?.username?.toUpperCase() === 'AXISS' && (
                   <div className="pt-4 border-t border-white/5">
                     <button onClick={() => {
                         const aiUser = usersOnline.find(u => u.username === 'Elizabeth');
                         setAiProfileForm({ profilePic: aiUser?.profilePic || '', statusMessage: aiUser?.statusMessage || 'IA Asistente virtual', systemInstruction: aiUser?.systemInstruction || '' });
                         setIsConfigOpen(false);
                         setAdminConfigAiOpen(true);
                      }} className="w-full flex items-center justify-center gap-2 text-fuchsia-400 border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 rounded-2xl font-bold hover:bg-fuchsia-500/20 transition-all shadow-[0_0_20px_rgba(217,70,239,0.15)]">
                        <Bot size={18} /> Configuración Avanzada de Elizabeth
                     </button>
                   </div>
                )}
                
                <div className="pt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-center gap-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 p-4 rounded-2xl font-bold transition-colors border border-red-500/20"
                  >
                    <LogOut size={18} />
                    Cerrar Sesión Segura
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-black/20 flex flex-col items-center">
             <button 
               onClick={handleSaveProfile}
               className="w-full md:w-auto md:px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] hover:scale-[1.02]"
             >
               Guardar Cambios
             </button>
             {saveStatus && (
                <div className="mt-3 text-sm font-bold text-cyan-400 animate-in fade-in slide-in-from-bottom-2">
                  {saveStatus}
                </div>
             )}
          </div>
        </div>
        
        {/* Absolute close button for desktop */}
        <button onClick={() => setIsConfigOpen(false)} className="hidden md:flex absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 hover:bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors z-10">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm whitespace-nowrap md:whitespace-normal
        ${active 
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
