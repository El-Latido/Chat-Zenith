import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Hash, Plus, Users, Shield, X, AlertCircle, Trash2, Sparkles, Image as ImageIcon, Palette, MessageSquare } from 'lucide-react';
import { PRESET_BUBBLE_STYLES } from './ChatCustomizerModal';

const EMBLEM_PRESETS = ["⚔️", "👑", "🚀", "🎮", "🌸", "⚡", "💎", "🐉", "🎧", "🌌", "🛡️", "🔥", "🔮", "🐺", "🏆", "🌟"];

export function CustomRooms({ user, onJoinRoom }: { user: any, onJoinRoom: (roomId: string, roomData: any) => void }) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomRules, setNewRoomRules] = useState("");
    const [newRoomLogo, setNewRoomLogo] = useState("⚔️");
    const [customLogoUrl, setCustomLogoUrl] = useState("");
    const [newRoomAutoClean, setNewRoomAutoClean] = useState("disabled");
    const [newRoomBg, setNewRoomBg] = useState("");
    const [newRoomTheme, setNewRoomTheme] = useState("cyan");
    const [newRoomBubbleStyle, setNewRoomBubbleStyle] = useState("default");
    const [error, setError] = useState("");

    const loadRooms = () => {
        socket.emit("get_custom_rooms", (res: any) => {
            setRooms(res || []);
        });
    };

    useEffect(() => {
        loadRooms();
        socket.on("custom_rooms_updated", loadRooms);
        return () => {
            socket.off("custom_rooms_updated", loadRooms);
        };
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return setError("El nombre de la sala es obligatorio");
        
        const finalLogo = customLogoUrl.trim() || newRoomLogo || "⚔️";

        socket.emit("create_custom_room", { 
            name: newRoomName.trim(), 
            rules: newRoomRules.trim(),
            logo: finalLogo,
            emblem: finalLogo,
            autoCleanMode: newRoomAutoClean,
            backgroundUrl: newRoomBg.trim(),
            theme: newRoomTheme,
            bubbleStyle: newRoomBubbleStyle
        }, (res: any) => {
            if (res?.success) {
                setIsCreating(false);
                setNewRoomName("");
                setNewRoomRules("");
                setCustomLogoUrl("");
                setNewRoomBg("");
                loadRooms();
                if (res.roomId) {
                    onJoinRoom(res.roomId, {
                        id: res.roomId,
                        name: newRoomName.trim(),
                        owner: user?.username || "Usuario",
                        logo: finalLogo,
                        emblem: finalLogo,
                        autoCleanMode: newRoomAutoClean,
                        backgroundUrl: newRoomBg.trim(),
                        theme: newRoomTheme,
                        bubbleStyle: newRoomBubbleStyle
                    });
                }
            } else {
                setError(res?.error || "Error al crear sala");
            }
        });
    };

    const joinRoom = (roomId: string, roomData: any) => {
        socket.emit("join_custom_room", roomId, (res: any) => {
            if (res?.success) {
                onJoinRoom(roomId, res.room || roomData);
            } else {
                alert(res?.error || "No se pudo unir a la sala");
            }
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">
      {/* Premium Animated Glowing Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '3s' }}></div>
      
      {/* Glassmorphism background filter overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0"></div>

            <div className="p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg border-b border-white/5 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                        <Hash className="text-white/80" />
                        Salas Públicas
                    </h2>
                    <p className="text-white/50 text-sm mt-1">Crea o únete a salas creadas por la comunidad.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-[#121B2A] font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus size={18} />
                    Crear Sala
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
                {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <Hash size={64} className="mb-4 text-white/80" />
                        <p className="text-xl text-white font-light">No hay salas creadas aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rooms.map(r => (
                            <div key={r.id} className="bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] rounded-3xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden">
                                {r.backgroundUrl && (
                                    <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden z-0">
                                        <img src={r.backgroundUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-purple-500/25 to-blue-500/25 border border-cyan-500/40 flex items-center justify-center text-2xl overflow-hidden shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                                            {r.logo?.startsWith("http") || r.logo?.startsWith("data:") ? (
                                                <img src={r.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{r.emblem || r.logo || "⚔️"}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-extrabold text-xl leading-tight truncate group-hover:text-cyan-300 transition-colors">
                                                {r.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                    <Users size={11} className="text-cyan-400" /> {r.usersCount || 0}
                                                </span>
                                                <span className="text-xs text-white/50 flex items-center gap-1 truncate">
                                                    <Shield size={12} className="text-amber-400 shrink-0" />
                                                    {r.owner}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {r.autoCleanMode && r.autoCleanMode !== "disabled" && (
                                        <div className="mb-3">
                                            <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl inline-flex items-center gap-1 font-mono font-bold">
                                                <Trash2 size={11} /> Auto-Limpieza: {r.autoCleanMode}
                                            </span>
                                        </div>
                                    )}

                                    {r.rules && (
                                        <div className="bg-black/40 border border-white/5 p-3 rounded-2xl mb-4">
                                            <p className="text-xs text-gray-300 italic line-clamp-2">"{r.rules}"</p>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => joinRoom(r.id, r)}
                                    className="relative z-10 w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500 hover:to-blue-600 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-transparent font-bold py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
                                >
                                    Entrar a la Sala
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreate} className="bg-[#0e121d]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto scrollbar-thin">
                        <button 
                            type="button" 
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                            <Plus size={24} className="text-cyan-400"/>
                            Crea tu Propio Chat
                        </h2>
                        <p className="text-xs text-white/50 mb-5">Configura tu sala con tu propio logo, nombre grande y limpieza programada.</p>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-2xl mb-4 flex items-center gap-2 text-red-200 text-xs">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-wider">
                                    NOMBRE DE LA SALA (Se mostrará en grande)
                                </label>
                                <input 
                                    type="text" 
                                    value={newRoomName} 
                                    onChange={e => setNewRoomName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/15 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400 font-bold text-base placeholder-white/20"
                                    placeholder="Ej: Clan Otaku • Gamer Zone"
                                    maxLength={40}
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center justify-between">
                                    <span>LOGO / EMBLEMA DE TU CHAT</span>
                                    <span className="text-[10px] text-cyan-400 font-normal">Elige uno o pon un enlace</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/40 rounded-2xl border border-white/10">
                                    {EMBLEM_PRESETS.map((emb) => (
                                        <button
                                            key={emb}
                                            type="button"
                                            onClick={() => {
                                                setNewRoomLogo(emb);
                                                setCustomLogoUrl("");
                                            }}
                                            className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                                                newRoomLogo === emb && !customLogoUrl
                                                    ? "bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] scale-110"
                                                    : "bg-white/5 hover:bg-white/10 border border-white/5"
                                            }`}
                                        >
                                            {emb}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="text"
                                    value={customLogoUrl}
                                    onChange={e => setCustomLogoUrl(e.target.value)}
                                    placeholder="O pega URL de imagen de logo (https://...)"
                                    className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-400"
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                    <Trash2 size={13} className="text-amber-400" />
                                    LIMPIEZA AUTOMÁTICA
                                </label>
                                <select 
                                    value={newRoomAutoClean}
                                    onChange={e => setNewRoomAutoClean(e.target.value)}
                                    className="w-full bg-black/50 border border-white/15 text-white px-3 py-2.5 rounded-2xl focus:outline-none focus:border-cyan-400 text-xs"
                                >
                                    <option value="disabled">Desactivada (Conservar historial)</option>
                                    <option value="1h">Cada 1 Hora (Purgar mensajes viejos)</option>
                                    <option value="6h">Cada 6 Horas</option>
                                    <option value="24h">Cada 24 Horas</option>
                                    <option value="20msgs">Al llegar a 20 mensajes (Mantener los 20 más recientes)</option>
                                    <option value="50msgs">Al llegar a 50 mensajes (Mantener los 50 más recientes)</option>
                                    <option value="100msgs">Al llegar a 100 mensajes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-wider">
                                    FONDO DE PANTALLA DE LA SALA (Opcional)
                                </label>
                                <input 
                                    type="text" 
                                    value={newRoomBg} 
                                    onChange={e => setNewRoomBg(e.target.value)}
                                    className="w-full bg-black/50 border border-white/15 text-white px-3 py-2.5 rounded-2xl focus:outline-none focus:border-cyan-400 text-xs placeholder-white/20"
                                    placeholder="URL de imagen, GIF animado o video MP4"
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-wider">
                                    REGLAS DE LA SALA (Opcional)
                                </label>
                                <textarea 
                                    value={newRoomRules} 
                                    onChange={e => setNewRoomRules(e.target.value)}
                                    className="w-full bg-black/50 border border-white/15 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400 resize-none h-20 text-xs placeholder-white/20"
                                    placeholder="Reglas de la sala, temas permitidos, etc."
                                    maxLength={150}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all">
                            Crear y Abrir Sala
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
