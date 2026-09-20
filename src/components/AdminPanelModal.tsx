import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  Trash2,
  Sparkles,
  Palette,
  Bot,
  UserCheck,
  UserX,
  Ban,
  Crown,
  Users,
  AlertTriangle,
  RefreshCw,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  messagesCount: number;
  delegatedAdmins: string[];
  bannedUsers: string[];
  allUsersList: Array<{ username: string; profilePic?: string; role?: string }>;
  onOpenCleaner: () => void;
  onOpenSyncToAxis: () => void;
  onOpenCustomizer: () => void;
  onOpenAiConfig: () => void;
  onPromoteToAdmin: (username: string) => Promise<void>;
  onDemoteAdmin: (username: string) => Promise<void>;
  onBanAdminOrUser: (username: string) => Promise<void>;
  onUnbanUser: (username: string) => Promise<void>;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  currentUser,
  messagesCount,
  delegatedAdmins,
  bannedUsers,
  allUsersList,
  onOpenCleaner,
  onOpenSyncToAxis,
  onOpenCustomizer,
  onOpenAiConfig,
  onPromoteToAdmin,
  onDemoteAdmin,
  onBanAdminOrUser,
  onUnbanUser,
}: AdminPanelModalProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'admins' | 'bans'>('tools');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMasterAdmin =
    currentUser?.username === 'AXISS' || currentUser?.username === 'Axiss';

  const handleAction = async (actionId: string, fn: () => Promise<void>) => {
    setLoadingAction(actionId);
    try {
      await fn();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0e17] border border-red-500/40 rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[88vh] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/50 via-[#151221] to-[#0b0e17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Panel Oculto de Administración
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30 uppercase font-mono font-bold">
                  {isMasterAdmin ? 'Master Admin' : 'Admin Delegado'}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Acceso restringido para control total del chat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#07090f] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'tools'
                ? 'border-red-400 text-red-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Flame size={14} />
            <span>Herramientas Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'admins'
                ? 'border-cyan-400 text-cyan-300 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Crown size={14} />
            <span>Administradores</span>
          </button>

          {isMasterAdmin && (
            <button
              onClick={() => setActiveTab('bans')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'bans'
                  ? 'border-rose-400 text-rose-300 bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Ban size={14} />
              <span>Bloqueados ({bannedUsers.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Tools */}
        {activeTab === 'tools' && (
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin">
            <div className="text-xs text-gray-400 leading-relaxed bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
              Esta sección oculta reúne las funciones que estaban visibles en el chat global, para que solo tú como administrador las controles.
            </div>

            {/* Cleaner Button */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>Limpiador de Sala Global</span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                      {messagesCount}/20 Mensajes
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Se auto-limpia a los 20 mensajes preservando el último para responder
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCleaner();
                }}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                Abrir Limpiador
              </button>
            </div>

            {/* Sync to ChatLiz Button */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    Transportador a ChatLiz (Hugging Face / Axis)
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Enviar cambios de diseño, limpiador y código con tu token o cloud
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSyncToAxis();
                }}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all shrink-0"
              >
                Transportar
              </button>
            </div>

            {/* Global Customizer Button */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    Personalizar Chat Global (Tema y Reglas)
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Modificar estilos, colores y parámetros globales del chat
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCustomizer();
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all shrink-0"
              >
                Personalizar
              </button>
            </div>

            {/* AI Config Button */}
            <div className="p-3.5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    Configuración de IA (Elizabeth)
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Instrucciones de sistema, personalidad y avatar del asistente IA
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAiConfig();
                }}
                className="px-3 py-2 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                Configurar IA
              </button>
            </div>

            {/* Admin-only Default Chat Background */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>Fondo Predeterminado de la App (Global)</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                      Solo Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Establece el fondo de pantalla predeterminado para todos los usuarios del chat
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://ejemplo.com/fondo-predeterminado.jpg"
                  defaultValue={localStorage.getItem("chatliz_app_default_bg") || ""}
                  id="admin-default-bg-input"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("admin-default-bg-input") as HTMLInputElement;
                    if (el) {
                      localStorage.setItem("chatliz_app_default_bg", el.value.trim());
                      window.dispatchEvent(new Event("chatliz_ui_update"));
                      alert("✅ Fondo predeterminado de la app actualizado correctamente");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all shrink-0"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Admin-only SDK Backgrounds */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>Fondos SDK de Publicidad & Video</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                      Solo Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Fondo visual para las pantallas del reproductor SDK de videos recompensados
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://ejemplo.com/fondo-sdk.jpg"
                  defaultValue={localStorage.getItem("chatliz_sdk_bg") || ""}
                  id="admin-sdk-bg-input"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("admin-sdk-bg-input") as HTMLInputElement;
                    if (el) {
                      localStorage.setItem("chatliz_sdk_bg", el.value.trim());
                      window.dispatchEvent(new Event("chatliz_ui_update"));
                      alert("✅ Fondo del SDK publicitario actualizado");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all shrink-0"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Admin-only Video Monetization & AI Tokens Permission */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>Permiso de Reproducción de Videos (Tokens IA & Monetización)</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                      Solo Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Habilita videos publicitarios para recargar tokens cuando las IA se queden sin saldo
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  defaultChecked={localStorage.getItem("chatliz_video_monetization_enabled") !== "false"}
                  onChange={(e) => {
                    localStorage.setItem("chatliz_video_monetization_enabled", e.target.checked.toString());
                    window.dispatchEvent(new Event("chatliz_ui_update"));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Admins Management */}
        {activeTab === 'admins' && (
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200">
              <strong>Regla de Autoridad:</strong> Solo <strong>AXISS</strong> y <strong>Axiss</strong> son Administradores Principales inmunes. Pueden nombrar a otros usuarios como administradores y también quitarlos o bloquearlos si cometen errores.
            </div>

            {/* Master Admins List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" />
                Administradores Principales (Inmunes)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['AXISS', 'Axiss'].map((adminName) => (
                  <div
                    key={adminName}
                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                        👑
                      </div>
                      <span className="font-bold text-white text-xs">{adminName}</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Inmune
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delegated Admins */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" />
                Administradores Delegados ({delegatedAdmins.length})
              </h4>
              {delegatedAdmins.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-2">
                  No hay administradores delegados actualmente.
                </p>
              ) : (
                <div className="space-y-2">
                  {delegatedAdmins.map((adm) => (
                    <div
                      key={adm}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-white">{adm}</span>
                      {isMasterAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              handleAction(`demote_${adm}`, () => onDemoteAdmin(adm))
                            }
                            disabled={loadingAction === `demote_${adm}`}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1"
                            title="Quitar permisos de administrador"
                          >
                            <UserX size={13} />
                            <span>Quitar</span>
                          </button>
                          <button
                            onClick={() =>
                              handleAction(`ban_${adm}`, () => onBanAdminOrUser(adm))
                            }
                            disabled={loadingAction === `ban_${adm}`}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs text-rose-300 transition-all flex items-center gap-1"
                            title="Bloquear/Banear usuario"
                          >
                            <Ban size={13} />
                            <span>Bloquear</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nominate new admins (Master Admin only) */}
            {isMasterAdmin && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-400" />
                  Nombrar Nuevo Administrador
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {allUsersList
                    .filter(
                      (u) =>
                        u.username !== 'AXISS' &&
                        u.username !== 'Axiss' &&
                        !delegatedAdmins.includes(u.username) &&
                        !bannedUsers.includes(u.username)
                    )
                    .map((u) => (
                      <div
                        key={u.username}
                        className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-300">{u.username}</span>
                        <button
                          onClick={() =>
                            handleAction(`promote_${u.username}`, () =>
                              onPromoteToAdmin(u.username)
                            )
                          }
                          disabled={loadingAction === `promote_${u.username}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <UserCheck size={13} />
                          <span>Hacer Admin</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Banned Users */}
        {activeTab === 'bans' && isMasterAdmin && (
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Ban size={14} className="text-rose-400" />
              Usuarios y Administradores Bloqueados
            </h4>
            {bannedUsers.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 text-center">
                No hay usuarios bloqueados actualmente.
              </p>
            ) : (
              <div className="space-y-2">
                {bannedUsers.map((u) => (
                  <div
                    key={u}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-rose-300">{u}</span>
                    <button
                      onClick={() =>
                        handleAction(`unban_${u}`, () => onUnbanUser(u))
                      }
                      disabled={loadingAction === `unban_${u}`}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                    >
                      Desbloquear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#07090f] flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
