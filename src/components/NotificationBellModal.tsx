import React from 'react';
import { Bell, Heart, ThumbsUp, MessageSquare, X, Trash2, CheckCircle2, User, ArrowRight, UserPlus } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'like' | 'heart' | 'private_msg' | 'friend_accepted' | 'friend_rejected' | 'friend_request' | 'profile_comment';
  sender: string;
  senderPic?: string;
  text?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClear: () => void;
  onViewProfile: (username: string) => void;
  onOpenPrivateChat: (username: string) => void;
}

export function NotificationBellModal({
  isOpen,
  onClose,
  notifications,
  onClear,
  onViewProfile,
  onOpenPrivateChat,
}: NotificationBellModalProps) {
  if (!isOpen) return null;

  const handleItemClick = (n: NotificationItem) => {
    onClose();
    if (n.type === 'like' || n.type === 'heart') {
      // Derivar automáticamente a ver el perfil del usuario que envió like o corazón
      onViewProfile(n.sender);
    } else if (n.type === 'private_msg') {
      // Derivar automáticamente al chat privado con ese usuario
      onOpenPrivateChat(n.sender);
    } else if (n.type === 'friend_accepted') {
      onViewProfile(n.sender);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Ahora mismo';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1322] border border-cyan-500/30 rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151a2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Notificaciones</h3>
              <p className="text-[11px] text-gray-400">Likes, corazoncitos y mensajes privados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClear}
                className="text-[11px] text-gray-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                title="Limpiar todas"
              >
                <Trash2 size={13} />
                <span>Limpiar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                <Bell size={22} />
              </div>
              <p className="text-gray-400 text-xs font-medium">No tienes notificaciones pendientes</p>
              <p className="text-gray-600 text-[11px]">Aquí verás los likes, corazones y mensajes privados</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:scale-[1.01] active:scale-[0.99] ${
                  n.type === 'heart'
                    ? 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20'
                    : n.type === 'like'
                    ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'
                    : 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/15">
                      {n.senderPic ? (
                        <img src={n.senderPic} alt={n.sender} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                          {n.sender.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-md border border-[#0f1322] bg-[#1a2238]">
                      {n.type === 'heart' ? (
                        <Heart size={11} className="text-pink-400 fill-pink-400" />
                      ) : n.type === 'like' ? (
                        <ThumbsUp size={11} className="text-cyan-400 fill-cyan-400" />
                      ) : n.type === 'friend_request' ? (
                        <UserPlus size={11} className="text-emerald-400" />
                      ) : (
                        <MessageSquare size={11} className="text-purple-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{n.sender}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {n.type === 'heart' && 'te envió un corazoncito ❤️'}
                        {n.type === 'like' && 'le dio like a tu perfil 👍'}
                        {n.type === 'friend_request' && 'te envió una solicitud de amistad 🤝'}
                        {n.type === 'profile_comment' && 'comentó en tu perfil 💬'}
                        {n.type === 'private_msg' && 'te envió un mensaje privado 💬'}
                        {n.type === 'friend_accepted' && 'aceptó tu solicitud de amistad ✨'}
                        {n.type === 'friend_rejected' && 'rechazó la solicitud de amistad'}
                      </span>
                    </p>
                    {n.text && (
                      <p className="text-[11px] text-gray-300 line-clamp-1 italic">
                        "{n.text}"
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500">{formatTime(n.timestamp)}</p>
                  </div>
                </div>

                <div className="text-gray-400 hover:text-white shrink-0 p-1">
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
