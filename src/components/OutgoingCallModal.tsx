import React from 'react';
import { PhoneOff } from 'lucide-react';

interface OutgoingCallModalProps {
    partner: { username: string, profilePic: string };
    onCancel: () => void;
}

export function OutgoingCallModal({ partner, onCancel }: OutgoingCallModalProps) {
    // No loud ringtone for caller. Only visual indicator.
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-[#12141c] to-[#0B1220] p-10 rounded-[40px] w-full max-w-sm shadow-[0_0_50px_rgba(6,182,212,0.15)] relative border border-cyan-500/20 text-center animate-in zoom-in-95 duration-500 ease-out overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse"></div>
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#12141c] relative z-10 shadow-2xl">
                        <img 
                            src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.username}`} 
                            alt={partner.username} 
                            className="w-full h-full object-cover bg-[#1A2639]" 
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-medium text-gray-400 tracking-widest uppercase text-[10px] mb-2">Llamando a</h3>
                <p className="text-3xl font-light text-white mb-8 tracking-wide">
                    {partner.username}
                </p>

                <div className="flex items-center justify-center gap-1.5 mb-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                <button 
                    onClick={onCancel}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)] group"
                >
                    <PhoneOff size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-semibold tracking-wide">Cancelar Llamada</span>
                </button>
            </div>
        </div>
    );
}
