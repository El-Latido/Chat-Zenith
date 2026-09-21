import React, { useState } from "react";
import { UniversalBackground } from "./UniversalBackground";
import { preloadMedia } from "../utils/mediaPreloader";
import {
  Palette,
  X,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Upload,
  Link,
  Globe,
  Sparkles,
  Layers,
  Smile,
  Shield,
  Flame,
  Star,
  Heart,
  Gamepad2,
  Crown,
  Zap,
  Diamond,
  Flower2,
  Rocket,
  Headphones,
  Bot,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface ChatConfig {
  backgroundBase64?: string;
  backgroundUrl?: string;
  icon?: string;
  theme?: string;
  title?: string;
  statusMessage?: string;
  bubbleStyle?: string;
  updatedBy?: string;
  updatedAt?: any;
}

interface ChatCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatTitle: string;
  isGlobal: boolean;
  currentConfig: ChatConfig | null;
  onSaveConfig: (newConfig: ChatConfig) => Promise<void>;
  onResetConfig: () => Promise<void>;
  onOpenSyncToAxis?: () => void;
}

const PRESET_WALLPAPERS = [
  {
    name: "Galaxia Neón",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Cyberpunk City",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Espacio Estelar",
    url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Sakura Anime",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Dark Minimal",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Olas Violetas",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80"
  }
];

const PRESET_ICONS = [
  { id: "globe", icon: "🪐", label: "Planeta" },
  { id: "crown", icon: "👑", label: "Corona" },
  { id: "fire", icon: "🔥", label: "Fuego" },
  { id: "zap", icon: "⚡", label: "Rayo" },
  { id: "diamond", icon: "💎", label: "Diamante" },
  { id: "sakura", icon: "🌸", label: "Sakura" },
  { id: "gaming", icon: "🎮", label: "Gaming" },
  { id: "shield", icon: "🛡️", label: "Escudo" },
  { id: "rocket", icon: "🚀", label: "Cohete" },
  { id: "music", icon: "🎧", label: "Música" },
  { id: "heart", icon: "💖", label: "Corazón" },
  { id: "bot", icon: "🤖", label: "Cyberbot" },
  { id: "star", icon: "⭐", label: "Estrella" },
  { id: "magic", icon: "🔮", label: "Mágico" },
];

