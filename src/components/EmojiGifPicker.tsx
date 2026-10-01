import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Smile, Heart, PawPrint, Utensils, Trophy, Laptop, Sparkles, Hand } from 'lucide-react';

interface EmojiGifPickerProps {
  onSelect: (type: 'emoji' | 'gif', val: string) => void;
  onClose: () => void;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

const EMOJI_CATALOG: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Caritas y Emociones',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
      '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮',
      '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
      '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀',
      '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'
    ]
  },
  {
    id: 'gestures',
    name: 'Personas y Gestos',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵',
      '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
    ]
  },
  {
    id: 'hearts',
    name: 'Corazones y Amor',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️',
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '🫂', '💐', '🌹',
      '🥀', '🌺', '🌸', '🏵️', '🌻', '🌼', '🌷'
    ]
  },
  {
    id: 'animals',
    name: 'Animales y Naturaleza',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
      '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆',
      '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞',
      '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
      '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊',
      '🐆', '🐅', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕',
      '🐩', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡',
      '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵',
      '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'
    ]
  },
  {
    id: 'food',
    name: 'Comida y Bebida',
    icon: '🍕',
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽',
      '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚',
      '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓',
      '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲',
      '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢',
      '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿',
      '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🍶', '🍾', '🍷',
      '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊'
    ]
  },
  {
    id: 'activities',
    name: 'Actividades y Juegos',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
      '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
      '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
      '🤺', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈',
      '🥉', '🏅', '🎖️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤',
      '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️',
      '🎯', '🎳', '🎮', '🎰', '🧩'
    ]
  },
  {
    id: 'tech_objects',
    name: 'Objetos y Tecnología',
    icon: '💻',
    emojis: [
      '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '💽', '💾', '💿', '📀',
      '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻',
      '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌',
      '💡', '🔦', '🕯️', '🧯', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎',
      '⚖️', '🧰', '🔧', '🔨', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣',
      '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🔮', '💈', '⚗️', '🔭', '🔬',
      '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪'
    ]
  },
  {
    id: 'symbols',
    name: 'Símbolos y Magia',
    icon: '✨',
    emojis: [
      '🔥', '✨', '🌟', '⭐', '🌠', '💥', '💫', '💬', '💭', '🗯️', '♨️', '☀️', '🌤️',
      '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨',
      '💧', '💦', '🫧', '⚡', '🌈', '🪐', '🌙', '🌕', '🚀', '🛸', '🔔', '🔕', '🎵',
      '🎶', '❌', '⭕', '🛑', '⛔', '🚫', '💯', '💢', '❗', '❕', '❓', '❔', '‼️',
      '⁉️', '⚠️', '🔱', '⚜️', '🔰', '♻️', '✅', '❇️', '🌐', '💠', '🌀', '💤'
    ]
  }
];

