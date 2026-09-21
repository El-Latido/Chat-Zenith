import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Sparkles, Upload, Check, Volume2, VolumeX, Globe, User, RotateCcw } from 'lucide-react';
import { socket } from '../socket';

export interface BackgroundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBg?: string | null;
  isAdmin: boolean;
  defaultMode?: 'global' | 'personal';
  onApplyPersonalBg: (url: string) => void;
  onToast?: (msg: string) => void;
}

// Curated high-performance animated loops, GIFs and HD images that load instantly & loop infinitely
const PRESET_BACKGROUNDS = [
  {
    id: 'cyberpunk_city',
    name: 'Cyberpunk Neón 2077',
    tag: 'GIF Animado',
    preview: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'mecha_celestial',
    name: 'Mecha Celestial ChatLiz',
    tag: 'HD Exclusivo',
    preview: '/mecha_celestial_bg.jpg',
    url: '/mecha_celestial_bg.jpg',
  },
  {
    id: 'anime_rain',
    name: 'Lluvia Calma & Luces',
    tag: 'Aesthetic Loop',
    preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'galaxy_cosmic',
    name: 'Galaxia Profunda',
    tag: 'Espacio Cósmico',
    preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'synthwave_retro',
    name: 'Synthwave 80s Sunset',
    tag: 'Retro 80s',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'neon_night',
    name: 'Tokio Nocturno Neón',
    tag: 'Cyberpunk',
    preview: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&auto=format&fit=crop&q=85',
  },
];

