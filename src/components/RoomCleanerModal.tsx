import React, { useState } from "react";
import { Trash2, Sparkles, X, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";

interface RoomCleanerModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageCount: number;
  maxLimit?: number;
  lastMessage?: {
    id?: string;
    sender?: string;
    text?: string;
    timestamp?: any;
  } | null;
  onCleanKeepLast: () => Promise<void>;
  onClearAll?: () => Promise<void>;
  onReplyLastMessage?: () => void;
  isAdmin?: boolean;
}

export const RoomCleanerModal: React.FC<RoomCleanerModalProps> = ({
  isOpen,
  onClose,
  messageCount,
  maxLimit = 20,
  lastMessage,
  onCleanKeepLast,
  onClearAll,
  onReplyLastMessage,
  isAdmin = false,
}) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((messageCount / maxLimit) * 100));

  const handleCleanNow = async () => {
    setIsCleaning(true);
    setSuccessMsg(null);
    try {
      await onCleanKeepLast();
      setSuccessMsg("¡Sala limpiada exitosamente! Se conservó el último mensaje.");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      alert("Error al limpiar: " + (err?.message || err));
    } finally {
      setIsCleaning(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("¿Deseas vaciar completamente todos los mensajes de la sala global?")) return;
    setIsCleaning(true);
    try {
      if (onClearAll) await onClearAll();
      setSuccessMsg("Sala vaciada por completo.");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      alert("Error: " + (err?.message || err));
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0d0f17] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Trash2 size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Limpiador de Sala Global
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                  Auto 20 Msgs
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Mantiene la sala rápida, limpia y con hilo continuo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Progress / Status Block */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Mensajes acumulados
              </span>
              <span className="text-cyan-300 font-mono text-sm">
                {messageCount} / {maxLimit} mensajes ({percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  messageCount >= 18
                    ? "bg-gradient-to-r from-rose-500 to-amber-500"
                    : messageCount >= 14
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400 pt-1">
              <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-200">Regla Automática:</strong> Al llegar a los <strong>20 mensajes</strong>, 
                el sistema borra automáticamente los mensajes anteriores y <strong>conserva el último mensaje</strong> para que cualquier usuario pueda leerlo y responder de inmediato.
              </span>
            </div>
          </div>

          {/* Last Message Preview */}
          {lastMessage && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Último Mensaje Guardado
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {lastMessage.sender}
                </span>
              </div>
              <div className="text-sm text-gray-200 bg-black/30 p-2.5 rounded-xl border border-white/5 line-clamp-3">
                {lastMessage.text || "(Archivo / Audio / Imagen)"}
              </div>
              {onReplyLastMessage && (
                <button
                  onClick={() => {
                    onReplyLastMessage();
                    onClose();
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <MessageSquare size={14} />
                  Responder a este mensaje ahora
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Manual Trigger Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleCleanNow}
              disabled={isCleaning || messageCount <= 1}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
            >
              <Trash2 size={16} />
              {isCleaning ? "Limpiando..." : "Limpiar sala ahora (Conservar último mensaje)"}
            </button>

            {isAdmin && onClearAll && (
              <button
                onClick={handleClearAll}
                disabled={isCleaning || messageCount === 0}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle size={14} />
                Vaciar todo (Solo Administrador)
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-gray-500">
          <span>Chat Global • Limpiador v2.0</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
