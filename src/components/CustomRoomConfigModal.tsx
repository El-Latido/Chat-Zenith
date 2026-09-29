import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Trash2, Shield, Hash, Palette, Check, Upload, AlertCircle, Clock } from 'lucide-react';
import { socket } from '../socket';
import { CHAT_BUBBLE_STYLES } from '../utils/bubbleStyles';
import { preloadMedia, cacheBackgroundForOffline } from '../utils/mediaPreloader';

const LOGO_PRESETS = [
  "⚔️", "👑", "🚀", "🎮", "🌸", "⚡", "💎", "🐉", 
  "🎧", "🌌", "🛡️", "🔥", "🔮", "🐺", "🏆", "🌟",
  "🪐", "👾", "🤖", "🐱", "🌹", "🛸", "🎯", "⚓"
];

const PRESET_ROOM_WALLPAPERS = [
  { name: "Cyberpunk City", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80" },
  { name: "Galaxia Neón", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80" },
  { name: "Espacio Estelar", url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1200&auto=format&fit=crop&q=80" },
  { name: "Sakura Anime", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&auto=format&fit=crop&q=80" },
  { name: "Dark Minimal", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" },
  { name: "Olas Violetas", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80" }
];

export interface CustomRoomConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: any;
  currentUser: string;
  isMasterAdmin: boolean;
  onRoomUpdated: (updatedRoom: any) => void;
  onCleanRoomNow?: () => void;
}

export function CustomRoomConfigModal({
  isOpen,
  onClose,
  roomData,
  currentUser,
  isMasterAdmin,
  onRoomUpdated,
  onCleanRoomNow
}: CustomRoomConfigModalProps) {
  if (!isOpen || !roomData) return null;

  const isOwner = roomData.owner === currentUser || isMasterAdmin;

  const [name, setName] = useState(roomData.name || "");
  const [rules, setRules] = useState(roomData.rules || "");
  const [selectedLogo, setSelectedLogo] = useState(roomData.logo || roomData.emblem || "⚔️");
  const [customLogoUrl, setCustomLogoUrl] = useState(
    roomData.logo?.startsWith("http") || roomData.logo?.startsWith("data:") ? roomData.logo : ""
  );
  const [backgroundUrl, setBackgroundUrl] = useState(roomData.backgroundUrl || "");
  const [autoCleanMode, setAutoCleanMode] = useState(roomData.autoCleanMode || "disabled");
  const [bubbleStyle, setBubbleStyle] = useState(roomData.bubbleStyle || "default");
  const [theme, setTheme] = useState(roomData.theme || "cyan");
  
  const [activeTab, setActiveTab] = useState<'general' | 'logo' | 'fondo' | 'limpieza' | 'burbujas'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("El archivo no debe exceder 15MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        if (target === 'logo') {
          setCustomLogoUrl(result);
          setSelectedLogo(result);
        } else {
          setBackgroundUrl(result);
          preloadMedia(result).catch(() => {});
          cacheBackgroundForOffline(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg("El nombre de la sala no puede estar vacío");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    const finalLogo = customLogoUrl.trim() || selectedLogo || "⚔️";

    const updatedConfig = {
      name: name.trim(),
      rules: rules.trim(),
      logo: finalLogo,
      emblem: finalLogo,
      backgroundUrl: backgroundUrl.trim(),
      autoCleanMode: autoCleanMode,
      bubbleStyle: bubbleStyle,
      theme: theme,
    };

    socket.emit("update_custom_room", {
      roomId: roomData.id,
      config: updatedConfig
    }, (res: any) => {
      setIsSaving(false);
      if (res?.success) {
        setSuccessMsg("¡Configuración de la sala guardada exitosamente!");
        if (backgroundUrl.trim()) {
          cacheBackgroundForOffline(backgroundUrl.trim());
        }
        onRoomUpdated(res.room || { ...roomData, ...updatedConfig });
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 800);
      } else {
        setErrorMsg(res?.error || "Error al actualizar sala");
      }
    });
  };

  const handleCleanNow = () => {
    if (!window.confirm("¿Seguro que deseas limpiar todos los mensajes de esta sala ahora mismo?")) return;
    setIsCleaning(true);
    socket.emit("clean_custom_room", roomData.id, (res: any) => {
      setIsCleaning(false);
      if (res?.success) {
        setSuccessMsg("¡Sala limpiada exitosamente!");
        onCleanRoomNow?.();
        setTimeout(() => setSuccessMsg(""), 2000);
      } else {
        setErrorMsg(res?.error || "Error al limpiar la sala");
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#0e121d] border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#172033] to-[#0f1422]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 overflow-hidden">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedLogo}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Configuración de Sala
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                  {isOwner ? "Dueño" : "Modo Lectura"}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Personaliza el nombre grande, logo, fondo, limpieza y burbujas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Hash size={13} /> General
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logo' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} /> Logo & Emblema
          </button>
          <button
            onClick={() => setActiveTab('fondo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fondo' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon size={13} /> Fondo de Sala
          </button>
          <button
            onClick={() => setActiveTab('limpieza')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'limpieza' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trash2 size={13} /> Limpieza Automática
          </button>
          <button
            onClick={() => setActiveTab('burbujas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'burbujas' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={13} /> Burbujas
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[60vh] space-y-5">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-2xl flex items-center gap-2 text-red-200 text-xs">
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs">
              <Check size={15} /> {successMsg}
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Sala (Se verá grande y destacado)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Ej: 🚀 El Refugio Cuántico"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-base focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Reglas o Mensaje de Bienvenida
                </label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Escribe las normas de tu comunidad..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60 resize-none"
                />
              </div>

              <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-sm">Creador / Dueño Oficial</div>
                  <div className="text-xs text-white/50">Solo el creador o Axiss pueden editar la sala.</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/40">
                  @{roomData.owner}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO & EMBLEMA */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Emblema Rápido (Icono Oficial)
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {LOGO_PRESETS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => {
                        setSelectedLogo(icon);
                        setCustomLogoUrl("");
                      }}
                      className={`h-11 rounded-2xl text-xl flex items-center justify-center border transition-all ${
                        selectedLogo === icon && !customLogoUrl
                          ? "bg-cyan-500/30 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  O sube tu propio Logo personalizado (URL o Imagen)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLogoUrl}
                    onChange={(e) => {
                      setCustomLogoUrl(e.target.value);
                      if (e.target.value) setSelectedLogo(e.target.value);
                    }}
                    disabled={!isOwner}
                    placeholder="https://i.imgur.com/... o enlace de imagen"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors">
                    <Upload size={14} />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!isOwner}
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {customLogoUrl && (
                <div className="p-3 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-3">
                  <img src={customLogoUrl} alt="Vista previa logo" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
                  <div className="text-xs text-white/70">Logo personalizado activo para la sala.</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FONDO DE SALA */}
          {activeTab === 'fondo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Fondo de Pantalla de la Sala (Video • GIF • Imagen)
                </label>
                <p className="text-xs text-white/50 mb-2">
                  Todos los usuarios que entren a tu sala verán este fondo automáticamente.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    disabled={!isOwner}
                    placeholder="Enlace de YouTube, GIF, video MP4 o imagen..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors">
                    <Upload size={14} />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      disabled={!isOwner}
                      onChange={(e) => handleFileUpload(e, 'bg')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Fondos Sugeridos de Alta Definición
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_ROOM_WALLPAPERS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => setBackgroundUrl(p.url)}
                      className={`relative rounded-xl overflow-hidden h-16 border transition-all text-left ${
                        backgroundUrl === p.url ? "border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white leading-tight truncate">{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIMPIEZA AUTOMÁTICA */}
          {activeTab === 'limpieza' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Trash2 size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <b>Limpieza Automática Programada:</b> Evita la acumulación excesiva de mensajes en tu sala y mantiene el chat fluido y rápido para todos los miembros.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Frecuencia de Limpieza Automática
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "disabled", label: "Desactivada", desc: "Sin limpieza periódica" },
                    { id: "10msgs", label: "Cada 10 mensajes", desc: "Mantiene los últimos 10" },
                    { id: "20msgs", label: "Cada 20 mensajes", desc: "Límite estándar de 20" },
                    { id: "50msgs", label: "Cada 50 mensajes", desc: "Salas muy activas" },
                    { id: "100msgs", label: "Cada 100 mensajes", desc: "Historial extendido" },
                    { id: "5min", label: "Cada 5 minutos", desc: "Limpieza por tiempo" },
                    { id: "15min", label: "Cada 15 minutos", desc: "Salas temporales" },
                    { id: "1hour", label: "Cada 1 hora", desc: "Limpieza cada 60 min" },
                    { id: "24hours", label: "Cada 24 horas", desc: "Limpieza diaria" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => setAutoCleanMode(mode.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        autoCleanMode === mode.id
                          ? "bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] text-white"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{mode.label}</span>
                        {autoCleanMode === mode.id && <Check size={12} className="text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {isOwner && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isCleaning}
                    onClick={handleCleanNow}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 size={14} />
                    {isCleaning ? "Limpiando sala..." : "🧹 Limpiar Todos los Mensajes de la Sala Ahora"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ESTILOS DE BURBUJAS */}
          {activeTab === 'burbujas' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                Estilo de Burbujas de la Sala
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHAT_BUBBLE_STYLES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setBubbleStyle(b.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      bubbleStyle === b.id
                        ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{b.icon}</span>
                        <span>{b.name}</span>
                      </div>
                      {b.badge && (
                        <span className="text-[9px] bg-white/10 text-cyan-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/60 hover:text-white px-4 py-2 rounded-xl transition-colors font-semibold"
          >
            Cancelar
          </button>

          {isOwner && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {isSaving ? "Guardando..." : "Guardar Cambios de la Sala"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
