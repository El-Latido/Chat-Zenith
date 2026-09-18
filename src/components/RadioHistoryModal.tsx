import React, { useState } from 'react';
import { X, RotateCcw, Download, Play, Music, Search, Check, Sparkles } from 'lucide-react';

export interface RadioHistorySong {
  id?: string;
  title: string;
  url: string;
  requester?: string;
}

interface RadioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: RadioHistorySong[];
  onPlaySong?: (song: RadioHistorySong) => void;
  onToast?: (msg: string) => void;
}

export function RadioHistoryModal({
  isOpen,
  onClose,
  songs,
  onPlaySong,
  onToast,
}: RadioHistoryModalProps) {
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter songs by search text
  const filteredSongs = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (song: RadioHistorySong, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const songKey = song.id || song.title;
    setDownloadingId(songKey);

    const safeTitle = song.title.replace(/[^\w\s-]/gi, '').trim() || 'cancion';
    const downloadUrl = `/api/download?url=${encodeURIComponent(song.url)}&title=${encodeURIComponent(safeTitle)}&format=mp3`;

    // Trigger download in browser
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${safeTitle}.mp3`);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onToast) {
      onToast(`📥 Descargando "${song.title}" en MP3...`);
    }

    setTimeout(() => {
      setDownloadingId((prev) => (prev === songKey ? null : prev));
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121622] border border-[#38bdf8]/30 rounded-3xl max-w-xl w-full max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#182033] to-[#121622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <RotateCcw size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Historial de Música
                </h2>
                <span className="bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> 30 Canciones
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Toca cualquier canción para descargarla en MP3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Instruction Notice */}
        <div className="p-3 sm:p-4 bg-[#0e121c] border-b border-white/5 flex flex-col gap-2.5">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en las 30 canciones..."
              className="w-full bg-[#182033] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#38bdf8]/60 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-xs text-gray-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span className="flex items-center gap-1">
              💡 <strong className="text-gray-200">Tip:</strong> Haz clic en el nombre de la canción para descargar su archivo MP3 al instante.
            </span>
            <span className="text-[#38bdf8] font-semibold">
              {filteredSongs.length} de {songs.length}
            </span>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Music size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="text-sm font-medium">No se encontraron canciones en el historial.</p>
            </div>
          ) : (
            filteredSongs.map((song, idx) => {
              const songKey = song.id || song.title;
              const isDownloading = downloadingId === songKey;

              return (
                <div
                  key={song.id || idx}
                  className="group bg-[#182033]/60 hover:bg-[#1f2a44] border border-white/5 hover:border-[#38bdf8]/40 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                >
                  {/* Left: Number & Song Title (Clicking triggers MP3 download) */}
                  <div
                    onClick={(e) => handleDownload(song, e)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                    title="Haz clic para descargar en MP3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#38bdf8]/20 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#38bdf8]/30 transition-colors">
                      <span className="text-xs font-black text-gray-400 group-hover:text-[#38bdf8]">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors truncate flex items-center gap-1.5">
                        <span>{song.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 truncate flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 font-medium">MP3 Disponible</span>
                        {song.requester && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">Por: {song.requester}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Download & Play buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onPlaySong && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySong(song);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 transition-all text-xs flex items-center gap-1"
                        title="Escuchar en la radio"
                      >
                        <Play size={14} className="fill-current" />
                        <span className="hidden sm:inline font-medium">Oír</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDownload(song, e)}
                      disabled={isDownloading}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isDownloading
                          ? 'bg-emerald-600 text-white cursor-wait'
                          : 'bg-[#38bdf8] hover:bg-[#0284c7] text-slate-950 hover:text-white'
                      }`}
                      title="Descargar canción en formato MP3"
                    >
                      {isDownloading ? (
                        <>
                          <Check size={14} />
                          <span>Listo</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>MP3</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0a0d14] border-t border-white/5 flex items-center justify-between text-xs text-gray-400 px-4">
          <span>🎵 Radio libre de alabanzas - Todos los géneros</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
