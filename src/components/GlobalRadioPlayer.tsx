import React, { useState, useEffect, useRef } from 'react';
import { Radio, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { socket } from '../socket';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'hits',
    name: 'Top Hits & Pop',
    genre: 'Pop / Top 40',
    url: 'https://streams.ilovemusic.de/iloveradio1.mp3',
  },
  {
    id: 'dance',
    name: 'EDM & Electronic',
    genre: 'Dance / Electro',
    url: 'https://streams.ilovemusic.de/ilovedance.mp3',
  },
  {
    id: 'rock',
    name: 'Rock Classics & Hits',
    genre: 'Rock / Alternativo',
    url: 'https://streams.ilovemusic.de/iloverock.mp3',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Chill Beats',
    genre: 'Lo-Fi / Hip-Hop',
    url: 'https://live.lofiradio.org/stream',
  },
  {
    id: 'synthwave',
    name: 'Nightwave Plaza',
    genre: 'Synthwave / Retro',
    url: 'https://nightwave.plaza.one/stream',
  },
  {
    id: '2000s',
    name: '2000s Classics',
    genre: 'Nostalgia / Pop',
    url: 'https://streams.ilovemusic.de/ilove2000s.mp3',
  },
  {
    id: 'latin',
    name: 'Latin & Urbano',
    genre: 'Latino / Pop',
    url: 'https://stream.zeno.fm/9kvyfv40r98uv',
  },
  {
    id: 'anime',
    name: 'Anime & J-Pop',
    genre: 'J-Pop / Gaming',
    url: 'https://listen.moe/stream',
  },
];

interface GlobalRadioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenHistory: () => void;
  onToast?: (msg: string) => void;
}

export function GlobalRadioPlayer({
  isPlaying,
  onTogglePlay,
  onOpenHistory,
  onToast,
}: GlobalRadioPlayerProps) {
  const [stationIndex, setStationIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongName, setCurrentSongName] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeStation = RADIO_STATIONS[stationIndex];

  // Setup audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'none';
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleError = () => {
      console.warn(`Radio stream error on ${activeStation.name}, attempting fallback...`);
      // Try next station automatically on stream failure
      if (isPlaying) {
        setStationIndex((prev) => (prev + 1) % RADIO_STATIONS.length);
      }
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle station change or play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (audio.src !== activeStation.url) {
        audio.src = activeStation.url;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Audio playback error:', err);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, activeStation]);

  // Sync song name from socket if available
  useEffect(() => {
    const handleQueue = (data: any) => {
      if (data?.current?.title) {
        setCurrentSongName(data.current.title);
      }
    };
    socket.on('queue_update', handleQueue);
    return () => {
      socket.off('queue_update', handleQueue);
    };
  }, []);

  const handleNextStation = () => {
    const nextIdx = (stationIndex + 1) % RADIO_STATIONS.length;
    setStationIndex(nextIdx);
    if (onToast) {
      onToast(`📻 Estación: ${RADIO_STATIONS[nextIdx].name} (${RADIO_STATIONS[nextIdx].genre})`);
    }
  };

  const handlePrevStation = () => {
    const prevIdx = (stationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    setStationIndex(prevIdx);
    if (onToast) {
      onToast(`📻 Estación: ${RADIO_STATIONS[prevIdx].name} (${RADIO_STATIONS[prevIdx].genre})`);
    }
  };

  if (!isPlaying && !isExpanded) return null;

  return (
    <div className="w-full bg-[#121622]/90 backdrop-blur-md border border-[#38bdf8]/30 rounded-2xl p-2.5 sm:p-3 mb-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Station info & animated visualizer */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center shrink-0 text-[#38bdf8]">
            <Radio size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white truncate">
                {currentSongName || activeStation.name}
              </span>
              <span className="bg-[#38bdf8]/20 text-[#38bdf8] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                {activeStation.genre}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
              {/* Equalizer animation */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-[#38bdf8] rounded-full animate-eq-1 h-3"></span>
                <span className="w-1 bg-pink-400 rounded-full animate-eq-2 h-2"></span>
                <span className="w-1 bg-amber-400 rounded-full animate-eq-3 h-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-eq-4 h-2.5"></span>
              </div>
              <span className="truncate">Sonando en Vivo • Sin alabanzas</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Station Selector & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-1 py-0.5">
            <button
              onClick={handlePrevStation}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Estación anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] text-gray-300 font-bold px-1.5 hidden sm:inline">
              {stationIndex + 1}/{RADIO_STATIONS.length}
            </span>
            <button
              onClick={handleNextStation}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Siguiente estación"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Volume slider */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-xl px-2 py-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-14 accent-[#38bdf8] h-1 bg-white/10 rounded cursor-pointer"
            />
          </div>

          {/* Open 30 songs history button */}
          <button
            onClick={onOpenHistory}
            className="px-2.5 py-1 bg-gradient-to-r from-[#38bdf8]/20 to-pink-500/20 hover:from-[#38bdf8]/30 hover:to-pink-500/30 border border-[#38bdf8]/40 text-[#38bdf8] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            title="Ver 30 canciones y descargar MP3"
          >
            <Sparkles size={12} />
            <span>30 Canciones</span>
          </button>
        </div>
      </div>
    </div>
  );
}
