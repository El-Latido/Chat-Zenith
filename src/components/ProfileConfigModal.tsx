import React, { useState } from 'react';
import { X, Camera, Type, Palette, Image as ImageIcon, Sparkles, User, MessageSquare, Settings } from 'lucide-react';
import { socket } from '../socket';

export interface ProfileConfigModalProps {
  user: any;
  onClose?: () => void;
  onUpdate?: (updates: any) => void;
  setUser?: React.Dispatch<React.SetStateAction<any>>;
  setIsConfigOpen?: (open: boolean) => void;
  setAdminConfigAiOpen?: (open: boolean) => void;
  usersOnline?: any[];
  onLogout?: () => void;
  setAiProfileForm?: (form: any) => void;
  customFrames?: any;
}

const BUBBLE_STYLES = [
  { id: 'default', name: 'Clásico', preview: 'bg-gray-700' },
  { id: 'neon', name: 'Neón', preview: 'bg-black border-2 border-cyan-400' },
  { id: 'gradient', name: 'Degradado', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { id: 'glass', name: 'Cristal', preview: 'bg-white/20 backdrop-blur' },
  { id: 'fire', name: 'Fuego 🔥', preview: 'bg-gradient-to-br from-red-600 to-yellow-500' },
  { id: 'galaxy', name: 'Galaxia 🌌', preview: 'bg-gradient-to-br from-indigo-900 to-pink-700' },
  { id: 'matrix', name: 'Matrix 💚', preview: 'bg-black border border-green-500' },
];

const PROFILE_FRAMES = [
  { id: 'none', name: 'Sin marco' },
  { id: 'fire', name: '🔥 Fuego', color: 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]' },
  { id: 'galaxy', name: '🌌 Galaxia', color: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]' },
  { id: 'neon', name: '💎 Neón', color: 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]' },
];

const FONTS = [
  { id: 'default', name: 'Predeterminada', family: 'inherit' },
  { id: 'cursive', name: 'Cursiva', family: '"Brush Script MT", cursive' },
  { id: 'mono', name: 'Monoespaciada', family: 'monospace' },
  { id: 'serif', name: 'Serif', family: 'Georgia, serif' },
  { id: 'impact', name: 'Impacto', family: 'Impact, sans-serif' },
];

const NEON_COLORS = [
  '#22d3ee', '#f472b6', '#a855f7', '#34d399', '#fbbf24', '#f87171', '#ffffff',
];

export function ProfileConfigModal({ 
  user, 
  onClose, 
  onUpdate, 
  setUser, 
  setIsConfigOpen, 
  setAdminConfigAiOpen,
  onLogout 
}: ProfileConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'chat' | 'appearance'>('profile');
  const [avatar, setAvatar] = useState(user.avatar || user.profilePic || '');
  const [banner, setBanner] = useState(user.banner || user.preferred_background || '');
  const [bannerType, setBannerType] = useState<'image' | 'video'>(user.bannerType || 'image');
  const [bio, setBio] = useState(user.bio || user.statusMessage || '');
  const [bubbleStyle, setBubbleStyle] = useState(user.bubbleStyle || 'default');
  const [fontStyle, setFontStyle] = useState(user.fontStyle || 'default');
  const [fontColor, setFontColor] = useState(user.fontColor || '#ffffff');
  const [profileFrame, setProfileFrame] = useState(user.profileFrame || (user.frameId ? 'fire' : 'none'));
  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    if (onClose) onClose();
    if (setIsConfigOpen) setIsConfigOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (type === 'avatar') setAvatar(url);
      else {
        setBanner(url);
        setBannerType(file.type.startsWith('video') ? 'video' : 'image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setLoading(true);
    const updates = {
      avatar,
      profilePic: avatar,
      banner,
      preferred_background: banner,
      bannerType,
      bio,
      statusMessage: bio,
      bubbleStyle,
      fontStyle,
      fontColor,
      profileFrame,
    };

    socket.emit('update_profile', updates);
    if (onUpdate) onUpdate(updates);
    if (setUser) setUser((prev: any) => ({ ...prev, ...updates }));
    setLoading(false);
    handleCloseModal();
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'appearance', label: 'Apariencia', icon: Sparkles },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-purple-700 to-pink-600">
          {banner ? (
            bannerType === 'video' ? (
              <video src={banner} autoPlay loop muted className="w-full h-full object-cover" />
            ) : (
              <img src={banner} className="w-full h-full object-cover" alt="Banner" />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-pink-600" />
          )}
          <button onClick={handleCloseModal} className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition">
            <X size={20} />
          </button>
          <label className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition">
            <Camera size={18} />
            <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" />
          </label>
        </div>

        {/* Avatar */}
        <div className="relative -mt-16 px-6 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} className="w-24 h-24 rounded-full object-cover border-4 border-gray-900 shadow-md" alt={user.username} />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-gray-900 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer shadow">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} className="hidden" />
              </label>
            </div>
            <div className="pb-2">
              <h2 className="text-white text-xl font-bold">{user.username}</h2>
              <p className="text-gray-400 text-xs">{user.role === 'admin' ? '🛡️ Administrador' : 'Miembro de ChatLiz'}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                handleCloseModal();
                onLogout();
              }}
              className="mb-2 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold transition cursor-pointer"
            >
              Cerrar Sesión
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mt-4 px-4 bg-black/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition cursor-pointer text-sm ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="text-white font-bold mb-2 block flex items-center gap-2">
                  <MessageSquare size={16} /> Biografía
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  maxLength={200}
                  className="w-full bg-gray-800 text-white rounded-xl p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">{bio.length}/200</p>
              </div>

              <div>
                <label className="text-white font-bold mb-2 block">Marco de Perfil</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PROFILE_FRAMES.map(frame => (
                    <button
                      key={frame.id}
                      onClick={() => setProfileFrame(frame.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                        profileFrame === frame.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 bg-gradient-to-br from-purple-600 to-pink-600 ${frame.color || ''}`} />
                      <p className="text-white text-xs text-center font-medium">{frame.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {setAdminConfigAiOpen && user.role === 'admin' && (
                <div className="pt-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      handleCloseModal();
                      setAdminConfigAiOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Settings size={15} /> Configuración Avanzada de IA y Shaders
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div>
                <label className="text-white font-bold mb-3 block flex items-center gap-2">
                  <MessageSquare size={16} /> Estilo de Burbuja
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BUBBLE_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setBubbleStyle(style.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                        bubbleStyle === style.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className={`${style.preview} rounded-lg px-3 py-2 text-xs text-white mb-2 text-center`}>
                        Hola 👋
                      </div>
                      <p className="text-white text-xs text-center font-medium">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-bold mb-3 block flex items-center gap-2">
                  <Type size={16} /> Tipo de Letra
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => setFontStyle(font.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                        fontStyle === font.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      <p className="text-white text-lg mb-1">Aa</p>
                      <p className="text-gray-400 text-xs">{font.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-bold mb-3 block flex items-center gap-2">
                  <Palette size={16} /> Color de Texto (Neón)
                </label>
                <div className="flex gap-3 flex-wrap items-center">
                  {NEON_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFontColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition cursor-pointer ${
                        fontColor === color ? 'border-white scale-110' : 'border-gray-700'
                      }`}
                      style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
                    />
                  ))}
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-0"
                    title="Color personalizado"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Personaliza tu fondo de pantalla. Puedes usar una imagen o un video en bucle.
              </p>
              <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden relative">
                {banner ? (
                  bannerType === 'video' ? (
                    <video src={banner} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={banner} className="w-full h-full object-cover" alt="Fondo" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    Sin fondo personalizado
                  </div>
                )}
              </div>
              <label className="block bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-center font-bold cursor-pointer transition">
                Cambiar Fondo
                <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex gap-3 bg-black/30">
          <button onClick={handleCloseModal} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition cursor-pointer shadow-lg"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
