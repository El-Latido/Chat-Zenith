import React, { useState, useEffect } from 'react';
import { X, Mic, Radio, Play, Check, XCircle, StopCircle, Music } from 'lucide-react';
import { socket } from '../socket';

interface DjControlPanelModalProps {
  onClose: () => void;
  currentUser: any;
}

export function DjControlPanelModal({ onClose, currentUser }: DjControlPanelModalProps) {
  const [streamUrl, setStreamUrl] = useState("https://listen.moe/stream");
  const [isLive, setIsLive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [locutionText, setLocutionText] = useState('');
  const [djQueue, setDjQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleDjQueueUpdate = (queue: any[]) => {
       setDjQueue(queue);
    };
    const handleRadioState = (data: { currentLiveDJ: string | null, streamUrl: string }) => {
       setIsLive(data.currentLiveDJ === currentUser.username);
       if (data.currentLiveDJ === currentUser.username) {
           setStreamUrl(data.streamUrl);
       }
    };
    
    socket.on('dj_queue_update', handleDjQueueUpdate);
    socket.on('radio_state_update', handleRadioState);
    
    return () => {
       socket.off('dj_queue_update', handleDjQueueUpdate);
       socket.off('radio_state_update', handleRadioState);
    };
  }, [currentUser.username]);

  const toggleLive = () => {
    if (isLive) {
      socket.emit('dj_stop_live');
      setIsLive(false);
    } else {
      socket.emit('dj_go_live', streamUrl);
      setIsLive(true);
    }
  };

  const handleRequest = (id: string, action: 'accept' | 'reject') => {
      socket.emit('dj_handle_request', { id, action });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#121B2A] border border-[#D4AF37]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#D4AF37]/5 rounded-t-2xl">
          <h2 className="text-[#E8D9B0] font-bold text-lg flex items-center gap-2">
            <Mic className="text-[#D4AF37]" size={20} /> Panel de DJ
          </h2>
          <button onClick={onClose} className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors p-1 rounded-lg hover:bg-[#D4AF37]/10">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <h3 className="text-[#D4AF37] font-semibold text-sm mb-3 flex items-center gap-2">
              <Radio size={16} /> Estado de Transmisión
            </h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">URL de tu Streaming de Audio (Opcional)</label>
                <input 
                  type="text" 
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://tu-radio.com/stream"
                  className="w-full bg-[#1A2639] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              
              <button 
                onClick={toggleLive}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isLive 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-[#D4AF37] text-black hover:bg-[#E8D9B0] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                }`}
              >
                {isLive ? (
                  <><StopCircle size={18} /> Cerrar Programa</>
                ) : (
                  <><Play size={18} /> ¡Empezar a Transmitir en Vivo!</>
                )}
              </button>
            </div>
          </div>

          
          {isLive && (
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2">
                          <Mic size={16} /> Fader Virtual (Ducking)
                      </h3>
                      <button 
                          onClick={() => {
                              const nextMic = !micActive;
                              setMicActive(nextMic);
                              socket.emit('dj_fader_update', { micActive: nextMic });
                          }}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${micActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}
                      >
                          {micActive ? 'MIC ON (Música Baja)' : 'MIC OFF (Música Normal)'}
                      </button>
                  </div>
                  <div>
                      <h3 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2 mb-2">
                          📝 Locución Automática al Chat
                      </h3>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={locutionText}
                              onChange={e => setLocutionText(e.target.value)}
                              placeholder="Ej. ¡Seguimos con más música en vivo!"
                              className="flex-1 bg-[#1A2639] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                              onClick={() => {
                                  if (locutionText.trim()) {
                                      socket.emit('send_global', { text: "🎙️ [Locución]: " + locutionText, isAi: false });
                                      setLocutionText('');
                                  }
                              }}
                              className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E8D9B0] transition-colors"
                          >
                              Enviar
                          </button>
                      </div>
                  </div>
              </div>
          )}
    
          <div className="flex-1 flex flex-col min-h-[300px]">
             <h3 className="text-[#D4AF37] font-semibold text-sm mb-3 flex items-center gap-2">
               <Music size={16} /> Pedidos en Directo ({djQueue.filter(q => q.status === 'pending').length})
             </h3>
             
             <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-3 overflow-y-auto flex flex-col gap-2">
                {djQueue.length === 0 ? (
                  <div className="m-auto text-gray-500 text-sm flex flex-col items-center gap-2">
                    <Music size={24} className="opacity-50" />
                    No hay pedidos en la cola.
                  </div>
                ) : (
                  djQueue.map((req, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${
                        req.status === 'pending' ? 'bg-[#1A2639] border-[#D4AF37]/30' :
                        req.status === 'accepted' ? 'bg-green-500/10 border-green-500/30' :
                        'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-gray-200 text-sm font-semibold truncate max-w-[300px]">{req.title}</span>
                        <span className="text-gray-400 text-xs">Pedido por: {req.requester}</span>
                        {req.status !== 'pending' && (
                            <span className={`text-[10px] uppercase font-bold mt-1 ${req.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                                {req.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                            </span>
                        )}
                      </div>
                      
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRequest(req.id, 'accept')}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/40 p-2 rounded-lg transition-colors border border-green-500/30"
                            title="Aceptar Pedido"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleRequest(req.id, 'reject')}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/40 p-2 rounded-lg transition-colors border border-red-500/30"
                            title="Rechazar Pedido"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
