import React from 'react';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';
import { AI_CHARACTERS } from '../aiCharacters';

interface AiSelectorModalProps {
  usersOnline?: any[];
  onClose: () => void;
  onSelect: (characterId: string) => void;
  userCoins?: number;
  socket?: any;
}

export function AiSelectorModal({ onClose, onSelect, usersOnline = [] }: AiSelectorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e121d] border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#172033] to-[#0f1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-white text-lg font-black tracking-tight flex items-center gap-2">
                Personajes de IA
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                  Inteligencia Artificial
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Elige con quién deseas conversar en tiempo real
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Characters Grid */}
        <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(AI_CHARACTERS).map((char) => {
              const dynamicAi = usersOnline.find(u => u.username === char.id);
              return (
                <div 
                  key={char.id} 
                  className="bg-white/[0.04] border border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group relative overflow-hidden"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img 
                        src={dynamicAi?.profilePic || char.avatar} 
                        alt={char.name} 
                        className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 shadow-md transition-colors" 
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0e121d]"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-extrabold text-base leading-tight truncate group-hover:text-cyan-300 transition-colors">
                        {dynamicAi?.username || char.name}
                      </h3>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 inline-block font-mono font-medium mt-1">
                        IA Oficial
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xs flex-1 line-clamp-2 leading-relaxed">
                    {dynamicAi?.statusMessage || char.description}
                  </p>
                  
                  <button
                    onClick={() => onSelect(char.id)}
                    className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500 hover:to-blue-600 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-transparent py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <MessageSquare size={14} />
                    Chatear con {char.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
