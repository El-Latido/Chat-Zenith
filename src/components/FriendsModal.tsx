import React, { useState } from 'react';
import { UserPlus, Users, Check, X, User, MessageCircle, Trash2, Search, ExternalLink } from 'lucide-react';

export interface FriendRequest {
  id: string;
  from: string;
  fromPic?: string;
  timestamp: number;
}

export interface FriendUser {
  username: string;
  profilePic?: string;
  statusMessage?: string;
  addedAt?: number;
}

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendUser[];
  pendingRequests: FriendRequest[];
  onlineUsers: Array<{ username: string; profilePic?: string }>;
  onAcceptRequest: (request: FriendRequest) => void;
  onRejectRequest: (request: FriendRequest) => void;
  onRemoveFriend: (username: string) => void;
  onViewProfile: (username: string) => void;
  onOpenPrivateChat: (username: string) => void;
}

export function FriendsModal({
  isOpen,
  onClose,
  friends,
  pendingRequests,
  onlineUsers,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onViewProfile,
  onOpenPrivateChat,
}: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>(
    pendingRequests.length > 0 ? 'requests' : 'friends'
  );
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const onlineUsernames = new Set(onlineUsers.map((u) => u.username));

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1322] border border-cyan-500/30 rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151a2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Amigos & Solicitudes</h3>
              <p className="text-[11px] text-gray-400">Gestiona tus amigos y conexiones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0a0d16] px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'friends'
                ? 'border-cyan-400 text-cyan-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users size={14} />
            <span>Mis Amigos ({friends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 relative ${
              activeTab === 'requests'
                ? 'border-pink-400 text-pink-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus size={14} />
            <span>Solicitudes</span>
            {pendingRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            )}
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] border border-rose-500/40">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Friends List */}
        {activeTab === 'friends' && (
          <div className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar amigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                  <Users size={22} />
                </div>
                <p className="text-gray-400 text-xs font-medium">Aún no tienes amigos agregados</p>
                <p className="text-gray-600 text-[11px]">
                  Toca el perfil de un usuario en el chat para enviarle solicitud de amistad.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((f) => {
                  const isOnline = onlineUsernames.has(f.username);
                  return (
                    <div
                      key={f.username}
                      className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                        onClick={() => {
                          onClose();
                          onViewProfile(f.username);
                        }}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                            {f.profilePic ? (
                              <img
                                src={f.profilePic}
                                alt={f.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                                {f.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f1322] ${
                              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                            }`}
                            title={isOnline ? 'En línea' : 'Desconectado'}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span>{f.username}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                                isOnline
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-white/5 text-gray-400 border-white/5'
                              }`}
                            >
                              {isOnline ? 'En línea' : 'Desconectado'}
                            </span>
                          </div>
                          {f.statusMessage && (
                            <p className="text-[10px] text-gray-400 truncate">{f.statusMessage}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenPrivateChat(f.username);
                          }}
                          className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 transition-colors"
                          title="Enviar mensaje privado"
                        >
                          <MessageCircle size={15} />
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onViewProfile(f.username);
                          }}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          title="Ver perfil"
                        >
                          <User size={15} />
                        </button>
                        <button
                          onClick={() => onRemoveFriend(f.username)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Eliminar de amigos"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 'requests' && (
          <div className="p-3 space-y-2 flex-1 overflow-y-auto scrollbar-thin">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                  <UserPlus size={22} />
                </div>
                <p className="text-gray-400 text-xs font-medium">No tienes solicitudes pendientes</p>
                <p className="text-gray-600 text-[11px]">
                  Cuando alguien te envíe una solicitud de amistad, aparecerá aquí con un punto rojo.
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20 space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/15 shrink-0">
                      {req.fromPic ? (
                        <img src={req.fromPic} alt={req.from} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                          {req.from.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{req.from}</span>
                        <span className="text-[10px] text-pink-300 font-medium">quiere ser amigo tuyo</span>
                      </h4>
                      <p className="text-[10px] text-gray-400">¿Deseas aceptar la solicitud?</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onAcceptRequest(req)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Check size={14} />
                      <span>Aceptar</span>
                    </button>
                    <button
                      onClick={() => onRejectRequest(req)}
                      className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/5 active:scale-95"
                    >
                      <X size={14} />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
