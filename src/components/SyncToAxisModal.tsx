import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Send,
  Radio,
  Download,
  Palette,
  ArrowRight,
  Cpu,
  RefreshCw,
  ExternalLink,
  Copy,
  Terminal,
  FileCode2,
  Share2,
  Key,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState<'appearance' | 'token_hf' | 'code_hf'>('token_hf');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // HF Token deployment state (Manual entry for security)
  const [showTokenText, setShowTokenText] = useState(false);
  const [targetSpace, setTargetSpace] = useState(() => {
    try {
      return localStorage.getItem("hf_target_space") || "chatliz-online/ChatLiz";
    } catch {
      return "chatliz-online/ChatLiz";
    }
  });
  const [hfToken, setHfToken] = useState("");
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message?: string; error?: string; user?: string; spaceUrl?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeployResult(null);
      setIsSuccess(false);
      try {
        localStorage.removeItem("hf_space_token");
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncAppearance = async () => {
    setIsSending(true);
    try {
      const timestamp = Date.now();
      const payload: ChatConfig = {
        ...(currentGlobalConfig || {}),
        updatedBy: "Zenith / Axis (Transportador Cloud)",
        updatedAt: timestamp,
      };

      // 1. Guardar en configuración global de Firestore compartida
      await setDoc(doc(db, "settings", "global_chat_config"), payload, { merge: true });
      if (payload.backgroundBase64 || payload.backgroundUrl) {
        await setDoc(
          doc(db, "settings", "globalBg"),
          { url: payload.backgroundBase64 || payload.backgroundUrl || "" },
          { merge: true }
        );
      }

      // 2. Guardar en los canales de actualización de sistemas para ChatLiz y Axis
      const updateData = {
        originChat: "https://chat-zenith.onrender.com/",
        targetSpaces: [
          "https://chatliz-online-chatliz.hf.space/",
          "Chat Principal Li (Axis)"
        ],
        status: "approved_and_applied",
        version: "v3.0-cleaner20-live",
        timestamp,
        config: payload,
        message: "Aspecto visual, diseño, fondos, limpiador y temas transportados con éxito a ChatLiz (Hugging Face) y Axis.",
      };

      await Promise.all([
        setDoc(doc(db, "system_updates", "appearance_for_chatliz"), updateData, { merge: true }),
        setDoc(doc(db, "system_updates", "appearance_for_Axiss"), updateData, { merge: true }),
        setDoc(doc(db, "system_updates", "appearance_for_axis"), updateData, { merge: true }),
        setDoc(doc(db, "system_updates", "appearance_for_Axis"), updateData, { merge: true }),
      ]);

      // 3. Registrar auditoría en Firestore
      try {
        await addDoc(collection(db, "update_requests"), {
          sender: "Chat Zenith (Render)",
          recipients: [
            "https://chatliz-online-chatliz.hf.space/",
            "Axis (Chat Li)"
          ],
          action: "TRANSPORT_APPEARANCE_AND_DESIGN",
          config: payload,
          createdAt: timestamp,
          applied: true,
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      // 4. Emitir eventos de sockets para actualización en caliente
      socket.emit("update_chat_config", { chat: "global", config: payload });
      socket.emit("sync_appearance_to_axis", {
        target: "all_spaces",
        targetUrl: "https://chatliz-online-chatliz.hf.space/",
        config: payload,
      });

      // 5. Enviar anuncio en el chat global
      socket.emit("send_message", {
        room: "global",
        text: "🚀 [TRANSPORTADOR CLOUD]: ¡Aspecto, diseño y mejoras visuales transportadas con éxito desde Zenith hacia ChatLiz (https://chatliz-online-chatliz.hf.space/) y Chat Li (Axis)! Todos los chats sincronizados sin errores.",
        system: true,
      });

      setIsSuccess(true);
      if (onToast) {
        onToast("✅ ¡Aspecto y diseño transportados a ChatLiz (Hugging Face) y Axis!");
      }
    } catch (err: any) {
      console.error("Error transporting appearance:", err);
      if (onToast) {
        onToast("⚠️ Error al sincronizar, verifique su conexión.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDeployWithToken = async () => {
    const trimmed = hfToken.trim();
    if (!trimmed) {
      if (onToast) onToast("⚠️ Ingresa tu Token de Hugging Face");
      return;
    }

    if (!trimmed.startsWith("hf_")) {
      if (onToast) onToast("⚠️ El token de Hugging Face debe comenzar con 'hf_'");
      setDeployResult({
        success: false,
        error: "El token debe comenzar con 'hf_'. Por favor revísalo.",
      });
      return;
    }

    setIsDeployingToken(true);
    setDeployResult(null);

    const space = targetSpace.trim() || "chatliz-online/ChatLiz";

    const onResponseReceived = (data: any) => {
      setDeployResult(data);
      if (data && data.success) {
        handleSyncAppearance();
        if (onToast) onToast("🎉 ¡Despliegue a Hugging Face iniciado con éxito!");
      } else {
        if (onToast) onToast(`❌ Error: ${data?.error || "No se pudo desplegar"}`);
      }
    };

    // 1. Intentar primero a través de Socket.io (conexión WebSocket en vivo, inmune a caídas de proxy o CORS)
    if (socket && socket.connected) {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          fallbackHttp();
        }
      }, 45000);

      socket.emit("deploy_to_hf", { token: trimmed, space }, (resData: any) => {
        resolved = true;
        clearTimeout(timeoutId);
        setIsDeployingToken(false);
        onResponseReceived(resData);
      });
      return;
    }

    // 2. Si el socket no está listo, usar HTTP POST como respaldo
    fallbackHttp();

    async function fallbackHttp() {
      try {
        const res = await fetch("/api/deploy-to-huggingface", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            token: trimmed,
            space,
          }),
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: res.ok,
            error: res.ok ? undefined : `Respuesta del servidor (${res.status}): ${text.slice(0, 150)}`,
            message: res.ok ? text : undefined
          };
        }

        onResponseReceived(data);
      } catch (err: any) {
        console.error("HTTP deploy error:", err);
        setDeployResult({
          success: false,
          error: `Error al contactar con el servidor: ${err?.message || "Compruebe su conexión"}`,
        });
        if (onToast) onToast("❌ Error de conexión al servidor");
      } finally {
        setIsDeployingToken(false);
      }
    }
  };

  const handleDownloadConfigJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentGlobalConfig || {}, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "chatliz-appearance-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onToast) onToast("💾 Configuración JSON descargada");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
    if (onToast) onToast("📋 Copiado al portapapeles");
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e121e] border border-cyan-500/40 rounded-3xl max-w-xl w-full shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 via-[#141b2d] to-[#0e121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Share2 size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Transportador a Hugging Face
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider font-bold">
                  Con Token
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Transportar aspecto, diseño y funcionalidad desde Zenith hacia ChatLiz
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0a0d15] px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('token_hf')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'token_hf'
                ? 'border-emerald-400 text-emerald-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key size={15} />
            <span>Despliegue por Token (1 Clic)</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Palette size={15} />
            <span>Aspecto y Diseño en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('code_hf')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'code_hf'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode2 size={15} />
            <span>Manual (.zip / Git)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin text-xs">
          {/* Route details banner */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="text-gray-400 font-medium">Origen actual:</span>
              <span className="text-cyan-300 font-mono font-bold bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                https://chat-zenith.onrender.com/
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="text-gray-400 font-medium">Destino Hugging Face:</span>
              <a
                href="https://chatliz-online-chatliz.hf.space/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 font-mono font-bold bg-amber-950/40 hover:bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-800/40 flex items-center gap-1 transition-all"
              >
                https://chatliz-online-chatliz.hf.space/
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* TAB 1: TOKEN DEPLOYMENT */}
          {activeTab === 'token_hf' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <ShieldCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-300 text-xs">
                    ¡Sí, se puede hacer 100% automático mediante tu Token de Hugging Face!
                  </h4>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    Ingresa tu <strong>User Access Token</strong> de Hugging Face con permisos de <strong>Write</strong>. El servidor subirá el código nuevo (con el Limpiador de 20 mensajes, Radio HD, reproductor y diseño) directamente al repositorio de tu Space <code>chatliz-online/ChatLiz</code>.
                  </p>
                </div>
              </div>

              {/* Token Input Box */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white text-xs flex items-center gap-2">
                    <Key size={14} className="text-cyan-400" />
                    Hugging Face Access Token (hf_...)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text && text.trim().startsWith("hf_")) {
                            setHfToken(text.trim());
                            if (onToast) onToast("📋 Token pegado desde el portapapeles");
                          } else if (text) {
                            setHfToken(text.trim());
                          }
                        } catch {
                          if (onToast) onToast("Pega tu token directamente en la casilla");
                        }
                      }}
                      className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                      title="Pegar token"
                    >
                      <Copy size={11} />
                      Pegar
                    </button>
                    {hfToken && (
                      <button
                        type="button"
                        onClick={() => {
                          setHfToken("");
                          if (onToast) onToast("🗑️ Token borrado");
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg transition-all"
                        title="Borrar token de la pantalla"
                      >
                        <X size={11} />
                        Borrar
                      </button>
                    )}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1"
                    >
                      Obtener Token
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showTokenText ? "text" : "password"}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    className="w-full bg-[#070a12] border border-cyan-500/40 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400 placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTokenText(!showTokenText)}
                    className="absolute right-2.5 text-gray-400 hover:text-white p-1 transition-colors"
                    title={showTokenText ? "Ocultar token" : "Mostrar token"}
                  >
                    {showTokenText ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Target Space */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-gray-400 font-semibold flex items-center justify-between">
                    <span>Espacio de destino en Hugging Face:</span>
                    <span className="text-emerald-400 text-[10px]">chatliz-online/ChatLiz</span>
                  </label>
                  <input
                    type="text"
                    value={targetSpace}
                    onChange={(e) => setTargetSpace(e.target.value)}
                    placeholder="usuario/NombreDelSpace (ej: chatliz-online/ChatLiz)"
                    className="w-full bg-[#070a12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400 placeholder-gray-600"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Permiso: <strong className="text-emerald-300">Write</strong> (Escritura)
                  </span>
                  <span className="flex items-center gap-1">
                    Destino: <code className="text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/30">{targetSpace || "chatliz-online/ChatLiz"}</code>
                  </span>
                </div>

                {/* Quick 3-Step help */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 space-y-1 text-[10px] text-gray-300">
                  <div className="font-bold text-gray-200">¿Cómo funciona el pase de actualizaciones?</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
                    <li>Coloca o pega manualmente tu token de Hugging Face de tipo <strong>Write</strong>.</li>
                    <li>Haz clic en <strong>"Desplegar Todo a Hugging Face"</strong>.</li>
                    <li>El servidor sube automáticamente el código, diseño y limpiador a tu espacio <a href="https://chatliz-online-chatliz.hf.space/" target="_blank" rel="noreferrer" className="text-cyan-300 underline">chatliz-online-chatliz.hf.space</a>.</li>
                  </ol>
                </div>
              </div>

              {/* Deploy result feedback */}
              {deployResult && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 animate-in zoom-in-95 ${
                    deployResult.success
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {deployResult.success ? (
                    <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={22} className="text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white text-xs">
                      {deployResult.success ? "¡Despliegue Iniciado con Éxito!" : "Error en el Despliegue"}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {deployResult.message || deployResult.error}
                    </div>
                    {deployResult.success && (
                      <div className="pt-1.5 flex items-center gap-2">
                        <a
                          href="https://chatliz-online-chatliz.hf.space/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 font-bold border border-emerald-400/40 transition-all text-xs"
                        >
                          <ExternalLink size={13} />
                          Abrir Space en Vivo
                        </a>
                        <a
                          href="https://huggingface.co/spaces/chatliz-online/ChatLiz"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition-all text-xs"
                        >
                          Ver Logs de Compilación
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleDeployWithToken}
                disabled={isDeployingToken || !hfToken.trim()}
                className="w-full flex items-center justify-center gap-2 text-xs font-black text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 py-3 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 active:scale-95"
              >
                {isDeployingToken ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Conectando y Subiendo Código a Hugging Face...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>🚀 Desplegar Todo a Hugging Face con este Token</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: LIVE APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300">
                    Sincronización Inmediata en la Nube (Firestore & WebSockets)
                  </h4>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                    Al presionar el botón, el fondo actual, paleta de colores, neón, efectos y personalización se envían al instante a <strong>chatliz-online-chatliz.hf.space</strong> y al <strong>Chat Li (Axis)</strong> sin requerir recargar la página.
                  </p>
                </div>
              </div>

              {/* Module Highlights */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-300 uppercase tracking-wider px-1 text-[11px]">
                  Elementos que se transportan:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                    <Palette size={16} className="text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Aspecto Visual Completo</div>
                      <div className="text-[10px] text-gray-400">Fondo global, desenfoque y tema activo</div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                    <Flame size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Efectos Neón y Shaders</div>
                      <div className="text-[10px] text-gray-400">Resplandores, brillos y tarjetas</div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                    <Radio size={16} className="text-pink-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Emisora y Radio HD</div>
                      <div className="text-[10px] text-gray-400">Mismo reproductor y sintonizador</div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                    <Cpu size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Reglas del Limpiador</div>
                      <div className="text-[10px] text-gray-400">20 mensajes con último preservado</div>
                    </div>
                  </div>
                </div>
              </div>

              {isSuccess && (
                <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 rounded-2xl p-3.5 text-center animate-in zoom-in-95">
                  <CheckCircle2 size={26} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-white">¡Aspecto y Diseño Transportados con Éxito!</div>
                  <div className="text-[11px] text-emerald-200 mt-1">
                    La configuración visual ha sido inyectada en la base de datos común de Firestore y emitida a todos los clientes de <strong>https://chatliz-online-chatliz.hf.space/</strong> y <strong>Axis</strong>.
                  </div>
                </div>
              )}

              {/* Direct JSON backup */}
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                <div>
                  <div className="font-bold text-white">Descargar Copia de Respaldo (.json)</div>
                  <div className="text-[10px] text-gray-400">Guarda el archivo con la apariencia exacta para importar cuando quieras.</div>
                </div>
                <button
                  onClick={handleDownloadConfigJSON}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  <Download size={14} />
                  <span>Descargar</span>
                </button>
              </div>

              <button
                onClick={handleSyncAppearance}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 text-xs font-black text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 py-3 rounded-2xl transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 active:scale-95"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Transportando en Vivo...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>¡Aspecto Actualizado en Vivo!</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Transportar Aspecto y Diseño en Vivo</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: MANUAL ZIP / GIT */}
          {activeTab === 'code_hf' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-amber-200 leading-relaxed">
                <h4 className="font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                  <Terminal size={15} />
                  Comando Git con Token para Terminal
                </h4>
                <p className="text-[11px] text-amber-200/90">
                  Si prefieres usar la consola en tu computadora con tu token de Hugging Face:
                </p>
              </div>

              {/* Git with Token command */}
              <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Terminal size={15} className="text-cyan-400" />
                  Comando Git con Token Directo
                </div>
                <div className="bg-[#05070d] border border-white/15 rounded-xl p-2.5 font-mono text-[11px] text-cyan-300 flex items-center justify-between break-all">
                  <code>git push -f https://oauth2:{hfToken || 'TU_TOKEN'}@huggingface.co/spaces/chatliz-online/ChatLiz main</code>
                  <button
                    onClick={() => copyToClipboard(`git push -f https://oauth2:${hfToken || 'TU_TOKEN'}@huggingface.co/spaces/chatliz-online/ChatLiz main`, "git_token_cmd")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all ml-2 shrink-0"
                    title="Copiar comando"
                  >
                    {copiedCmd === "git_token_cmd" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Method ZIP */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Download size={15} className="text-amber-400" />
                  Descargar Código Fuente Empaquetado (.zip)
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="/api/download-hf-space-zip"
                    download="chatliz-huggingface-ready.zip"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black transition-all shadow-md active:scale-95"
                  >
                    <Download size={15} />
                    <span>Descargar .zip para Hugging Face</span>
                  </a>

                  <a
                    href="https://huggingface.co/spaces/chatliz-online/ChatLiz/tree/main"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition-all text-xs"
                  >
                    <ExternalLink size={14} />
                    <span>Ver Archivos en Hugging Face</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0d15] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            Cerrar
          </button>

          <a
            href="https://chatliz-online-chatliz.hf.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 rounded-xl border border-cyan-500/30 transition-all"
          >
            <ExternalLink size={14} />
            <span>Visitar ChatLiz Space</span>
          </a>
        </div>
      </div>
    </div>
  );
}