export function BackgroundSelectorModal({
  isOpen,
  onClose,
  currentBg,
  isAdmin,
  defaultMode = 'global',
  onApplyPersonalBg,
  onToast,
}: BackgroundSelectorModalProps) {
  const [targetScope, setTargetScope] = useState<'global' | 'personal'>(
    isAdmin ? defaultMode : 'personal'
  );
  const [customUrl, setCustomUrl] = useState('');
  const [selectedBg, setSelectedBg] = useState<string>(currentBg || '');
  const [mediaPreview, setMediaPreview] = useState<string>(currentBg || '');
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    return localStorage.getItem('chatliz_bg_muted') === 'false';
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().match(/\.(mp4|webm|mov)$/i);

    const reader = new FileReader();

    reader.onload = (event) => {
      const dataResult = event.target?.result as string;
      if (!dataResult) {
        setIsProcessing(false);
        return;
      }

      // For GIF and Video: preserve pristine 100% animated frames without converting to canvas
      if (isGif || isVideo) {
        setSelectedBg(dataResult);
        setMediaPreview(dataResult);
        setCustomUrl('');
        setIsProcessing(false);
        if (onToast) onToast(`✨ Archivo ${isGif ? 'GIF animado' : 'Video'} cargado con éxito`);
        return;
      }

      // For normal images: fast preview
      setSelectedBg(dataResult);
      setMediaPreview(dataResult);
      setCustomUrl('');
      setIsProcessing(false);
      if (onToast) onToast('✨ Imagen lista para aplicar');
    };

    reader.onerror = () => {
      setIsProcessing(false);
      if (onToast) onToast('⚠️ Error al leer el archivo seleccionado');
    };

    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    const finalBg = customUrl.trim() || selectedBg;

    // Apply audio preference
    localStorage.setItem('chatliz_bg_muted', isSoundEnabled ? 'false' : 'true');

    if (targetScope === 'global' && isAdmin) {
      // Emit to server to update room background for all users
      socket.emit('set_global_bg', finalBg, (res: any) => {
        if (res && res.error) {
          console.warn("Global background sync warning:", res.error);
        }
      });
      if (onToast) onToast('🌐 ¡Fondo global aplicado a toda la sala!');
    } else {
      // Personal background only
      onApplyPersonalBg(finalBg);
      localStorage.setItem('chatliz_personal_bg', finalBg);
      if (onToast) onToast('🎨 ¡Tu fondo personal ha sido actualizado!');
    }

    onClose();
  };

  const handleReset = () => {
    setSelectedBg('');
    setMediaPreview('');
    setCustomUrl('');
    if (targetScope === 'global' && isAdmin) {
      socket.emit('set_global_bg', '');
      if (onToast) onToast('🔄 Fondo global restablecido al predeterminado');
    } else {
      onApplyPersonalBg('');
      localStorage.removeItem('chatliz_personal_bg');
      if (onToast) onToast('🔄 Fondo personal restablecido');
    }
    onClose();
  };

  const isVideo = mediaPreview.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) || mediaPreview.startsWith('data:video/');

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#101420] border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#172033] to-[#0f1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Fondo de Pantalla
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                  Video • GIF • Imagen
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Se adapta automáticamente a todos los bordes de tu pantalla sin distorsión
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 scrollbar-thin">
          {/* Scope Selector: Global vs Personal */}
          {isAdmin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                ¿Dónde deseas aplicar este fondo?
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setTargetScope('global')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    targetScope === 'global'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Globe size={14} />
                  Fondo de Toda la Sala (Global)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('personal')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    targetScope === 'personal'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User size={14} />
                  Solo Mi Pantalla (Personal)
                </button>
              </div>
            </div>
          )}

          {/* Current / Selected Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 h-36 sm:h-44 bg-black/60 flex items-center justify-center shadow-inner group">
            {mediaPreview ? (
              isVideo ? (
                <video
                  src={mediaPreview}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Vista Previa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="text-center text-gray-500 flex flex-col items-center gap-2 p-4">
                <Sparkles size={24} className="opacity-40" />
                <span className="text-xs font-medium">Sin fondo seleccionado (Predeterminado de sala)</span>
              </div>
            )}

            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>Vista previa ajustada a bordes</span>
            </div>
          </div>

          {/* Option 1: Upload Any File (GIF, MP4, WebM, PNG, JPG) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Upload size={14} className="text-cyan-400" />
                Opción 1: Subir Archivo Local (GIF animado, Video o Imagen)
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">Bucle infinito automático</span>
            </div>

            <label className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 bg-cyan-950/20 hover:bg-cyan-950/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
              <input
                type="file"
                accept="image/*,video/*,.gif,.mp4,.webm,.mov"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                <Upload size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-white">
                  {isProcessing ? 'Cargando archivo...' : 'Haz clic para seleccionar GIF, Video MP4 o Imagen'}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Los GIFs conservan 100% de sus fotogramas y los videos se reproducen sin parar
                </p>
              </div>
            </label>
          </div>

          {/* Option 2: Paste URL (YouTube, Pinterest, MP4, WebM, GIF, Web) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Video size={14} className="text-[#38bdf8]" />
              Opción 2: Pegar Enlace / URL (YouTube, Pinterest, MP4 directo o GIF)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value) {
                    setMediaPreview(e.target.value);
                    setSelectedBg(e.target.value);
                  }
                }}
                placeholder="https://... (YouTube, Pinterest, .mp4, .gif, imagen)"
                className="flex-1 bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
              {customUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomUrl('');
                    setMediaPreview('');
                    setSelectedBg('');
                  }}
                  className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Option 3: Fast Preset Gallery */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Opción 3: Galería Rápida de Fondos HD
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_BACKGROUNDS.map((preset) => {
                const isSelected = selectedBg === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedBg(preset.url);
                      setMediaPreview(preset.url);
                      setCustomUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      isSelected
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden">
                      <img
                        src={preset.preview}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-1.5 bg-black/80 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white truncate">{preset.name}</span>
                      {isSelected && <Check size={14} className="text-cyan-400 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound Setting for Video */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Sonido de Videos de Fondo</span>
                <span className="text-[11px] text-gray-400">Si el video tiene audio o música, reproducirlo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isSoundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              {isSoundEnabled ? 'Sonido Activado' : 'Silenciado'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0e121d] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-red-500/30"
          >
            <RotateCcw size={14} />
            Restablecer Fondo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5"
            >
              <Check size={16} />
              Aplicar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
