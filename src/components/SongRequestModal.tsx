import React, { useState } from 'react';
import { X, Youtube, Music } from 'lucide-react';

export function SongRequestModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (title: string, url: string, dedication?: string) => void }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [dedication, setDedication] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit(title, url, dedication.trim() || undefined);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#121B2A] p-6 rounded-3xl w-full max-w-sm shadow-2xl relative border border-[#D4AF37]/30" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#D4AF37] p-1 transition-colors">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/50">
                        <Music className="text-pink-400" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-[#E8D9B0]">Pedir Canción</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-[#D4AF37]/80 mb-1">Título de la canción / Anime *</label>
                        <input 
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-[#1A2639] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors text-sm"
                            placeholder="Ej. Unravel - Tokyo Ghoul"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#D4AF37]/80 mb-1 flex items-center gap-1">Enlace de YouTube <Youtube size={14} className="text-red-500" /></label>
                        <input 
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full bg-[#1A2639] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors text-sm"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#D4AF37]/80 mb-1">Dedicatoria o Mensaje (Opcional)</label>
                        <textarea 
                            value={dedication}
                            onChange={e => setDedication(e.target.value)}
                            rows={2}
                            maxLength={150}
                            className="w-full bg-[#1A2639] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors text-sm resize-none scrollbar-thin"
                            placeholder="Ej. De Juan para María"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!title.trim()}
                        className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Music size={18} /> Enviar Pedido
                    </button>
                </form>
            </div>
        </div>
    );
}
