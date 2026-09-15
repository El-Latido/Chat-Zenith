import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Hash, Plus, Users, Shield, X, AlertCircle } from 'lucide-react';

export function CustomRooms({ user, onJoinRoom }: { user: any, onJoinRoom: (roomId: string, roomData: any) => void }) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomRules, setNewRoomRules] = useState("");
    const [error, setError] = useState("");

    const loadRooms = () => {
        socket.emit("get_custom_rooms", (res: any) => {
            setRooms(res);
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
        if (!newRoomName.trim()) return setError("El nombre es requerido");
        
        socket.emit("create_custom_room", { name: newRoomName, rules: newRoomRules }, (res: any) => {
            if (res.success) {
                setIsCreating(false);
                setNewRoomName("");
                setNewRoomRules("");
                loadRooms();
            } else {
                setError(res.error || "Error al crear sala");
            }
        });
    };

    const joinRoom = (roomId: string) => {
        socket.emit("join_custom_room", roomId, (res: any) => {
            if (res.success) {
                onJoinRoom(roomId, res.room);
            } else {
                alert(res.error || "No se pudo unir a la sala");
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(r => (
                            <div key={r.id} className="bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-bold text-lg">{r.name}</h3>
                                        <span className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Users size={12} /> {r.usersCount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50 mb-4 flex items-center gap-1">
                                        <Shield size={14} className="text-white/80" />
                                        Dueño: {r.owner}
                                    </p>
                                    {r.rules && (
                                        <div className="bg-white/5 p-3 rounded-lg mb-4">
                                            <p className="text-xs text-gray-400 font-mono italic">"{r.rules}"</p>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => joinRoom(r.id)}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl transition-colors"
                                >
                                    Unirse a la Sala
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreate} className="bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-md p-6 relative">
                        <button 
                            type="button" 
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 p-2 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus size={24} className="text-white/80"/>
                            Crear Sala
                        </h2>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl mb-4 flex items-center gap-2 text-red-200">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-white/50 text-sm mb-1 font-mono">NOMBRE DE LA SALA</label>
                                <input 
                                    type="text" 
                                    value={newRoomName} 
                                    onChange={e => setNewRoomName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/10"
                                    placeholder="Ej: Sala de Anime"
                                    maxLength={30}
                                />
                            </div>
                            <div>
                                <label className="block text-white/50 text-sm mb-1 font-mono">REGLAS (Opcional)</label>
                                <textarea 
                                    value={newRoomRules} 
                                    onChange={e => setNewRoomRules(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/10 resize-none h-24"
                                    placeholder="Reglas de la sala, temas permitidos, etc."
                                    maxLength={150}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold py-3 rounded-xl shadow-lg transition-all">
                            Crear y Unirse
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
