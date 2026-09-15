import React, { useState } from 'react';
import { Bot, X, Play, Coins } from 'lucide-react';
import { AI_CHARACTERS } from '../aiCharacters';

interface AiSelectorModalProps {
  usersOnline?: any[];
  onClose: () => void;
  onSelect: (characterId: string) => void;
  userCoins: number;
  socket: any;
}

export function AiSelectorModal({ onClose, onSelect, userCoins, socket, usersOnline = [] }: AiSelectorModalProps) {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');

  const watchAd = () => {
    setIsWatchingAd(true);
    setAdTimeLeft(5); // 5 seconds ad for simulation
    setRewardMessage('');

    let time = 5;
    const interval = setInterval(() => {
      time -= 1;
      setAdTimeLeft(time);
      if (time <= 0) {
        clearInterval(interval);
        socket.emit("watch_ad_reward", (res: any) => {
           if (res.success) {
               setRewardMessage(`¡Recompensa obtenida! +5 LizCoins`);
               setTimeout(() => {
                  setIsWatchingAd(false);
                  setRewardMessage('');
               }, 2000);
           }
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-[#0A101A] border border-[#D4AF37]/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#0A101A] to-[#121B2A]">
          <div className="flex items-center gap-2">
            <Bot className="text-[#D4AF37]" size={24} />
            <h2 className="text-[#E8D9B0] text-xl font-bold font-serif">Personajes de IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {isWatchingAd ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              {adTimeLeft > 0 ? (
                <>
                  <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin"></div>
                  <p className="text-[#E8D9B0] text-lg font-bold">Viendo anuncio publicitario...</p>
                  <p className="text-gray-400">Por favor espera {adTimeLeft} segundos</p>
                </>
              ) : (
                <div className="text-center animate-pulse text-green-400 font-bold text-xl">
                  {rewardMessage}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Token Stats & Ad Button */}
              <div className="bg-[#121B2A] border border-[#D4AF37]/30 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D4AF37]/20 p-2 rounded-lg">
                    <Coins className="text-[#D4AF37]" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mis LizCoins</p>
                    <p className="text-[#E8D9B0] text-xl font-bold">{userCoins} <span className="text-xs font-normal text-gray-500">(1 coin = 1 mensaje de IA)</span></p>
                  </div>
                </div>
                <button
                  onClick={watchAd}
                  className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F2DCA5] text-black px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  <Play size={18} />
                  Ver Video (+5)
                </button>
              </div>

              {/* Characters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(AI_CHARACTERS).map((char) => {
            const dynamicAi = usersOnline.find(u => u.username === char.id);
            return (
                  <div key={char.id} className="bg-[#121B2A]/80 border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-[#D4AF37]/50 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-center gap-4">
                      <img src={dynamicAi?.profilePic || char.avatar} alt={char.name} className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 bg-white/5" />
                      <div>
                        <h3 className="text-[#E8D9B0] font-bold text-lg">{dynamicAi?.username || char.name}</h3>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">Inteligencia Artificial</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm flex-1">{dynamicAi?.statusMessage || char.description}</p>
                    
                    <button
                      onClick={() => onSelect(char.id)}
                      className="w-full bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-white hover:text-[#E8D9B0] py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Bot size={16} />
                      Chatear con {char.name}
                    </button>
                  </div>
                );})}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
