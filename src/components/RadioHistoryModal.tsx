import React, { useState } from 'react';
import { X, RotateCcw, Download, Play, Music, Search, Check, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';

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
  const [completedDownloads, setCompletedDownloads] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Filter songs by search text
  const filteredSongs = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (song: RadioHistorySong, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const songKey = song.id || song.title;
    if (downloadingId === songKey) return;
    setDownloadingId(songKey);

    const safeTitle = song.title.replace(/[^\w\s-]/gi, '').trim() || 'cancion';
    const downloadUrl = `/api/download?url=${encodeURIComponent(song.url)}&title=${encodeURIComponent(safeTitle)}&format=mp3`;

    if (onToast) {
      onToast(`⏳ Descargando "${song.title}"... Obteniendo archivo MP3.`);
    }

    try {
      // Fetch audio file directly as a Blob
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`El servidor respondió con estado ${response.status}`);
      }

      const blob = await response.blob();

      // Ensure blob has actual content to avoid false success reports
      if (!blob || blob.size === 0) {
        throw new Error("El archivo de audio recibido está vacío");
      }

      // Create a temporary object URL from the downloaded Blob
      const tempUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = tempUrl;
      link.setAttribute('download', `${safeTitle}.mp3`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and anchor tag
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(tempUrl);
      }, 1500);

      // Only mark as successfully completed once the Blob was fetched and downloaded
      setCompletedDownloads((prev) => ({ ...prev, [songKey]: true }));
      if (onToast) {
        onToast(`✅ ¡"${safeTitle}.mp3" descargado con éxito!`);
      }
    } catch (err: any) {
      console.error("Error al descargar canción de radio:", err);
      // Remove any completed state if there was an error
      setCompletedDownloads((prev) => {
        const next = { ...prev };
        delete next[songKey];
        return next;
      });
      if (onToast) {
        onToast(`⚠️ Error al descargar "${safeTitle}": ${err?.message || "Intenta nuevamente"}`);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121622] border border-[#38bdf8]/35 rounded-3xl max-w-xl w-full max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative"
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
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Smartphone size={12} className="text-[#38bdf8]" />
                Descarga directa en MP3 a tu dispositivo móvil (sin ir a YouTube)
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

        {/* Search Bar & Notice */}
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
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>Toca el nombre de cualquier canción para descargar su MP3 directo</span>
            <span className="text-[#38bdf8] font-bold">{filteredSongs.length} disponibles</span>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 scrollbar-thin">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Music size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No se encontraron canciones</p>
            </div>
          ) : (
            filteredSongs.map((song, idx) => {
              const songKey = song.id || song.title;
              const isDownloading = downloadingId === songKey;
              const isDone = completedDownloads[songKey];

              return (
                <div
                  key={songKey + idx}
                  onClick={() => handleDownload(song)}
                  className="group bg-[#161c2d]/70 hover:bg-[#1c243a] border border-white/5 hover:border-[#38bdf8]/40 rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
                  title="Haz clic para descargar en MP3"
                >
                  {/* Song Index and Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-bold text-gray-500 group-hover:text-[#38bdf8] shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 group-hover:bg-[#38bdf8]/20 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0 transition-colors">
                      <Music size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#38bdf8] truncate transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-400 font-medium">MP3 Directo</span>
                        <span>•</span>
                        <span>Audio HD Estéreo</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Play on radio & Download MP3 */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onPlaySong && (
                      <button
                        onClick={() => {
                          onPlaySong(song);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-white/5"
                        title="Escuchar en la radio"
                      >
                        <Play size={14} className="fill-current text-[#38bdf8]" />
                        <span className="hidden sm:inline">Escuchar</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDownload(song, e)}
                      disabled={isDownloading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isDownloading
                          ? 'bg-[#38bdf8]/30 text-[#38bdf8] animate-pulse border border-[#38bdf8]/40'
                          : 'bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 text-[#38bdf8] hover:text-white border border-[#38bdf8]/40 hover:scale-105 active:scale-95'
                      }`}
                      title="Descargar archivo MP3 en tu móvil"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span>Descargado</span>
                        </>
                      ) : isDownloading ? (
                        <>
                          <Download size={14} className="animate-bounce" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Descargar MP3</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-[#0b0e17] flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Smartphone size={14} className="text-emerald-400" />
            Descarga garantizada en formato MP3 compatible con Android e iOS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
