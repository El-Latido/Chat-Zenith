import React from 'react';
import { MessageSquare, AtSign, MessageCircle, X, Trash2, ArrowRight, Radio } from 'lucide-react';

export interface MailboxItem {
  id: string;
  type: 'mention' | 'private_chat';
  sender: string;
  senderPic?: string;
  room?: string; // e.g. 'global' or 'room_abc' or 'private'
  roomTitle?: string;
  text: string;
  timestamp: number;
  read: boolean;
}

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MailboxItem[];
  onClear: () => void;
  onNavigateToRoom: (room: string) => void;
  onOpenPrivateChat: (sender: string) => void;
}

export function MailboxModal({
  isOpen,
  onClose,
  items,
  onClear,
  onNavigateToRoom,
  onOpenPrivateChat,
}: MailboxModalProps) {
  if (!isOpen) return null;

  const handleItemClick = (item: MailboxItem) => {
    onClose();
    if (item.type === 'private_chat') {
      onOpenPrivateChat(item.sender);
    } else if (item.room) {
      onNavigateToRoom(item.room);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(ts).toLocaleDateString();
  };

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
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Buzón de Mensajes</h3>
              <p className="text-[11px] text-gray-400">Menciones en salas y mensajes directos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-[11px] text-gray-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                title="Limpiar buzón"
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

        {/* List of items */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                <MessageSquare size={22} />
              </div>
              <p className="text-gray-400 text-xs font-medium">Buzón vacío</p>
              <p className="text-gray-600 text-[11px] max-w-xs mx-auto">
                Cuando alguien te mencione por tu nombre en una sala o te escriba en privado, aparecerá aquí.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 flex items-start justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                      {item.senderPic ? (
                        <img src={item.senderPic} alt={item.sender} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                          {item.sender.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] bg-[#172033] border border-white/20">
                      {item.type === 'mention' ? (
                        <AtSign size={10} className="text-amber-400" />
                      ) : (
                        <MessageCircle size={10} className="text-cyan-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{item.sender}</span>
                      <span className="text-[10px] text-gray-500 shrink-0">{formatTime(item.timestamp)}</span>
                    </div>

                    <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
                      {item.type === 'mention' ? (
                        <>
                          <span className="text-amber-400 font-bold">Te nombró en:</span>
                          <span className="truncate">{item.roomTitle || item.room || 'Chat Global'}</span>
                        </>
                      ) : (
                        <span>Mensaje privado</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 bg-black/30 p-2 rounded-xl border border-white/5 break-words">
                      {item.text}
                    </p>
                  </div>
                </div>

                <div className="text-gray-400 hover:text-white shrink-0 pt-2">
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
