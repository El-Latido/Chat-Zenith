import React, { useState, useEffect, useRef } from 'react';
import { Radio, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles, Zap, Check } from 'lucide-react';
import { socket } from '../socket';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string;
  badge: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'hits',
    name: 'Top Pop & Hits',
    genre: 'Pop / Top 40',
    url: 'https://ice2.somafm.com/poptron-128-mp3',
    badge: 'Pop',
  },
  {
    id: 'dance',
    name: 'EDM & Club Dance',
    genre: 'Dance / Electro',
    url: 'https://ice2.somafm.com/beatblender-128-mp3',
    badge: 'EDM',
  },
  {
    id: 'rock',
    name: 'Rock Classics & Hits',
    genre: 'Rock / Alternativo',
    url: 'https://ice2.somafm.com/indiepop-128-mp3',
    badge: 'Rock',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Chill & Hip-Hop',
    genre: 'Lo-Fi / Relax',
    url: 'https://ice2.somafm.com/groovesalad-128-mp3',
    badge: 'Lo-Fi',
  },
  {
    id: 'synthwave',
    name: 'Synthwave & Retrowave',
    genre: 'Synth / Retro',
    url: 'https://ice2.somafm.com/vaporwaves-128-mp3',
    badge: 'Retro',
  },
  {
    id: 'latin',
    name: 'Latino & Reggaeton Hits',
    genre: 'Latino / Urbano',
    url: 'https://server6.vegamediagroup.com:8020/stream',
    badge: 'Latino',
  },
  {
    id: '2000s',
    name: '2000s & 90s Hits',
    genre: 'Nostalgia Hits',
    url: 'https://streams.ilovemusic.de/ilove2000s.mp3',
    badge: '2000s',
  },
  {
    id: 'anime',
    name: 'Anime & J-Pop',
    genre: 'J-Pop / Gaming',
    url: 'https://listen.moe/stream',
    badge: 'J-Pop',
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
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongName, setCurrentSongName] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeStation = RADIO_STATIONS[stationIndex];

  // Initialize audio instance once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'none';
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => {
      setIsBuffering(false);
      console.warn('Radio audio stream error, refreshing stream...');
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean, zero-interference playback handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (audio.src !== activeStation.url) {
        setIsBuffering(true);
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio.src = activeStation.url;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsBuffering(false))
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Playback resume notice:', err.message);
            }
          });
      }
    } else {
      audio.pause();
      setIsBuffering(false);
    }
  }, [isPlaying, activeStation]);

  // Real-time queue sync
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

  const handleSelectStation = (index: number) => {
    if (index === stationIndex) return;
    setStationIndex(index);
  };

  const handleNextStation = () => {
    const nextIdx = (stationIndex + 1) % RADIO_STATIONS.length;
    handleSelectStation(nextIdx);
  };

  const handlePrevStation = () => {
    const prevIdx = (stationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    handleSelectStation(prevIdx);
  };

  return (
    <div className="w-full bg-[#10141f]/95 backdrop-blur-md border border-[#38bdf8]/35 rounded-2xl p-2 sm:p-2.5 mb-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Station info & status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center shrink-0 text-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            <Radio size={16} className={isBuffering ? "animate-pulse" : ""} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white truncate max-w-[160px] sm:max-w-xs">
                {currentSongName || activeStation.name}
              </span>
              <span className="bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                {activeStation.genre}
              </span>
              {isBuffering && (
                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1 rounded">
                  Conectando...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-1 bg-[#38bdf8] rounded-full animate-eq-1 h-2.5"></span>
                <span className="w-1 bg-pink-400 rounded-full animate-eq-2 h-1.5"></span>
                <span className="w-1 bg-amber-400 rounded-full animate-eq-3 h-2.5"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-eq-4 h-2"></span>
              </div>
              <span className="truncate text-gray-300">En Vivo • Sonido HD sin interferencias • Audio Estéreo</span>
            </div>
          </div>
        </div>

        {/* Right: Quick station navigation, volume & history button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Station Stepper */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-1 py-0.5">
            <button
              onClick={handlePrevStation}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Estación anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] text-cyan-300 font-bold px-1.5">
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
          <div className="hidden md:flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2 py-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white transition-colors"
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
            className="px-2.5 py-1 bg-gradient-to-r from-[#38bdf8]/25 to-pink-500/25 hover:from-[#38bdf8]/35 hover:to-pink-500/35 border border-[#38bdf8]/50 text-[#38bdf8] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Ver 30 canciones y descargar MP3"
          >
            <Sparkles size={12} />
            <span className="font-extrabold">30 Músicas</span>
          </button>
        </div>
      </div>

      {/* Fast Genre Chips for Instant 1-Click Station Switching */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-1 border-t border-white/5 scrollbar-none">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap size={10} className="text-[#38bdf8]" /> Estaciones:
        </span>
        {RADIO_STATIONS.map((st, idx) => {
          const isSelected = idx === stationIndex;
          return (
            <button
              key={st.id}
              onClick={() => handleSelectStation(idx)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#38bdf8] text-black shadow-[0_0_10px_rgba(56,189,248,0.5)] font-black'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              {isSelected && <Check size={10} className="stroke-[3]" />}
              {st.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
