export interface BubbleStyleDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: "futurista" | "antiguo" | "artistico" | "minimalista" | "animado";
  bubbleClass: string;
  myBubbleClass: string;
  otherBubbleClass: string;
  textClass?: string;
  borderStyle?: string;
  badge?: string;
}

export const CHAT_BUBBLE_STYLES: BubbleStyleDef[] = [
  // 1. FUTURISTAS & SCI-FI (Con animaciones y efectos HUD)
  {
    id: "futuristic_neon",
    name: "Cyberpunk Neón 2077",
    desc: "Bordes electroluminiscentes con pulso de energía y resplandor cian/magenta",
    icon: "⚡",
    category: "futurista",
    badge: "ANIMADO",
    bubbleClass: "bubble-futuristic-neon backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-cyan-950/40 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.45)] text-cyan-100 rounded-2xl rounded-tr-sm",
    otherBubbleClass: "bg-purple-950/40 border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.45)] text-purple-100 rounded-2xl rounded-tl-sm",
  },
  {
    id: "hologram_scifi",
    name: "Holograma Sci-Fi HUD",
    desc: "Visor holográfico táctico con scanlines sutiles y brackets angulares",
    icon: "🛸",
    category: "futurista",
    badge: "HUD",
    bubbleClass: "bubble-hologram-hud backdrop-blur-lg relative overflow-hidden transition-all duration-300",
    myBubbleClass: "bg-blue-950/50 border-2 border-cyan-400/60 shadow-[inset_0_0_12px_rgba(6,182,212,0.3),0_0_15px_rgba(6,182,212,0.25)] text-cyan-100 rounded-lg",
    otherBubbleClass: "bg-slate-950/60 border-2 border-blue-400/60 shadow-[inset_0_0_12px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.25)] text-blue-100 rounded-lg",
  },
  {
    id: "matrix_terminal",
    name: "Matrix Terminal Hacker",
    desc: "Fósforo verde de terminal CRT, cursor parpadeante y código cibernético",
    icon: "💻",
    category: "futurista",
    badge: "RETRO SCI-FI",
    bubbleClass: "bubble-matrix-terminal font-mono backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-black/85 border border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.4)] text-emerald-300 rounded-md",
    otherBubbleClass: "bg-black/85 border border-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.25)] text-emerald-400 rounded-md",
  },

  // 2. DISEÑO ANTIGUO & CLÁSICO
  {
    id: "vintage_parchment",
    name: "Pergamino Medieval",
    desc: "Papiro añejo con bordes dorados gastados y suave brillo de vela",
    icon: "📜",
    category: "antiguo",
    badge: "CLÁSICO",
    bubbleClass: "bubble-vintage-parchment font-serif backdrop-blur-sm transition-all duration-300",
    myBubbleClass: "bg-gradient-to-br from-[#2a2118]/95 to-[#1c150e]/95 border border-[#c29b62]/60 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(194,155,98,0.15)] text-[#f4ecd8] rounded-xl rounded-tr-none",
    otherBubbleClass: "bg-gradient-to-br from-[#201811]/95 to-[#150f0a]/95 border border-[#8f7042]/50 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(143,112,66,0.15)] text-[#e8dfcb] rounded-xl rounded-tl-none",
  },
  {
    id: "steampunk_bronze",
    name: "Steampunk Mecánico",
    desc: "Bronce fundido victoriano con remaches de latón y sombras metálicas",
    icon: "⚙️",
    category: "antiguo",
    badge: "VINTAGE",
    bubbleClass: "bubble-steampunk-bronze backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-gradient-to-r from-[#332211]/90 to-[#442c16]/90 border-2 border-[#d97706]/70 shadow-[0_0_15px_rgba(217,119,6,0.35)] text-amber-100 rounded-2xl",
    otherBubbleClass: "bg-gradient-to-r from-[#221810]/90 to-[#2e1d10]/90 border-2 border-[#b45309]/60 shadow-[0_0_12px_rgba(180,83,9,0.25)] text-amber-200/90 rounded-2xl",
  },
  {
    id: "royal_gold",
    name: "Oro Real Barroco",
    desc: "Foil de oro de 24k con filigrana regia y resplandor áureo dinámico",
    icon: "👑",
    category: "antiguo",
    badge: "LUJO IMPERIAL",
    bubbleClass: "bubble-royal-gold backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-gradient-to-br from-[#2c1f0d]/90 via-[#1c1407]/90 to-[#2c1f0d]/90 border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.35),inset_0_0_10px_rgba(250,204,21,0.2)] text-amber-100 rounded-2xl",
    otherBubbleClass: "bg-gradient-to-br from-[#1e1509]/90 to-[#120d05]/90 border-2 border-yellow-600/70 shadow-[0_0_15px_rgba(202,138,4,0.25)] text-amber-200/90 rounded-2xl",
  },

  // 3. ARTÍSTICO & POP-ART / RETRO
  {
    id: "comic_popart",
    name: "Pop-Art Cómic / Manga",
    desc: "Borde negro hiper-definido estilo viñeta cómic con sombra sólida 3D",
    icon: "💥",
    category: "artistico",
    badge: "CÓMIC",
    bubbleClass: "bubble-comic-popart font-bold transition-transform duration-200 active:scale-95",
    myBubbleClass: "bg-yellow-400 border-[3px] border-black shadow-[4px_4px_0px_#000] text-black rounded-2xl rounded-tr-xs",
    otherBubbleClass: "bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] text-black rounded-2xl rounded-tl-xs",
  },
  {
    id: "pixel_arcade",
    name: "Pixel Art Arcade 8-Bit",
    desc: "Estilo retro-gaming de máquina recreativa de los 80s con bordes pixel",
    icon: "👾",
    category: "artistico",
    badge: "8-BIT",
    bubbleClass: "bubble-pixel-arcade font-mono transition-all duration-200",
    myBubbleClass: "bg-[#1f1b2e] border-4 border-indigo-400 shadow-[4px_4px_0px_#4f46e5] text-indigo-100 rounded-none",
    otherBubbleClass: "bg-[#181622] border-4 border-fuchsia-400 shadow-[4px_4px_0px_#c026d3] text-fuchsia-100 rounded-none",
  },

  // 4. ANIMADO & FLUIDO
  {
    id: "aurora_cosmic",
    name: "Aurora Boreal Cósmica",
    desc: "Gradiente boreal iridiscente en movimiento continuo como las auroras polares",
    icon: "🌌",
    category: "animado",
    badge: "ANIMACIÓN VIVA",
    bubbleClass: "bubble-aurora-cosmic backdrop-blur-xl relative overflow-hidden transition-all duration-500",
    myBubbleClass: "bg-slate-950/70 border border-teal-400/80 shadow-[0_0_20px_rgba(45,212,191,0.35)] text-teal-50 rounded-2xl",
    otherBubbleClass: "bg-slate-950/70 border border-violet-400/80 shadow-[0_0_20px_rgba(167,139,250,0.35)] text-violet-50 rounded-2xl",
  },
  {
    id: "kawaii_pastel",
    name: "Kawaii Bouncy Nube",
    desc: "Burbuja de algodón de azúcar con rebote suave y colores pastel tiernos",
    icon: "✨",
    category: "animado",
    badge: "BOUNCY",
    bubbleClass: "bubble-kawaii-bouncy backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-pink-500/25 border-2 border-pink-300/60 shadow-[0_0_15px_rgba(244,114,182,0.35)] text-pink-100 rounded-3xl",
    otherBubbleClass: "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-2 border-purple-300/50 shadow-[0_0_12px_rgba(192,132,252,0.3)] text-purple-100 rounded-3xl",
  },
  {
    id: "bubble_soap",
    name: "Burbuja de Jabón Irisada",
    desc: "Cápsula esférica translúcida con destellos de arcoíris y ligereza visual",
    icon: "🫧",
    category: "animado",
    badge: "FLOTANTE",
    bubbleClass: "bubble-soap-effect backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-cyan-500/10 border border-cyan-300/40 shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_0_15px_rgba(255,255,255,0.2)] text-white rounded-[26px]",
    otherBubbleClass: "bg-white/10 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2),inset_0_0_15px_rgba(255,255,255,0.15)] text-white rounded-[26px]",
  },
  {
    id: "glass_crystal",
    name: "Cristal Prisma Líquido",
    desc: "Efecto vidrio esmerilado de alta refracción con borde brillante pulido",
    icon: "💎",
    category: "minimalista",
    badge: "CRISTAL",
    bubbleClass: "backdrop-blur-xl transition-all duration-300",
    myBubbleClass: "bg-white/[0.12] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_0_10px_rgba(255,255,255,0.15)] text-white rounded-2xl rounded-tr-sm",
    otherBubbleClass: "bg-white/[0.07] border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-white/90 rounded-2xl rounded-tl-sm",
  },
  {
    id: "dark_obsidian",
    name: "Obsidiana Minimalista",
    desc: "Negro carbón mate de alta gama con un sutil halo violeta profundo",
    icon: "🖤",
    category: "minimalista",
    badge: "PREMIUM",
    bubbleClass: "backdrop-blur-md transition-all duration-300",
    myBubbleClass: "bg-[#0b0c10]/90 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-gray-200 rounded-2xl",
    otherBubbleClass: "bg-[#07080a]/90 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-gray-300 rounded-2xl",
  },
  {
    id: "rounded",
    name: "Cápsula Ultra-Moderna",
    desc: "Diseño ergonómico curvado tipo píldora con micro-sombras fluidas",
    icon: "💊",
    category: "minimalista",
    bubbleClass: "backdrop-blur-sm transition-all duration-300",
    myBubbleClass: "bg-cyan-500/20 border border-cyan-500/40 text-cyan-50 rounded-full px-5 py-2.5",
    otherBubbleClass: "bg-white/10 border border-white/15 text-white/90 rounded-full px-5 py-2.5",
  },
  {
    id: "default",
    name: "Moderno Suave",
    desc: "Bordes redondeados equilibrados con sombra sutil y excelente legibilidad",
    icon: "📱",
    category: "minimalista",
    bubbleClass: "backdrop-blur-sm transition-all duration-300",
    myBubbleClass: "bg-cyan-500/15 border border-cyan-500/30 text-white rounded-[20px] rounded-tr-[4px]",
    otherBubbleClass: "bg-white/5 border border-white/10 text-white/90 rounded-[20px] rounded-tl-[4px]",
  }
];

export function getBubbleStyleDef(styleId?: string): BubbleStyleDef {
  const cleanId = (styleId || "default").trim();
  return CHAT_BUBBLE_STYLES.find(s => s.id === cleanId) || CHAT_BUBBLE_STYLES[CHAT_BUBBLE_STYLES.length - 1];
}
