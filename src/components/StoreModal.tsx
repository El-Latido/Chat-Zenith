import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserObj } from '../types';
import { socket } from '../socket';

interface StoreModalProps {
  onClose: () => void;
  user: UserObj;
  decorations: any[];
  initialCategory?: string;
  onSelectGame?: (gameId: string) => void;
}

export function StoreModal({ onClose, user, decorations, initialCategory, onSelectGame }: StoreModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chessBet, setChessBet] = useState(10);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(() => {
     if (initialCategory) {
         const cats = ['marcos', 'emblemas', 'mascotas', 'efectos'];
         const idx = cats.indexOf(initialCategory);
         return idx >= 0 ? idx : 0;
     }
     return 0;
  });

  const handleBuy = (dec: any) => {
    setLoading(true);
    setError('');
    socket.emit('buy_decoration', { decorationId: dec.id, price: dec.price }, (res: any) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Error al comprar.');
      }
    });
  };

  const handleEquip = (decId: string | null) => {
    setLoading(true);
    setError('');
    socket.emit('set_decoration', decId, (res: any) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Error al equipar/desequipar.');
      }
    });
  };

  const categories = [
    { id: 'ajedrez', label: 'Ajedrez', icon: '♟️', color: 'from-amber-400 to-orange-400' },
    { id: 'marcos', label: 'Marcos', icon: '🖼️', color: 'from-blue-400 to-cyan-400' },
    { id: 'emblemas', label: 'Emblemas', icon: '🛡️', color: 'from-purple-400 to-pink-400' },
    { id: 'mascotas', label: 'Mascotas', icon: '🐾', color: 'from-green-400 to-emerald-400' },
    { id: 'efectos', label: 'Efectos', icon: '✨', color: 'from-amber-400 to-orange-400' }
  ];

  const currentCategory = categories[currentCategoryIndex];

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const items = decorations.filter(d => d.category === currentCategory.id);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f111a] border border-[#D4AF37]/30 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95">
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <div>
            <h2 className="text-2xl font-bold text-[#E8D9B0] flex items-center gap-2">
              <Sparkles className="text-[#D4AF37]" />
              Tienda Premium
            </h2>
            <p className="text-[#D4AF37]/80 mt-1 font-medium">Liz-Moneditas: <span className="text-[#121B2A] bg-[#D4AF37] px-2.5 py-0.5 rounded-full font-bold">{user.lizCoins || 0}</span></p>
          </div>
          <button onClick={onClose} className="text-[#D4AF37]/60 hover:text-[#D4AF37] p-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 bg-[#121B2A]/50 border-b border-[#D4AF37]/10">
            <button onClick={prevCategory} className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors">
                <ChevronLeft size={28} />
            </button>
            <h3 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentCategory.color} flex items-center gap-3 tracking-wide`}>
                <span className="text-2xl filter drop-shadow-md">{currentCategory.icon}</span> {currentCategory.label}
            </h3>
            <button onClick={nextCategory} className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors">
                <ChevronRight size={28} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {items.map(dec => {
              const isOwned = user.ownedDecorations?.includes(dec.id);
              const isEquipped = user.activeDecoration === dec.id;
              const canAfford = (user.lizCoins || 0) >= dec.price;
              
              const rarityColor = dec.type === 'premium' ? 'border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : dec.type === 'intermediate' ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-blue-500/50';

              return (
                <div key={dec.id} className={`relative flex flex-col items-center p-5 rounded-[24px] bg-[#121B2A]/80 border ${isEquipped ? 'border-[#D4AF37] bg-[#D4AF37]/10' : isOwned ? 'border-green-500/50 bg-green-500/5' : rarityColor} transition-all hover:-translate-y-1 hover:shadow-xl`}>
                  
                  <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/70">
                      {dec.type === 'premium' ? 'Oro' : dec.type === 'intermediate' ? 'Plata' : 'Cobre'}
                  </div>

                  <div className="w-20 h-20 mb-5 mt-2 relative">
                    <img referrerPolicy="no-referrer" src={dec.url} alt="Decoration" className="w-full h-full object-contain filter drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  
                  <div className="mt-auto w-full">
                    {isEquipped ? (
                      <button 
                        onClick={() => handleEquip(null)}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-bold text-sm transition-colors border border-[#D4AF37]/40 shadow-inner"
                      >
                        Desequipar
                      </button>
                    ) : isOwned ? (
                      <button 
                        onClick={() => handleEquip(dec.id)}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm transition-colors border border-green-500/40"
                      >
                        Equipar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuy(dec)}
                        disabled={loading || !canAfford}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all border shadow-sm ${canAfford ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#121B2A] border-[#D4AF37] hover:scale-105 active:scale-95' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                      >
                        {dec.price} LM
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {items.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#D4AF37]/50 font-medium">
                    Próximamente más artículos en esta categoría...
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
