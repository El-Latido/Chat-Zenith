import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface CallModalProps {
    caller: { username: string, profilePic: string };
    onAccept: () => void;
    onReject: () => void;
}

export function CallModal({ caller, onAccept, onReject }: CallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Auto-play prevented", e));
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3" loop />
            
            <div className="bg-gradient-to-b from-[#12141c] to-[#0B1220] p-10 rounded-[40px] w-full max-w-sm shadow-[0_0_50px_rgba(6,182,212,0.15)] relative border border-cyan-500/20 text-center animate-in zoom-in-95 duration-500 ease-out overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse"></div>
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#12141c] relative z-10 shadow-2xl">
                        <img 
                            src={caller.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${caller.username}`} 
                            alt={caller.username} 
                            className="w-full h-full object-cover bg-[#1A2639]" 
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-medium text-gray-400 tracking-widest uppercase text-[10px] mb-2">Llamada Entrante</h3>
                <p className="text-3xl font-light text-white mb-10 tracking-wide">
                    {caller.username}
                </p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={onReject}
                        className="flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-[28px] bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)] group"
                    >
                        <PhoneOff size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-semibold tracking-wide">Rechazar</span>
                    </button>
                    <button 
                        onClick={onAccept}
                        className="flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-[28px] bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.1)] group"
                    >
                        <Phone size={24} className="group-hover:scale-110 animate-bounce transition-transform" />
                        <span className="font-semibold tracking-wide">Atender</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
