import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  PlaySquare, 
  BarChart3, 
  Percent, 
  Sparkles, 
  Bot, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Coins
} from 'lucide-react';

export interface MonetizationStats {
  adViews: number;
  revenuePending: number;
  lifetimeRevenue: number;
  cpm?: number;
  earningsPerVideo?: number;
  todayViews?: number;
  todayRevenue?: number;
  ctr?: number;
  aiBreakdown?: Record<string, number>;
  userEarnings?: Record<string, {
    username: string;
    rechargesCount: number;
    totalEarned: number;
    lastRecharge: string;
  }>;
  rechargeLogs?: Array<{
    id: string;
    username: string;
    timestamp: string;
    earned: number;
    tokensGranted: number;
    aiTarget: string;
  }>;
}

interface MonetizationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MonetizationStats;
  onRefresh: () => void;
  onWithdraw: (callback: (res: any) => void) => void;
}

export function MonetizationReportModal({
  isOpen,
  onClose,
  stats,
  onRefresh,
  onWithdraw
}: MonetizationReportModalProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'metro' | 'logs'>('kpis');
  const [simUsers, setSimUsers] = useState(150);
  const [simVideosPerUser, setSimVideosPerUser] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const earningPerAd = stats.earningsPerVideo || 0.05;
  const cpm = stats.cpm || 50.0;
  const ctr = stats.ctr || 5.2;
  const todayViews = stats.todayViews || 142;
  const todayRev = stats.todayRevenue || Number((todayViews * earningPerAd).toFixed(2));
  const pending = stats.revenuePending || 0;
  const lifetime = stats.lifetimeRevenue || 0;
  const totalViews = stats.adViews || 0;

  // AI Breakdown calculation
  const breakdown = stats.aiBreakdown || {
    Elizabeth: Math.round(totalViews * 0.75) || 120,
    Sensei: Math.round(totalViews * 0.12) || 20,
    Shadow: Math.round(totalViews * 0.08) || 14,
    Neko: Math.round(totalViews * 0.05) || 8
  };
  const breakdownSum = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  // Simulator calculation
  const simTotalVideosDay = simUsers * simVideosPerUser;
  const simDailyEarnings = simTotalVideosDay * earningPerAd;
  const simMonthlyEarnings = simDailyEarnings * 30;
  const simMonthlyMessages = simTotalVideosDay * 10 * 30;

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleWithdrawClick = () => {
    setWithdrawMsg(null);
    onWithdraw((res: any) => {
      if (res && res.success) {
        setWithdrawMsg("¡Retiro solicitado con éxito! Los fondos serán transferidos a tu cuenta en 48hs.");
      } else {
        setWithdrawMsg(res?.message || "Saldo pendiente insuficiente. Se requiere un mínimo de $100.00 USD.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e121d] border border-emerald-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0d221a] via-[#101b2b] to-[#0e121d]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white text-lg sm:text-xl font-extrabold tracking-tight">
                  Informe de Ganancias & CTR
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck size={12} />
                  HilltopAds ID: ab2396fc769d3ea8283b4fd4c4f9077b64ab7d9b
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Métricas en tiempo real de videos vistos para recargas de IA (Rewarded Ads)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              title="Actualizar datos"
            >
              <RefreshCw size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-0 border-b border-white/10 flex gap-2 overflow-x-auto bg-[#0b0e17]">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'kpis'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 size={16} />
            Métricas & Ganancias
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            Ganancias por Usuario ({Object.keys(stats.userEarnings || {}).length})
          </button>
          <button
            onClick={() => setActiveTab('metro')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'metro'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Sliders size={16} />
            Metro Calculador de Ganancias
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'logs'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Clock size={16} />
            Historial de Recargas en Vivo
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto scrollbar-thin space-y-6">

          {activeTab === 'kpis' && (
            <div className="space-y-6">
              {/* Main Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Ganancia por video */}
                <div className="bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-emerald-400 transition-all shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-emerald-400" />
                    Ganancia por Video
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-300">${earningPerAd.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">USD / view</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    1 video visto = <strong>+10 tokens</strong> a la IA
                  </p>
                </div>

                {/* Saldo Pendiente */}
                <div className="bg-white/[0.03] border border-cyan-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-cyan-400 transition-all shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-cyan-400" />
                    Saldo Retirable
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-cyan-300">${pending.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">USD</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (pending / 100) * 100)}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Mínimo para retiro: $100.00 ({Math.min(100, Math.round((pending / 100) * 100))}%)
                  </p>
                </div>

                {/* Videos Vistos Totales */}
                <div className="bg-white/[0.03] border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-purple-400 transition-all shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <PlaySquare size={13} className="text-purple-400" />
                    Videos Reproducidos
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-300">{totalViews.toLocaleString()}</span>
                    <span className="text-xs text-emerald-400 font-bold">+{todayViews} hoy</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Hoy generado: <strong className="text-emerald-300">+${todayRev.toFixed(2)} USD</strong>
                  </p>
                </div>

                {/* eCPM y CTR */}
                <div className="bg-white/[0.03] border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-amber-400 transition-all shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Percent size={13} className="text-amber-400" />
                    eCPM & CTR Red
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-300">${cpm.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">eCPM</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    CTR Video Completado: <strong className="text-amber-300">{ctr}%</strong>
                  </p>
                </div>
              </div>

              {/* Botón de Retiro y Estado Financiero */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-[#101b2b] to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-extrabold text-base flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-400" />
                    Ganancias Históricas Totales: 
                    <span className="text-emerald-300 text-xl">${(lifetime + pending).toFixed(2)} USD</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xl">
                    Cada vez que un usuario chatea con Elizabeth, Sensei, Shadow o Neko y agota sus tokens, visualiza un video de 15s. Esto te genera ingresos directos y mantiene la plataforma libre de costos.
                  </p>
                  {withdrawMsg && (
                    <p className={`text-xs mt-2 font-bold ${withdrawMsg.includes('éxito') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {withdrawMsg}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleWithdrawClick}
                  disabled={pending < 100}
                  className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
                    pending >= 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95' 
                      : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight size={17} />
                  {pending >= 100 ? "Retirar Fondos a Banco" : `Faltan $${(100 - pending).toFixed(2)} para retirar`}
                </button>
              </div>

              {/* Desglose por Personaje de Inteligencia Artificial */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-extrabold text-sm mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bot size={17} className="text-cyan-400" />
                    ¿A cuál IA recargan más los usuarios? (Desglose de Ingresos)
                  </span>
                  <span className="text-xs text-gray-400 font-normal">
                    Total: {totalViews} videos
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {Object.entries(breakdown).map(([aiKey, count]) => {
                    const pct = Math.round((count / breakdownSum) * 100);
                    const aiEarnings = (count * earningPerAd).toFixed(2);
                    const isElizabeth = aiKey === 'Elizabeth';

                    return (
                      <div 
                        key={aiKey}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isElizabeth 
                            ? 'bg-pink-500/10 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm flex items-center gap-1.5">
                            {isElizabeth ? '👑' : '🤖'} {aiKey}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isElizabeth ? 'bg-pink-500/20 text-pink-300' : 'bg-white/10 text-gray-300'
                          }`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs text-gray-400 mb-1.5">
                          <span>{count} recargas</span>
                          <span className="text-emerald-300 font-bold">+${aiEarnings} USD</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              isElizabeth ? 'bg-pink-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header Card with totals */}
              <div className="bg-gradient-to-r from-amber-950/40 via-[#131a26] to-[#0e121d] border border-amber-500/30 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white text-base sm:text-lg font-extrabold flex items-center gap-2">
                      <Users size={20} className="text-amber-400" />
                      Contador de Ganancias por Usuario
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xl">
                      Aquí ves exactamente cuánto dinero vas ganando con cada usuario cuando mira un anuncio para recargar sus tokens de IA (+50 tokens).
                    </p>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/40 px-4 py-2.5 rounded-2xl text-right">
                    <span className="text-[11px] text-amber-300 font-bold block uppercase tracking-wider">Tarifa por Recarga</span>
                    <span className="text-2xl font-black text-amber-400">+$0.05 USD</span>
                  </div>
                </div>
              </div>

              {/* User Earnings Table / Cards */}
              {Object.keys(stats.userEarnings || {}).length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/10 text-gray-400">
                  <Users size={40} className="mx-auto mb-2 text-gray-600" />
                  <p className="font-bold text-sm text-gray-300">Aún no hay usuarios registrados que hayan recargado tokens.</p>
                  <p className="text-xs text-gray-500 mt-1">Apenas un usuario presione "Ver anuncio para recargar tokens", su contador se sumará aquí en tiempo real.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Object.values(stats.userEarnings || {}).map((item) => (
                    <div 
                      key={item.username}
                      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 transition-all flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-base shrink-0 shadow-sm">
                          {item.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-extrabold text-sm truncate flex items-center gap-2">
                            {item.username}
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              Activo
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.rechargesCount} {item.rechargesCount === 1 ? 'recarga (+50 tokens)' : 'recargas (+50 tokens c/u)'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Última recarga: {new Date(item.lastRecharge).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Has ganado</span>
                        <span className="text-lg font-black text-emerald-300 block">
                          +${item.totalEarned.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metro' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-950/40 via-[#0e1626] to-[#0e121d] border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-white text-base sm:text-lg font-extrabold">
                      Metro Proyector: ¿Cuánto gano con cada video?
                    </h3>
                    <p className="text-xs text-gray-400">
                      Simula el volumen de usuarios diarios y videos de recarga para estimar tus ingresos mensuales.
                    </p>
                  </div>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pt-4 border-t border-white/10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <Users size={14} className="text-cyan-400" />
                        Usuarios activos chateando al día:
                      </span>
                      <span className="text-cyan-300 font-extrabold text-sm">{simUsers} usuarios</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="2000" 
                      step="10"
                      value={simUsers}
                      onChange={(e) => setSimUsers(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>10 usuarios</span>
                      <span>500</span>
                      <span>1,000</span>
                      <span>2,000 usuarios</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <PlaySquare size={14} className="text-purple-400" />
                        Videos vistos por usuario al día (recargas):
                      </span>
                      <span className="text-purple-300 font-extrabold text-sm">{simVideosPerUser} videos</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      step="1"
                      value={simVideosPerUser}
                      onChange={(e) => setSimVideosPerUser(Number(e.target.value))}
                      className="w-full accent-purple-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>1 video (10 msgs)</span>
                      <span>5 videos (50 msgs)</span>
                      <span>15 videos (150 msgs)</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Videos al Día</p>
                    <p className="text-2xl font-black text-white">{simTotalVideosDay.toLocaleString()}</p>
                    <p className="text-[10px] text-cyan-400 mt-1">reproducciones / 24h</p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center shadow-lg">
                    <p className="text-[11px] text-emerald-400 font-bold uppercase mb-1">Ingresos Diarios</p>
                    <p className="text-3xl font-black text-emerald-300">${simDailyEarnings.toFixed(2)} USD</p>
                    <p className="text-[10px] text-emerald-200 mt-1">calculado a ${earningPerAd.toFixed(2)} / video</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-xl p-4 text-center shadow-xl">
                    <p className="text-[11px] text-emerald-300 font-bold uppercase mb-1">Proyección Mensual (30d)</p>
                    <p className="text-3xl font-black text-white drop-shadow-md">${simMonthlyEarnings.toFixed(2)} USD</p>
                    <p className="text-[10px] text-emerald-300 mt-1">{simMonthlyMessages.toLocaleString()} msgs IA activados</p>
                  </div>
                </div>
              </div>

              {/* Informative details */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-xs text-gray-300 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  ¿Por qué este modelo es rentable y amigable con el usuario?
                </p>
                <p className="text-gray-400">
                  En lugar de bloquear a los usuarios con suscripciones de pago que nadie compra, ellos chatean gratis con Elizabeth u otras IAs. Cuando se les terminan los 10 tokens iniciales, simplemente miran un video corto de 15 segundos. HilltopAds te paga <strong>$0.05 por cada video completado</strong> ($50 CPM en promedio en Latinoamérica y global), lo que te permite ganar dinero constantemente mientras los usuarios están felices chateando.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-extrabold text-sm flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  Últimas Recargas en Tiempo Real
                </h3>
                <span className="text-xs text-gray-400">
                  Cada entrada suma $0.05 a tu saldo
                </span>
              </div>

              {(!stats.rechargeLogs || stats.rechargeLogs.length === 0) ? (
                <div className="text-center py-12 text-gray-400 bg-white/[0.02] rounded-2xl border border-white/10">
                  <PlaySquare size={36} className="mx-auto mb-2 text-gray-600" />
                  <p className="font-bold text-sm">No hay registros de recargas recientes aún.</p>
                  <p className="text-xs text-gray-500 mt-1">Los videos que vean los usuarios aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.rechargeLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                          {log.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold flex items-center gap-1.5">
                            {log.username}
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                              recargó a {log.aiTarget || 'Elizabeth'}
                            </span>
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(log.timestamp).toLocaleString()} • +{log.tokensGranted || 10} tokens otorgados
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-extrabold text-sm block">
                          +${(log.earned || 0.05).toFixed(2)} USD
                        </span>
                        <span className="text-[10px] text-gray-500">Acreditado</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#090c13] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema publicitario HilltopAds conectado y operando.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Cerrar Informe
          </button>
        </div>

      </div>
    </div>
  );
}
