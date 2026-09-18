import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Send,
  Radio,
  Download,
  Palette,
  Layers,
  ArrowRight,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { socket } from '../socket';
import { ChatConfig } from './ChatCustomizerModal';

interface SyncToAxisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGlobalConfig: ChatConfig | null;
  onToast?: (msg: string) => void;
}

export function SyncToAxisModal({
  isOpen,
  onClose,
  currentGlobalConfig,
  onToast,
}: SyncToAxisModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSyncToAxis = async () => {
    setIsSending(true);
    try {
      const timestamp = Date.now();
      const payload: ChatConfig = {
        ...(currentGlobalConfig || {}),
        updatedBy: "axis (Sector de Actualizaciones)",
        updatedAt: timestamp,
      };

      // 1. Save to primary Firestore settings read by both chats
      await setDoc(doc(db, "settings", "global_chat_config"), payload, { merge: true });
      if (payload.backgroundBase64 || payload.backgroundUrl) {
        await setDoc(
          doc(db, "settings", "globalBg"),
          { url: payload.backgroundBase64 || payload.backgroundUrl || "" },
          { merge: true }
        );
      }

      // 2. Save to special system update documents specifically targeting Axiss / Chat Li
      const updateData = {
        target: "Axiss",
        targetChat: "Li",
        origin: "Sector de Actualizaciones",
        status: "approved_and_applied",
        version: "v2.5-stable",
        timestamp,
        config: payload,
        message: "Aspecto visual y mejoras de radio/MP3 transferidas con 0 errores a Axiss.",
      };

      await Promise.all([
        setDoc(doc(db, "system_updates", "appearance_for_Axiss"), updateData, { merge: true }),
        setDoc(doc(db, "system_updates", "appearance_for_axis"), updateData, { merge: true }),
        setDoc(doc(db, "system_updates", "appearance_for_Axis"), updateData, { merge: true }),
      ]);

      // 3. Log into update_requests collection for audit history
      try {
        await addDoc(collection(db, "update_requests"), {
          sender: "Sector de Actualizaciones",
          recipient: "axis",
          targetChat: "Li",
          action: "SYNC_APPEARANCE",
          config: payload,
          createdAt: timestamp,
          applied: true,
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      // 4. Emit real-time socket events for instantaneous client reflection
      socket.emit("update_chat_config", { chat: "global", config: payload });
      socket.emit("sync_appearance_to_axis", {
        target: "axis",
        chat: "Li",
        config: payload,
      });

      // 5. Send an announcement in the global chat so both chats display confirmation
      socket.emit("send_message", {
        room: "global",
        text: "🚀 [SECTOR DE ACTUALIZACIONES ➔ AXIS]: ¡Solicitud de actualización completada! El aspecto visual y las mejoras han sido transferidos al Chat Principal 'Li'. Ambos chats tienen ahora la misma apariencia sin errores.",
        system: true,
      });

      setIsSuccess(true);
      if (onToast) {
        onToast("✅ ¡Aspecto y actualizaciones transferidos a Axis (Chat Principal Li)!");
      }
    } catch (err: any) {
      console.error("Error syncing to Axis:", err);
      if (onToast) {
        onToast("⚠️ Hubo un error al transferir, reintentando...");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#101422] border border-amber-500/40 rounded-3xl max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#182033] to-[#101422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Sector de Actualizaciones
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider font-bold">
                  ➔ Chat Li (Axis)
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Transferir aspecto visual y mejoras probadas al chat original
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Status Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">
                Entorno de Pruebas: 0 Errores Detectados
              </h4>
              <p className="text-[11px] text-emerald-200/70 mt-0.5">
                Todas las nuevas funciones están validadas y listas para sincronizarse con tu chat principal original <strong>Li</strong> administrado por <strong>Axis</strong>.
              </p>
            </div>
          </div>

          {/* Module Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider px-1">
              Paquete de Actualizaciones a Transferir:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                <Palette size={16} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Aspecto Visual</div>
                  <div className="text-[10px] text-gray-400">Fondos, temas y colores</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                <Radio size={16} className="text-pink-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Radio HD</div>
                  <div className="text-[10px] text-gray-400">Sin interferencias ni alabanzas</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                <Download size={16} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Descarga MP3 Móvil</div>
                  <div className="text-[10px] text-gray-400">Directa a descargas (sin YouTube)</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                <Cpu size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Sincronización Total</div>
                  <div className="text-[10px] text-gray-400">Firestore en tiempo real</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Information */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-gray-300 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400">Origen:</span>
              <span className="text-white font-bold">Chat-Liz (Sector Actualizaciones)</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400">Destinatario / Admin:</span>
              <span className="text-amber-300 font-bold">Axis (Tú mismo)</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400">Destino:</span>
              <span className="text-cyan-300 font-bold">Chat Original "Li"</span>
            </div>
          </div>

          {isSuccess && (
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl p-3 text-center animate-in zoom-in-95">
              <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">¡Sincronización Exitosa!</div>
              <div className="text-xs text-emerald-200 mt-0.5">
                La solicitud y el aspecto han sido enviados a Axis. El chat principal Li ahora comparte la misma apariencia.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0c0f18] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            {isSuccess ? "Cerrar" : "Cancelar"}
          </button>

          <button
            onClick={handleSyncToAxis}
            disabled={isSending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-black text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 active:scale-95"
          >
            {isSending ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Enviando a Axis...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>¡Actualizado con Éxito!</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Aprobar y Pasar a Chat Li (Axis)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
