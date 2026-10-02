import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Type, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Clock,
  FileText
} from 'lucide-react';

interface ReadingModeModalProps {
  onClose: () => void;
  lastElizabethMessage: string;
  senderName?: string;
  speakerAudio?: string;
}

export function ReadingModeModal({
  onClose,
  lastElizabethMessage,
  senderName = "Elizabeth",
  speakerAudio
}: ReadingModeModalProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'obsidian'>('dark');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Word count and reading time estimate
  const words = lastElizabethMessage.trim() ? lastElizabethMessage.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(lastElizabethMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (speakerAudio) {
      const audio = new Audio(speakerAudio);
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
      return;
    }

    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(lastElizabethMessage);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const themeClasses = {
    dark: 'bg-[#0b0e17] text-gray-100 selection:bg-cyan-500/30 selection:text-cyan-200',
    sepia: 'bg-[#1e1915] text-[#f4ecd8] selection:bg-amber-500/30 selection:text-amber-200',
    obsidian: 'bg-[#050507] text-[#e0e0e8] selection:bg-purple-500/30 selection:text-purple-200',
  }[theme];

  const fontSizeClasses = {
    sm: 'text-base sm:text-lg',
    base: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  }[fontSize];

  const lineHeightClasses = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }[lineHeight];

  return (
    <div className={`fixed inset-0 z-[10000] flex flex-col ${themeClasses} transition-colors duration-300 overflow-y-auto animate-in fade-in duration-200`}>
      {/* Top Reading Navigation Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-[#0d1020] rounded-[14px] flex items-center justify-center">
              <BookOpen size={18} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Modo Lectura
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {senderName}
              </span>
            </h1>
            <p className="text-[11px] text-gray-400 flex items-center gap-2">
              <span>{words} palabras</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {readTimeMinutes} min de lectura
              </span>
            </p>
          </div>
        </div>

        {/* Reading Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Font Family Selector */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2.5 py-1 rounded-lg font-serif transition-colors ${
                fontFamily === 'serif' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Tipografía Serif (Novela / Editorial)"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2.5 py-1 rounded-lg font-sans transition-colors ${
                fontFamily === 'sans' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Tipografía Sans-serif (Moderna)"
            >
              Sans
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => {
                const sizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl')[] = ['sm', 'base', 'lg', 'xl', '2xl'];
                const curIdx = sizes.indexOf(fontSize);
                if (curIdx > 0) setFontSize(sizes[curIdx - 1]);
              }}
              disabled={fontSize === 'sm'}
              className="px-2 py-1 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Disminuir tamaño"
            >
              A-
            </button>
            <span className="text-[11px] font-mono text-cyan-400 px-1.5 font-bold uppercase">{fontSize}</span>
            <button
              onClick={() => {
                const sizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl')[] = ['sm', 'base', 'lg', 'xl', '2xl'];
                const curIdx = sizes.indexOf(fontSize);
                if (curIdx < sizes.length - 1) setFontSize(sizes[curIdx + 1]);
              }}
              disabled={fontSize === '2xl'}
              className="px-2 py-1 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Aumentar tamaño"
            >
              A+
            </button>
          </div>

          {/* Theme Palette */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setTheme('dark')}
              className={`w-6 h-6 rounded-lg bg-[#0b0e17] border ${theme === 'dark' ? 'border-cyan-400 scale-105' : 'border-white/20'}`}
              title="Tema Noche Azul"
            />
            <button
              onClick={() => setTheme('sepia')}
              className={`w-6 h-6 rounded-lg bg-[#1e1915] border ${theme === 'sepia' ? 'border-amber-400 scale-105' : 'border-white/20'}`}
              title="Tema Sepia Relajante"
            />
            <button
              onClick={() => setTheme('obsidian')}
              className={`w-6 h-6 rounded-lg bg-[#050507] border ${theme === 'obsidian' ? 'border-purple-400 scale-105' : 'border-white/20'}`}
              title="Tema Obsidiana Pura"
            />
          </div>

          {/* Audio / Read Aloud */}
          <button
            onClick={handleSpeech}
            className={`p-2 rounded-xl border transition-all ${
              isPlayingAudio 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title={isPlayingAudio ? "Pausar lectura" : "Escuchar con voz de Elizabeth"}
          >
            <Volume2 size={17} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Copiar texto"
          >
            {copied ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors ml-1"
            title="Salir del Modo Lectura (Esc)"
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* Main Reading Surface */}
      <main className="flex-1 flex justify-center px-6 py-8 sm:py-16">
        <article className="w-full max-w-3xl">
          {/* Header Badge */}
          <div className="mb-8 flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Respuesta destacada de Elizabeth</span>
            </div>
            <span className="text-[11px] font-mono text-gray-500">Lectura inmersiva</span>
          </div>

          {/* Long-form Content */}
          <div 
            className={`whitespace-pre-wrap ${fontSizeClasses} ${lineHeightClasses} ${
              fontFamily === 'serif' 
                ? 'font-serif tracking-normal selection:font-serif' 
                : 'font-sans tracking-wide selection:font-sans'
            }`}
            style={{ 
              fontFamily: fontFamily === 'serif' 
                ? '"Merriweather", "Georgia", "Cambria", serif' 
                : '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              textWrap: 'pretty'
            }}
          >
            {lastElizabethMessage}
          </div>

          {/* Bottom Reader Endmark */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Fin de la respuesta • Chat-Liz Inteligencia Artificial</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Volver al Chat
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}