const PRESET_THEMES = [
  { id: "cyan", name: "Cian Neón", bgClass: "bg-cyan-500", borderClass: "border-cyan-400", glow: "shadow-[0_0_15px_rgba(6,182,212,0.4)]" },
  { id: "purple", name: "Violeta Místico", bgClass: "bg-purple-500", borderClass: "border-purple-400", glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
  { id: "emerald", name: "Esmeralda Matrix", bgClass: "bg-emerald-500", borderClass: "border-emerald-400", glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
  { id: "pink", name: "Rosa Neón", bgClass: "bg-pink-500", borderClass: "border-pink-400", glow: "shadow-[0_0_15px_rgba(236,72,153,0.4)]" },
  { id: "amber", name: "Ámbar Solar", bgClass: "bg-amber-500", borderClass: "border-amber-400", glow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]" },
  { id: "red", name: "Rojo Carmesí", bgClass: "bg-red-500", borderClass: "border-red-400", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
  { id: "blue", name: "Azul Zafiro", bgClass: "bg-blue-500", borderClass: "border-blue-400", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
];

export const ChatCustomizerModal: React.FC<ChatCustomizerModalProps> = ({
  isOpen,
  onClose,
  chatId,
  chatTitle,
  isGlobal,
  currentConfig,
  onSaveConfig,
  onResetConfig,
  onOpenSyncToAxis,
}) => {
  const [activeTab, setActiveTab] = useState<"wallpaper" | "icon" | "theme" | "details">("wallpaper");
  const [backgroundBase64, setBackgroundBase64] = useState<string>(
    currentConfig?.backgroundBase64 || currentConfig?.backgroundUrl || ""
  );
  const [urlInput, setUrlInput] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>(currentConfig?.icon || "");
  const [customIconUrl, setCustomIconUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>(currentConfig?.theme || "cyan");
  const [customTitle, setCustomTitle] = useState<string>(currentConfig?.title || "");
  const [statusMessage, setStatusMessage] = useState<string>(currentConfig?.statusMessage || "");
  const [bubbleStyle, setBubbleStyle] = useState<string>(currentConfig?.bubbleStyle || "default");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isBgLoading, setIsBgLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("El archivo no debe exceder 10MB.");
      return;
    }

    setIsBgLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        setBackgroundBase64(result);
        await preloadMedia(result).catch(() => {});
      }
      setIsBgLoading(false);
    };
    reader.onerror = () => {
      setIsBgLoading(false);
      setUploadError("Error al leer el archivo. Intenta con otra imagen o GIF.");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    const targetUrl = urlInput.trim();
    setUploadError("");
    setIsBgLoading(true);
    setBackgroundBase64(targetUrl);
    setUrlInput("");
    await preloadMedia(targetUrl).catch(() => {});
    setIsBgLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (backgroundBase64) {
        await preloadMedia(backgroundBase64).catch(() => {});
      }
      const updated: ChatConfig = {
        backgroundBase64: backgroundBase64 || "",
        backgroundUrl: backgroundBase64 || "",
        icon: customIconUrl.trim() || selectedIcon || "",
        theme: selectedTheme,
        title: customTitle.trim() || (isGlobal ? "Chat Global" : chatTitle),
        statusMessage: statusMessage.trim(),
        bubbleStyle: bubbleStyle,
        updatedAt: new Date().toISOString()
      };
      await onSaveConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error("Error saving chat config:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("¿Seguro que deseas restablecer la configuración del chat a los valores por defecto?")) return;
    setIsSaving(true);
    try {
      await onResetConfig();
      setBackgroundBase64("");
      setSelectedIcon("");
      setCustomIconUrl("");
      setSelectedTheme("cyan");
      setCustomTitle("");
      setStatusMessage("");
      setBubbleStyle("default");
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error("Error resetting chat config:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="chat-customizer-modal-overlay"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="chat-customizer-modal-container"
        className="bg-[#0f172a] border border-cyan-500/30 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)] relative max-h-[90vh] text-white"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Palette size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 leading-tight">
                {isGlobal ? "Personalizar Chat Global" : `Personalizar Chat con ${chatTitle}`}
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider font-semibold">
                  Sincronizado
                </span>
              </h2>
              <p className="text-xs text-white/50">
                {isGlobal
                  ? "Los cambios se aplican y sincronizan al instante para toda la sala."
                  : "Los cambios se aplican automáticamente en ambas pantallas del chat."}
              </p>
            </div>
          </div>
          <button
            id="btn-close-chat-customizer"
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-3 pt-2 bg-black/20 gap-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-customizer-wallpaper"
            onClick={() => setActiveTab("wallpaper")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "wallpaper"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon size={16} />
            Fondo
          </button>
          <button
            id="tab-customizer-icon"
            onClick={() => setActiveTab("icon")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "icon"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Smile size={16} />
            Ícono / Emblema
          </button>
          <button
            id="tab-customizer-theme"
            onClick={() => setActiveTab("theme")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "theme"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles size={16} />
            Color & Estilo
          </button>
          <button
            id="tab-customizer-details"
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "details"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers size={16} />
            Detalles
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* TAB 1: WALLPAPER */}
          {activeTab === "wallpaper" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Current Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2 flex items-center justify-between">
                  <span>Vista Previa del Fondo</span>
                  {isBgLoading && (
                    <span className="text-cyan-400 text-[11px] font-normal flex items-center gap-1.5 animate-pulse">
                      <Loader2 size={12} className="animate-spin" />
                      Optimizando medio...
                    </span>
                  )}
                </label>
                <div className="relative w-full h-36 rounded-2xl border border-white/15 overflow-hidden bg-[#090d16] flex items-center justify-center group shadow-inner">
                  {/* Skeleton / Loading state indicator */}
                  {isBgLoading && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-none animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Loader2 size={15} className="animate-spin text-cyan-400" />
                        <span>Pre-cargando y optimizando fondo...</span>
                      </div>
                      <div className="w-32 h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-2/3" />
                      </div>
                    </div>
                  )}

                  {backgroundBase64 ? (
                    <UniversalBackground
                      url={backgroundBase64}
                      opacity={0.85}
                      isContainer={true}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white/40 flex flex-col items-center">
                      <ImageIcon size={32} className="mb-1 opacity-50" />
                      <span className="text-xs">Sin fondo personalizado (se usa el predeterminado)</span>
                    </div>
                  )}

                  {backgroundBase64 && !isBgLoading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setBackgroundBase64("")}
                        className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1"
                      >
                        <X size={14} /> Quitar Fondo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload error display */}
              {uploadError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="flex-shrink-0 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload file or enter URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Upload size={14} className="text-cyan-400" /> Subir desde dispositivo
                  </label>
                  <input
                    id="input-file-chat-bg"
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                  />
                  <p className="text-[10px] text-white/40 mt-1">Imágenes (PNG, JPG, GIF) o videos MP4/WEBM.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Link size={14} className="text-cyan-400" /> Pegar enlace web (URL)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="input-url-chat-bg"
                      type="url"
                      placeholder="https://..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyUrl();
                      }}
                      className="flex-1 bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={handleApplyUrl}
                      disabled={isBgLoading}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 text-cyan-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all"
                    >
                      {isBgLoading ? <Loader2 size={12} className="animate-spin" /> : "OK"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Gallery */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                  Galería de Fondos Populares
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_WALLPAPERS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={async () => {
                        setIsBgLoading(true);
                        setBackgroundBase64(preset.url);
                        await preloadMedia(preset.url).catch(() => {});
                        setIsBgLoading(false);
                      }}
                      className={`relative h-18 rounded-xl overflow-hidden border transition-all text-left group ${
                        backgroundBase64 === preset.url
                          ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-[1.02]"
                          : "border-white/10 hover:border-cyan-400/50 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.thumb}
                        alt={preset.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                          {preset.name}
                        </span>
                      </div>
                      {backgroundBase64 === preset.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ICON / EMBLEM */}
          {activeTab === "icon" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1">
                  Ícono o Emblema del Chat
                </label>
                <p className="text-xs text-white/50 mb-3">
                  Este ícono aparecerá en la cabecera de la conversación para todos los participantes.
                </p>

                {/* Preset Icons Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-7 gap-2">
                  {PRESET_ICONS.map((item) => {
                    const isSelected = selectedIcon === item.icon && !customIconUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(item.icon);
                          setCustomIconUrl("");
                        }}
                        className={`h-12 rounded-2xl flex flex-col items-center justify-center text-xl transition-all border ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                        title={item.label}
                      >
                        <span>{item.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Icon Image URL */}
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <Link size={14} className="text-cyan-400" /> O usa una imagen personalizada para el ícono
                </label>
                <input
                  id="input-custom-icon-url"
                  type="url"
                  placeholder="https://ejemplo.com/icono.png"
                  value={customIconUrl}
                  onChange={(e) => {
                    setCustomIconUrl(e.target.value);
                    if (e.target.value) setSelectedIcon("");
                  }}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-white/40">
                  Pega el enlace directo a una imagen cuadrada (PNG, JPG o GIF).
                </p>
              </div>

              {/* Preview of active emblem */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-sm overflow-hidden">
                  {customIconUrl ? (
                    <img src={customIconUrl} alt="Ícono" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedIcon || (isGlobal ? "🪐" : "💬")}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Emblema Seleccionado</span>
                  <span className="text-[11px] text-cyan-300">
                    Visible en la barra superior del chat en tiempo real.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME & COLOR */}
          {activeTab === "theme" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                  Paleta de Color y Acento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_THEMES.map((theme) => {
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                          isSelected
                            ? `border-cyan-400 bg-white/10 ${theme.glow}`
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full ${theme.bgClass} shadow-sm flex-shrink-0 flex items-center justify-center`}>
                          {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bubble Style */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                  Estilo de Burbuja de Mensajes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "default", name: "Moderno Suave", desc: "Bordes redondeados con sombra sutil" },
                    { id: "glass", name: "Cristal Neón", desc: "Fondo translúcido con brillo de color" },
                    { id: "minimal", name: "Minimalista", desc: "Sin bordes pesados, enfoque en texto" },
                    { id: "rounded", name: "Ultra Redondeado", desc: "Estilo píldora cápsula" }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setBubbleStyle(style.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        bubbleStyle === style.id
                          ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{style.name}</span>
                      <span className="text-[10px] text-white/50">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1.5">
                  Título Personalizado del Chat
                </label>
                <input
                  id="input-custom-chat-title"
                  type="text"
                  placeholder={isGlobal ? "Chat Global" : chatTitle}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1.5">
                  Mensaje de Estado o Lema
                </label>
                <input
                  id="input-custom-chat-status"
                  type="text"
                  placeholder="Ej: ¡Bienvenidos a todos! ✨"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Se mostrará como subtítulo en la cabecera del chat.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-white/10 bg-black/30 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              id="btn-reset-chat-customizer"
              type="button"
              disabled={isSaving}
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Restablecer
            </button>

            {onOpenSyncToAxis && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSyncToAxis();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 px-3 py-2 rounded-xl transition-all shadow-sm"
                title="Transferir este aspecto y mejoras a Axis (Chat Principal Li)"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Pasar a Chat Li (Axis)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-white/70 hover:text-white px-3 py-2.5 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-chat-customizer"
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-1.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check size={16} className="animate-bounce" />
                  ¡Sincronizado!
                </>
              ) : isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Guardar y Sincronizar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
