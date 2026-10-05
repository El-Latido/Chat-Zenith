import React, { useState } from 'react';
import { X, Swords, Play } from 'lucide-react';
import { UserObj } from '../types';

interface GamesMenuModalProps {
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  user: UserObj;
}

export function GamesMenuModal({ onClose, onSelectGame, user }: GamesMenuModalProps) {
  const [activeTab, setActiveTab] = useState<'chess' | 'pool'>('pool');
  const [chessBet, setChessBet] = useState(10);
  const [poolBet, setPoolBet] = useState(10);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f111a] border border-emerald-500/30 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in zoom-in-95">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🎮</span> Menú de Minijuegos
            </h2>
            <p className="text-emerald-400/80 text-xs mt-0.5 font-medium">Compite y duplica tus LizCoins</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('pool')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pool'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🎱</span> Pool 8-Ball Pro
          </button>
          <button
            onClick={() => setActiveTab('chess')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'chess'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>♟️</span> Ajedrez 3D
          </button>
        </div>

        {/* Pool 8-Ball Tab */}
        {activeTab === 'pool' && (
          <div className="flex flex-col items-center justify-center p-6 bg-[#121B2A]/40">
            <div className="w-20 h-20 flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/40 shadow-lg mb-4">
              <span className="text-4xl drop-shadow-md">🎱</span>
            </div>
            
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
              Billar 8-Ball Pro
            </h3>
            <p className="text-gray-300 text-center text-xs px-4 mb-6">
              Mesa de paño verde en tiempo real con física elástica, efectos de tiro, taco regulable y bolsa de apuestas.
            </p>

            <div className="w-full px-2">
              <div className="flex flex-col gap-3 mb-2">
                <label className="text-xs font-bold text-gray-300">Seleccionar Apuesta:</label>
                <select
                  value={poolBet}
                  onChange={(e) => setPoolBet(Number(e.target.value))}
                  className="bg-[#121B2A] border border-emerald-500/30 rounded-xl text-emerald-300 font-bold p-2.5 w-full outline-none text-sm"
                >
                  <option value={0}>Mesa de Práctica (0 LizCoins)</option>
                  <option value={5}>Apuesta: 5 LizCoins (Pozo 10)</option>
                  <option value={10}>Apuesta: 10 LizCoins (Pozo 20)</option>
                  <option value={25}>Apuesta: 25 LizCoins (Pozo 50)</option>
                  <option value={50}>Apuesta: 50 LizCoins (Pozo 100)</option>
                </select>
                
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => {
                      onSelectGame(`pool_${poolBet}`);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#121B2A] border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    🤖 vs Elizabeth (IA)
                  </button>
                  <button
                    onClick={() => {
                      onSelectGame(`poolpvp_${poolBet}`);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Swords size={16} /> PvP Global
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chess Tab */}
        {activeTab === 'chess' && (
          <div className="flex flex-col items-center justify-center p-6 bg-[#121B2A]/40">
            <div className="w-20 h-20 flex items-center justify-center bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 shadow-lg mb-4">
              <span className="text-4xl drop-shadow-md">♟️</span>
            </div>
            
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500 mb-1">
              Ajedrez 3D
            </h3>
            <p className="text-[#E8D9B0]/80 text-center text-xs px-4 mb-6">
              Compite y sube tu nivel ELO (Cobre a Oro). Apuestas duplicadas y chat de voz/emoticones.
            </p>

            <div className="w-full px-2">
              <div className="flex flex-col gap-3 mb-2">
                <label className="text-xs font-bold text-gray-300">Seleccionar Apuesta:</label>
                <select
                  value={chessBet}
                  onChange={(e) => setChessBet(Number(e.target.value))}
                  className="bg-[#121B2A] border border-indigo-500/30 rounded-xl text-indigo-300 font-bold p-2.5 w-full outline-none text-sm"
                >
                  <option value={0}>Partida Amistosa (0 LM)</option>
                  <option value={5}>Apuesta: 5 LM</option>
                  <option value={10}>Apuesta: 10 LM</option>
                  <option value={20}>Apuesta: 20 LM</option>
                  <option value={30}>Apuesta: 30 LM</option>
                  <option value={40}>Apuesta: 40 LM</option>
                </select>
                
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => { onSelectGame(`chessbot_${chessBet}`); onClose(); }}
                    className="flex-1 py-2.5 rounded-xl bg-[#121B2A] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    🤖 vs Bot
                  </button>
                  <button
                    onClick={() => { onSelectGame(`chess_${chessBet}`); onClose(); }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Swords size={16} /> PvP Global
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