export function EmojiGifPicker({ onSelect, onClose }: EmojiGifPickerProps) {
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>('emoji');
  const [selectedCategory, setSelectedCategory] = useState<string>('smileys');
  const [emojiQuery, setEmojiQuery] = useState('');
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("#emoji-picker-toggle-btn")) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // GIF Search
  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === 'gif') {
      const q = gifQuery.trim() || 'trending';
      const delay = setTimeout(() => {
        searchGifs(q, controller.signal);
      }, 400);
      return () => {
        clearTimeout(delay);
        controller.abort();
      };
    }
    return () => controller.abort();
  }, [gifQuery, activeTab]);

  const searchGifs = async (q: string, signal: AbortSignal) => {
    setLoading(true);
    try {
      const apiKey = 'dc6zaTOxFJmzC';
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=16`, { signal });
      const data = await res.json();
      if (data.data) {
        setGifs(data.data.map((g: any) => g.images.fixed_height.url));
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Error buscando GIFs:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter emojis based on query with intelligent category keywords
  const filteredEmojis = useMemo(() => {
    const q = emojiQuery.trim().toLowerCase();
    if (!q) {
      const cat = EMOJI_CATALOG.find(c => c.id === selectedCategory) || EMOJI_CATALOG[0];
      return cat.emojis;
    }

    // Keyword matching by semantic concept
    const matchedCategories = EMOJI_CATALOG.filter(c => {
      const name = c.name.toLowerCase();
      if (name.includes(q)) return true;
      if (q.includes("car") || q.includes("feliz") || q.includes("risa") || q.includes("llorar") || q.includes("triste") || q.includes("cara")) {
        return c.id === "smileys";
      }
      if (q.includes("mano") || q.includes("gesto") || q.includes("brazo") || q.includes("dedo") || q.includes("ojo")) {
        return c.id === "gestures";
      }
      if (q.includes("amor") || q.includes("corazon") || q.includes("beso") || q.includes("rosa") || q.includes("flor")) {
        return c.id === "hearts";
      }
      if (q.includes("perro") || q.includes("gato") || q.includes("animal") || q.includes("mono") || q.includes("pajaro") || q.includes("pez") || q.includes("leon")) {
        return c.id === "animals";
      }
      if (q.includes("comida") || q.includes("pizza") || q.includes("hamburguesa") || q.includes("cerveza") || q.includes("cafe") || q.includes("fruta") || q.includes("dulce")) {
        return c.id === "food";
      }
      if (q.includes("futbol") || q.includes("pelota") || q.includes("deporte") || q.includes("juego") || q.includes("musica") || q.includes("trofeo")) {
        return c.id === "activities";
      }
      if (q.includes("tel") || q.includes("cel") || q.includes("pc") || q.includes("compu") || q.includes("dinero") || q.includes("reloj") || q.includes("bateria")) {
        return c.id === "tech_objects";
      }
      if (q.includes("fuego") || q.includes("estrella") || q.includes("brillo") || q.includes("magia") || q.includes("sol") || q.includes("luna") || q.includes("rayo")) {
        return c.id === "symbols";
      }
      return false;
    });

    if (matchedCategories.length > 0) {
      return matchedCategories.flatMap(c => c.emojis);
    }

    // Direct emoji character search or full catalog fallback
    const all = EMOJI_CATALOG.flatMap(c => c.emojis);
    const directMatches = all.filter(e => e.includes(q));
    return directMatches.length > 0 ? directMatches : all.slice(0, 70);
  }, [emojiQuery, selectedCategory]);

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-20 left-2 sm:left-6 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-[#12141c]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Header Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 pt-3 pb-2 bg-black/40">
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-2xl">
          <button 
            type="button"
            onClick={() => setActiveTab('emoji')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'emoji' 
                ? 'text-cyan-300 bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.3)] border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>😊</span>
            Emojis
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('gif')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'gif' 
                ? 'text-cyan-300 bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.3)] border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🎬</span>
            GIFs
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'emoji' && (
        <div className="flex flex-col h-80">
          {/* Emoji Category Selector Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/20 overflow-x-auto gap-1 scrollbar-none">
            {EMOJI_CATALOG.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setEmojiQuery('');
                }}
                title={cat.name}
                className={`p-1.5 rounded-xl text-base transition-all shrink-0 ${
                  selectedCategory === cat.id && !emojiQuery
                    ? 'bg-cyan-500/20 scale-110 shadow-sm'
                    : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Search Input for Emojis */}
          <div className="p-3 pb-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={emojiQuery}
                onChange={(e) => setEmojiQuery(e.target.value)}
                placeholder="Buscar emojis..."
                className="w-full bg-black/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none border border-white/10 focus:border-cyan-400 transition-colors"
              />
              {emojiQuery && (
                <button
                  type="button"
                  onClick={() => setEmojiQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 overflow-y-auto p-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredEmojis.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-10">
                No se encontraron emojis
              </div>
            ) : (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 text-center">
                {filteredEmojis.map((e, i) => (
                  <button
                    key={`${e}-${i}`}
                    type="button"
                    onClick={() => {
                      onSelect('emoji', e);
                    }}
                    className="h-9 w-9 flex items-center justify-center text-xl hover:scale-125 hover:bg-cyan-500/20 rounded-xl transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="px-3 py-1.5 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between bg-black/30">
            <span>
              {emojiQuery ? `Resultados: ${filteredEmojis.length}` : (EMOJI_CATALOG.find(c => c.id === selectedCategory)?.name || 'Emojis')}
            </span>
            <span className="text-cyan-400 font-medium">Chat-Liz Catálogo Completo</span>
          </div>
        </div>
      )}

      {activeTab === 'gif' && (
        <div className="flex flex-col h-80">
          <div className="p-3 pb-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                placeholder="Buscar GIFs (anime, baile, risa...)..."
                className="w-full bg-black/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none border border-white/10 focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-xs text-cyan-400 gap-2">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Buscando GIFs en vivo...
              </div>
            ) : gifs.length === 0 ? (
              <div className="text-center text-xs text-gray-500 py-10">
                No se encontraron GIFs
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelect('gif', url);
                      onClose();
                    }}
                    className="relative rounded-xl overflow-hidden group aspect-video bg-black/40 border border-white/5 hover:border-cyan-400/50 transition-all hover:scale-[1.02]"
                  >
                    <img 
                      src={url} 
                      alt="GIF" 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
