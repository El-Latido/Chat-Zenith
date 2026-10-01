import React, { useState, useEffect } from 'react';
import { Globe, Key, X, Check, ExternalLink, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { getSavedTavilyKey, saveTavilyKey, searchWeb } from '../utils/tavilySearch';

interface TavilyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (newKey: string) => void;
}

export function TavilyConfigModal({ isOpen, onClose, onKeySaved }: TavilyConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [autoSearch, setAutoSearch] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getSavedTavilyKey());
      const savedAuto = localStorage.getItem("chatliz_auto_web_search");
      setAutoSearch(savedAuto !== "false");
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const clean = apiKey.trim();
    saveTavilyKey(clean);
    localStorage.setItem("chatliz_auto_web_search", autoSearch ? "true" : "false");
    setStatusMsg({
      text: clean ? "¡Tavily API Key guardada de forma segura!" : "Clave eliminada. La búsqueda web se ha desactivado.",
      error: false,
    });
    if (onKeySaved) onKeySaved(clean);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    const clean = apiKey.trim();
    if (!clean) {
      setStatusMsg({ text: "Ingresa una clave de API de Tavily antes de probar.", error: true });
      return;
    }
    setIsTesting(true);
    setStatusMsg(null);
    try {
      const res = await searchWeb("noticias de tecnologia hoy", clean);
      if (res && res.results && res.results.length > 0) {
        setStatusMsg({
          text: `✅ ¡Conexión exitosa! Tavily respondió con ${res.results.length} resultados actualizados.`,
          error: false,
        });
      } else {
        setStatusMsg({
          text: "✅ Conexión con Tavily confirmada correctamente.",
          error: false,
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: `❌ Error de conexión: ${err.message || "No se pudo validar la clave."}`,
        error: true,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#131722] to-[#0b0d14] rounded-3xl border border-cyan-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                Búsqueda Web en Tiempo Real
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Tavily AI
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Acceso a Internet en vivo para Elizabeth</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-4 text-xs text-cyan-200 leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Sparkles size={14} className="text-cyan-400" />
              ¿Para qué sirve esta clave?
            </div>
            <p>
              Permite que Elizabeth acceda a Internet en tiempo real para responder con información fresca sobre noticias de actualidad, partidos deportivos, precios del mercado, clima, horas del mundo, código y novedades que excedan su base inicial.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key size={15} className="text-cyan-400" />
                Tavily API Key (Búsqueda Web)
              </span>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline font-normal"
              >
                Obtener clave gratis <ExternalLink size={12} />
              </a>
            </label>

            <div className="relative flex items-center">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tvly-xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors pr-24 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                {showKey ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Tu clave se almacena de forma segura en tu navegador y nunca se expone en código público.
            </p>
          </div>

          {/* Toggle Auto Search */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <div className="text-sm font-medium text-white">Búsqueda Inteligente Automática</div>
              <div className="text-xs text-gray-400">Elizabeth activará la búsqueda al detectar preguntas sobre actualidad.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSearch}
                onChange={(e) => setAutoSearch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start gap-2 ${
                statusMsg.error
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {statusMsg.error ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <ShieldCheck size={16} className="shrink-0 mt-0.5" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey.trim()}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw size={13} className="animate-spin text-cyan-400" />
                Probando conexión...
              </>
            ) : (
              <>
                <Globe size={13} className="text-cyan-400" />
                Probar Conexión
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
            >
              <Check size={14} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
