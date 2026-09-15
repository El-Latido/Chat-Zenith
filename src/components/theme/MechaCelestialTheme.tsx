import React from 'react';
import { Send, Mic, StopCircle, Music, Gamepad2, Smile, Paperclip, Play } from 'lucide-react';

export const MECHA_CELESTIAL_BG = "/mecha_celestial_bg.jpg";

/**
 * Gemstone SVG definition for corners and crests
 */
export const CyanGem = ({ className = "w-3 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 16 20" className={`inline-block drop-shadow-[0_0_5px_#00f0ff] ${className}`}>
    <defs>
      <linearGradient id="cyanGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cffafe" />
        <stop offset="30%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#083344" />
      </linearGradient>
    </defs>
    {/* Silver metal setting */}
    <path
      d="M8 1 C5 4 3 7 3 11 C3 15 5 18.5 8 19.5 C11 18.5 13 15 13 11 C13 7 11 4 8 1 Z"
      fill="#64748b"
      stroke="#e2e8f0"
      strokeWidth="0.8"
    />
    {/* Inner Gem */}
    <path
      d="M8 2.8 C5.8 5.2 4.5 7.8 4.5 11 C4.5 14.2 6 17 8 17.8 C10 17 11.5 14.2 11.5 11 C11.5 7.8 10.2 5.2 8 2.8 Z"
      fill="url(#cyanGemGrad)"
    />
    {/* Facet / Highlight */}
    <ellipse cx="6.8" cy="8" rx="1.2" ry="2.5" fill="#ffffff" opacity="0.8" transform="rotate(-15 6.8 8)" />
  </svg>
);

/**
 * Top-left & Top-right ornate silver filigree corner with cyan gem
 */
export const FiligreeCorner = ({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) => {
  const flipStyle = {
    'top-left': '',
    'top-right': 'scale-x-[-1]',
    'bottom-left': 'scale-y-[-1]',
    'bottom-right': 'scale-x-[-1] scale-y-[-1]',
  }[position];

  return (
    <div
      className={`absolute pointer-events-none z-10 w-9 h-9 ${flipStyle} ${
        position === 'top-left' ? '-top-2.5 -left-2.5' :
        position === 'top-right' ? '-top-2.5 -right-2.5' :
        position === 'bottom-left' ? '-bottom-2.5 -left-2.5' :
        '-bottom-2.5 -right-2.5'
      }`}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        {/* Ornate silver scrolls */}
        <path
          d="M 10 38 C 10 24 18 16 38 16 C 30 14 22 18 16 24 C 12 30 10 38 10 38 Z"
          fill="#94a3b8"
          stroke="#e2e8f0"
          strokeWidth="0.8"
        />
        <path
          d="M 4 28 C 6 18 16 8 28 6 C 20 8 14 14 10 22 C 8 26 4 28 4 28 Z"
          fill="#64748b"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />
        {/* Spiral flourishes */}
        <path
          d="M 12 18 Q 8 8 18 8 Q 24 8 20 14 Q 16 18 12 18 Z"
          fill="#475569"
          stroke="#e2e8f0"
          strokeWidth="0.7"
        />
        {/* Corner Cyan Gem */}
        <g transform="translate(10, 10)">
          <ellipse cx="6" cy="6" rx="4.5" ry="5.5" fill="#38bdf8" stroke="#f8fafc" strokeWidth="0.8" />
          <ellipse cx="5" cy="4.5" rx="1.5" ry="2" fill="#ffffff" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Top and bottom center filigree crest
 */
export const FiligreeCrest = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-1/2 -translate-x-1/2 pointer-events-none z-10 ${
      position === 'top' ? '-top-2' : '-bottom-2 scale-y-[-1]'
    }`}
  >
    <div className="flex items-center gap-0.5">
      <svg viewBox="0 0 24 8" className="w-6 h-2">
        <path d="M 0 4 Q 12 0 24 4 Q 12 8 0 4 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.6" />
      </svg>
      <div className="relative -top-0.5">
        <CyanGem className="w-2.5 h-3" />
      </div>
      <svg viewBox="0 0 24 8" className="w-6 h-2 scale-x-[-1]">
        <path d="M 0 4 Q 12 0 24 4 Q 12 8 0 4 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.6" />
      </svg>
    </div>
  </div>
);

/**
 * Full Mecha Celestial Message Bubble Wrapper
 */
export const MechaFiligreeBubble = ({
  isMe,
  children,
  className = "",
}: {
  isMe: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative group/mecha min-w-[140px] max-w-full ${className}`}>
      {/* 4 Corner filigree metal brackets with glowing cyan gems */}
      <FiligreeCorner position="top-left" />
      <FiligreeCorner position="top-right" />
      <FiligreeCorner position="bottom-left" />
      <FiligreeCorner position="bottom-right" />

      {/* Top and Bottom center crests */}
      <FiligreeCrest position="top" />
      <FiligreeCrest position="bottom" />

      {/* Main Bubble Frame with delicate metallic border and gradient */}
      <div
        className={`relative rounded-[16px] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all border ${
          isMe
            ? "border-[#94a3b8]/70 bg-gradient-to-b from-[#18443e]/95 via-[#133934]/95 to-[#0f2a26]/95 text-slate-100 shadow-[inset_0_0_15px_rgba(20,184,166,0.15)]"
            : "border-[#94a3b8]/70 bg-gradient-to-b from-[#24132b]/95 via-[#1a0e20]/95 to-[#130a17]/95 text-slate-100 shadow-[inset_0_0_15px_rgba(217,70,239,0.1)]"
        }`}
        style={{
          boxShadow: isMe
            ? "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Intricate circular engraved medallion frame for avatars
 */
export const MechaAvatarMedallion = ({
  children,
  className = "w-10 h-10",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative shrink-0 flex items-center justify-center p-[2px] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.7)] ${className}`}>
    {/* Outer engraved metal ring */}
    <div
      className="absolute inset-0 rounded-full pointer-events-none z-10"
      style={{
        background: "linear-gradient(135deg, #cbd5e1 0%, #64748b 30%, #d4af37 60%, #334155 100%)",
        padding: "2px",
        WebkitMask: "radial-gradient(circle, transparent 62%, black 63%)",
        mask: "radial-gradient(circle, transparent 62%, black 63%)",
      }}
    />
    {/* Delicate filigree rim */}
    <svg viewBox="0 0 100 100" className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none z-20">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.9" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
      {/* 4 cardinal mini gem studs */}
      <circle cx="50" cy="4" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="50" cy="96" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="4" cy="50" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="96" cy="50" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
    <div className="w-full h-full rounded-full overflow-hidden relative z-0">
      {children}
    </div>
  </div>
);

/**
 * Top navigation button in pink crystal & ornate rose-gold filigree
 */
export const MechaNavButton = ({
  onClick,
  title,
  children,
  badge,
  active = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`relative p-2 rounded-xl transition-all group active:scale-95 flex items-center justify-center ${
      active
        ? "bg-gradient-to-b from-[#f472b6] to-[#db2777] text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] border-2 border-white/60"
        : "bg-gradient-to-b from-[#f472b6]/25 via-[#ec4899]/20 to-[#9d174d]/30 text-[#fbcfe8] hover:text-white border border-[#f472b6]/40 hover:border-[#f472b6]/80 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
    }`}
    style={{
      boxShadow: active
        ? "0 0 15px rgba(244,114,182,0.5), inset 0 1px 2px rgba(255,255,255,0.8)"
        : "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4)",
    }}
  >
    {/* Filigree corner accents */}
    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d4af37] rounded-tl-sm pointer-events-none" />
    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d4af37] rounded-tr-sm pointer-events-none" />
    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d4af37] rounded-bl-sm pointer-events-none" />
    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d4af37] rounded-br-sm pointer-events-none" />
    
    {children}
    {badge}
  </button>
);

/**
 * Top hamburger menu button in the exact ornamental filigree style
 */
export const MechaMenuButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-xl bg-gradient-to-b from-[#f472b6]/20 via-[#ec4899]/15 to-[#831843]/30 border border-[#f472b6]/50 shadow-[0_2px_10px_rgba(0,0,0,0.5)] text-[#fbcfe8] hover:text-white transition-all active:scale-95 flex items-center justify-center group"
    style={{
      boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4)",
    }}
  >
    {/* Filigree corner brackets */}
    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d4af37] rounded-tl-sm pointer-events-none" />
    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d4af37] rounded-tr-sm pointer-events-none" />
    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d4af37] rounded-bl-sm pointer-events-none" />
    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d4af37] rounded-br-sm pointer-events-none" />

    {/* 3 stacked bars with delicate ornamental ends */}
    <div className="w-5 h-4 flex flex-col justify-between items-center py-0.5">
      <div className="w-5 h-[2.5px] rounded-full bg-gradient-to-r from-[#d4af37] via-white to-[#d4af37] shadow-sm" />
      <div className="w-4 h-[2px] rounded-full bg-white/90" />
      <div className="w-5 h-[2.5px] rounded-full bg-gradient-to-r from-[#d4af37] via-white to-[#d4af37] shadow-sm" />
    </div>
  </button>
);

/**
 * Bottom Input Bar (Mecha Console)
 */
export const MechaComposer = ({
  inputValue,
  onChange,
  onKeyDown,
  onSend,
  onSongRequest,
  onGames,
  onToggleEmoji,
  onFileSelect,
  isRecording,
  onToggleRecording,
  recordingStream,
  onRadioClick,
  disabledSend,
  fileInputRef,
  placeholder = "Escribe tu mensaje... @Elizabeth",
}: {
  inputValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onSongRequest: () => void;
  onGames: () => void;
  onToggleEmoji: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  recordingStream: any;
  onRadioClick?: () => void;
  disabledSend: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full relative">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
      />

      {/* Far-Left: Faceted Pink Gemstone Play/Radio Button with sculpted casing */}
      <div
        onClick={onRadioClick}
        title="Reproductor de Música / Radio"
        className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[18px] bg-gradient-to-b from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8] p-[2px] shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all relative group"
      >
        {/* 4 Gold corner rivets */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#fef08a] shadow-xs" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#fef08a] shadow-xs" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#fef08a] shadow-xs" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#fef08a] shadow-xs" />

        {/* Inner Pink Crystal Button */}
        <div
          className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[14px] bg-gradient-to-br from-[#f472b6] via-[#ec4899] to-[#9d174d] border border-[#fda4af]/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_0_12px_rgba(236,72,153,0.5)] flex items-center justify-center"
        >
          {/* Golden Arrow / Play Icon */}
          <Play size={18} fill="#fde047" className="text-[#fde047] ml-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
        </div>
      </div>

      {/* Center: Sculpted Cyber-Mecha Armor Input Capsule */}
      <div className="flex-1 h-[48px] sm:h-[52px] rounded-full bg-gradient-to-b from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8] p-[2px] shadow-[0_6px_20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.9)] relative flex items-center min-w-0">
        {/* Gold Corner Insets */}
        <div className="absolute top-1 left-4 w-3 h-1 bg-[#d4af37] rounded-xs opacity-80" />
        <div className="absolute top-1 right-4 w-3 h-1 bg-[#d4af37] rounded-xs opacity-80" />
        <div className="absolute bottom-1 left-4 w-3 h-1 bg-[#d4af37] rounded-xs opacity-80" />
        <div className="absolute bottom-1 right-4 w-3 h-1 bg-[#d4af37] rounded-xs opacity-80" />

        {/* Recessed Slate Input Slot */}
        <div className="w-full h-[40px] sm:h-[44px] rounded-full bg-[#b8c4d2] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] border border-[#8394a8] px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2">
          <input
            value={inputValue}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-0 py-1 h-full bg-transparent outline-none text-[#0f172a] placeholder-[#475569] font-medium text-[14px] sm:text-[15px]"
            id="chat-input-field"
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
          />

          {/* Right Inline Crystal Tool Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Music note in pink crystal */}
            <button
              onClick={onSongRequest}
              className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-b from-[#f472b6] to-[#db2777] text-white hover:scale-105 transition-transform shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-white/50"
              title="Pedir Canción"
            >
              <Music size={15} strokeWidth={2} />
            </button>

            {/* Gamepad in cyan crystal */}
            <button
              onClick={onGames}
              className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white hover:scale-105 transition-transform shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-white/50"
              title="Juegos"
            >
              <Gamepad2 size={15} strokeWidth={2} />
            </button>

            {/* Emoji in pink crystal */}
            <button
              onClick={onToggleEmoji}
              className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-b from-[#f472b6] to-[#db2777] text-white hover:scale-105 transition-transform shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-white/50"
              title="Emojis y GIFs"
            >
              <Smile size={15} strokeWidth={2} />
            </button>

            {/* Paperclip in cyan crystal */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white hover:scale-105 transition-transform shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-white/50"
              title="Adjuntar Imagen"
            >
              <Paperclip size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Far-Right 1: Microphone Pink Gemstone Pill Button */}
      <button
        onClick={onToggleRecording}
        className={`w-[46px] h-[48px] sm:w-[50px] sm:h-[52px] rounded-[18px] transition-all flex items-center justify-center shrink-0 border-2 border-[#f8fafc] active:scale-95 shadow-[0_4px_16px_rgba(236,72,153,0.5),inset_0_2px_3px_rgba(255,255,255,0.7)] ${
          isRecording
            ? "bg-gradient-to-b from-red-500 to-rose-700 animate-pulse text-white"
            : "bg-gradient-to-b from-[#f472b6] via-[#ec4899] to-[#be185d] text-[#1e293b] hover:text-white"
        }`}
        title={isRecording ? "Detener grabación" : "Grabar audio"}
      >
        {isRecording ? <StopCircle size={20} strokeWidth={2} className="text-white" /> : <Mic size={20} strokeWidth={2} className="text-[#0f172a]" />}
      </button>

      {/* Far-Right 2: Send Message Pink Gemstone Pill Button with Cyan Airplane */}
      <button
        onClick={onSend}
        disabled={disabledSend}
        className="w-[46px] h-[48px] sm:w-[50px] sm:h-[52px] rounded-[18px] bg-gradient-to-b from-[#f472b6] via-[#ec4899] to-[#be185d] border-2 border-[#f8fafc] shadow-[0_4px_16px_rgba(236,72,153,0.5),inset_0_2px_3px_rgba(255,255,255,0.7)] flex items-center justify-center text-[#38bdf8] hover:text-cyan-200 transition-all shrink-0 disabled:opacity-50 disabled:shadow-none active:scale-95 group"
        title="Enviar mensaje"
      >
        <Send size={20} className="ml-0.5 text-[#38bdf8] drop-shadow-[0_0_6px_#38bdf8] group-hover:scale-110 transition-transform" strokeWidth={2} />
      </button>
    </div>
  );
};
