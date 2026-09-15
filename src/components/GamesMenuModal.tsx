import React, { useState } from 'react';
import { X, Swords } from 'lucide-react';
import { UserObj } from '../types';

interface GamesMenuModalProps {
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  user: UserObj;
}

export function GamesMenuModal({ onClose, onSelectGame, user }: GamesMenuModalProps) {
  const [chessBet, setChessBet] = useState(10);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f111a] border border-[#D4AF37]/30 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95">
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <div>
            <h2 className="text-2xl font-bold text-[#E8D9B0] flex items-center gap-2">
              <span className="text-3xl">🎮</span> Menú de Juegos
            </h2>
            <p className="text-[#D4AF37]/70 text-sm mt-1 font-medium">Selecciona una partida</p>
          </div>
          <button onClick={onClose} className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-[#121B2A]/50">
          <div className="w-24 h-24 flex items-center justify-center bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 shadow-lg mb-6">
              <span className="text-5xl drop-shadow-md">♟️</span>
          </div>
          
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500 mb-3">
            Ajedrez 3D
          </h3>
          <p className="text-[#E8D9B0]/80 text-center text-sm px-4 mb-8">
            Compite y sube tu nivel ELO (Cobre a Oro). Apuestas duplicadas y chat de voz/emoticones.
          </p>

          <div className="w-full px-4">
            <div className="flex flex-col gap-3 mb-4">
                <select value={chessBet} onChange={(e) => setChessBet(Number(e.target.value))} className="bg-[#121B2A] border border-indigo-500/30 rounded-xl text-indigo-300 font-bold p-3 w-full outline-none">
                    <option value={0}>Partida Amistosa (0 LM)</option>
                    <option value={5}>Apuesta: 5 LM</option>
                    <option value={10}>Apuesta: 10 LM</option>
                    <option value={20}>Apuesta: 20 LM</option>
                    <option value={30}>Apuesta: 30 LM</option>
                    <option value={40}>Apuesta: 40 LM</option>
                </select>
                
                <div className="flex gap-3">
                    <button onClick={() => { onSelectGame(`chessbot_${chessBet}`); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#121B2A] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                        🤖 vs Bot
                    </button>
                    <button onClick={() => { onSelectGame(`chess_${chessBet}`); onClose(); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                        <Swords size={20} /> PvP Global
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
