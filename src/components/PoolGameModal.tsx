import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Volume2, VolumeX, Send, Trophy, Flag, Coins, MessageSquare, AlertCircle } from 'lucide-react';
import { socket } from '../socket';

export interface PoolGameModalProps {
  onClose: () => void;
  user: any;
  gameId: string;
  opponent: any;
  bet: number;
  isHost: boolean;
}

interface Ball {
  id: number; // 0 is white cue ball, 1-7 solids, 8 black, 9-15 stripes
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPocketed: boolean;
  color: string;
  isStripe: boolean;
  number: number;
}

interface ChatMsg {
  sender: string;
  text: string;
}

const BALL_RADIUS = 11;
const TABLE_WIDTH = 760;
const TABLE_HEIGHT = 400;
const FRICTION = 0.985;
const POCKET_RADIUS = 24;

const BALL_COLORS: Record<number, string> = {
  0: '#ffffff', // Cue ball
  1: '#facc15', // Yellow
  2: '#2563eb', // Blue
  3: '#dc2626', // Red
  4: '#7c3aed', // Purple
  5: '#ea580c', // Orange
  6: '#16a34a', // Green
  7: '#831843', // Maroon
  8: '#111827', // Black 8-Ball
  9: '#facc15', // Yellow Stripe
  10: '#2563eb', // Blue Stripe
  11: '#dc2626', // Red Stripe
  12: '#7c3aed', // Purple Stripe
  13: '#ea580c', // Orange Stripe
  14: '#16a34a', // Green Stripe
  15: '#831843', // Maroon Stripe
};

export function PoolGameModal({ onClose, user, gameId, opponent, bet, isHost }: PoolGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTurn, setCurrentTurn] = useState<string>(isHost ? user.username : (opponent?.username || 'Oponente'));
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(40);
  const [isAiming, setIsAiming] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context for realistic billiard sounds
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Balls reference to maintain physical state without causing render loop
  const ballsRef = useRef<Ball[]>([]);

  // Pockets coordinates
  const pockets = [
    { x: 30, y: 30 }, // Top-Left
    { x: TABLE_WIDTH / 2, y: 24 }, // Top-Middle
    { x: TABLE_WIDTH - 30, y: 30 }, // Top-Right
    { x: 30, y: TABLE_HEIGHT - 30 }, // Bottom-Left
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 24 }, // Bottom-Middle
    { x: TABLE_WIDTH - 30, y: TABLE_HEIGHT - 30 }, // Bottom-Right
  ];

  // Initialize Billiard Balls in a standard 8-Ball Triangle
  const initBalls = () => {
    const list: Ball[] = [];

    // White Cue Ball
    list.push({
      id: 0,
      x: 180,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      isPocketed: false,
      color: '#ffffff',
      isStripe: false,
      number: 0,
    });

    // Triangle Rack
    const startX = 520;
    const startY = TABLE_HEIGHT / 2;
    const r = BALL_RADIUS;
    const d = r * 2 + 1;

    const ballOrder = [
      1,
      2, 9,
      3, 8, 10,
      11, 4, 12, 5,
      6, 13, 7, 14, 15
    ];

    let orderIdx = 0;
    for (let col = 0; col < 5; col++) {
      const colX = startX + col * (d * 0.866);
      const topY = startY - (col * d) / 2;
      for (let row = 0; row <= col; row++) {
        const ballNum = ballOrder[orderIdx++] || (orderIdx);
        list.push({
          id: ballNum,
          x: colX,
          y: topY + row * d,
          vx: 0,
          vy: 0,
          radius: BALL_RADIUS,
          isPocketed: false,
          color: BALL_COLORS[ballNum] || '#ffffff',
          isStripe: ballNum > 8,
          number: ballNum,
        });
      }
    }

    ballsRef.current = list;
  };

  useEffect(() => {
    initBalls();

    // Socket joins room
    socket.emit('join_pool_game', gameId);

    const onPocketedSync = (data: { ballNumber: number | 'white'; player: string }) => {
      playSound(300, 'triangle', 0.15);
      const ball = ballsRef.current.find(b => b.number === data.ballNumber || (data.ballNumber === 'white' && b.id === 0));
      if (ball) {
        ball.isPocketed = true;
        ball.vx = 0;
        ball.vy = 0;
        if (ball.id === 0) {
          // White scratched, respawn
          setTimeout(() => {
            ball.isPocketed = false;
            ball.x = 180;
            ball.y = TABLE_HEIGHT / 2;
            ball.vx = 0;
            ball.vy = 0;
          }, 800);
        }
      }
    };

    const onTurnUpdate = (data: { currentTurn: string }) => {
      setCurrentTurn(data.currentTurn);
    };

    const onPoolChat = (data: { sender: string; text: string }) => {
      setChatMessages(prev => [...prev.slice(-20), data]);
    };

    const onGameOver = (data: { winner: string; reason: string }) => {
      setWinner(data.winner);
      setGameOverReason(data.reason);
      playSound(587, 'sine', 0.3);
    };

    const onShotSync = (data: { angle: number; force: number }) => {
      // Opponent shot
      const white = ballsRef.current.find(b => b.id === 0);
      if (white) {
        white.vx = Math.cos(data.angle) * data.force;
        white.vy = Math.sin(data.angle) * data.force;
        playSound(600, 'sine', 0.1);
      }
    };

    socket.on('pool_ball_pocketed_sync', onPocketedSync);
    socket.on('pool_turn_update', onTurnUpdate);
    socket.on('pool_chat', onPoolChat);
    socket.on('pool_game_over', onGameOver);
    socket.on('pool_shot_sync', onShotSync);

    return () => {
      socket.emit('leave_pool_game', gameId);
      socket.off('pool_ball_pocketed_sync', onPocketedSync);
      socket.off('pool_turn_update', onTurnUpdate);
      socket.off('pool_chat', onPoolChat);
      socket.off('pool_game_over', onGameOver);
      socket.off('pool_shot_sync', onShotSync);
    };
  }, [gameId]);

  // Main Physics & Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatePhysics = () => {
      const balls = ballsRef.current;
      let moving = false;

      // Update positions
      for (const b of balls) {
        if (b.isPocketed) continue;

        b.x += b.vx;
        b.y += b.vy;
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        if (Math.abs(b.vx) < 0.05) b.vx = 0;
        if (Math.abs(b.vy) < 0.05) b.vy = 0;
        if (b.vx !== 0 || b.vy !== 0) moving = true;

        // Cushion Bounces
        const cushionMargin = 28;
        if (b.x - b.radius < cushionMargin) {
          b.x = cushionMargin + b.radius;
          b.vx = -b.vx * 0.85;
          playSound(400, 'square', 0.03);
        } else if (b.x + b.radius > TABLE_WIDTH - cushionMargin) {
          b.x = TABLE_WIDTH - cushionMargin - b.radius;
          b.vx = -b.vx * 0.85;
          playSound(400, 'square', 0.03);
        }

        if (b.y - b.radius < cushionMargin) {
          b.y = cushionMargin + b.radius;
          b.vy = -b.vy * 0.85;
          playSound(400, 'square', 0.03);
        } else if (b.y + b.radius > TABLE_HEIGHT - cushionMargin) {
          b.y = TABLE_HEIGHT - cushionMargin - b.radius;
          b.vy = -b.vy * 0.85;
          playSound(400, 'square', 0.03);
        }

        // Pocket Detection
        for (const p of pockets) {
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < POCKET_RADIUS - 4) {
            b.isPocketed = true;
            b.vx = 0;
            b.vy = 0;
            playSound(220, 'triangle', 0.2);

            // Notify server
            socket.emit('pool_ball_pocketed', {
              gameId,
              ballNumber: b.id === 0 ? 'white' : b.number,
              player: currentTurn,
            });

            if (b.id === 0) {
              // Scratch white ball respawn
              setTimeout(() => {
                b.isPocketed = false;
                b.x = 180;
                b.y = TABLE_HEIGHT / 2;
                b.vx = 0;
                b.vy = 0;
              }, 1000);
            }
          }
        }
      }

      // Ball-to-ball elastic collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          if (b1.isPocketed || b2.isPocketed) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < b1.radius + b2.radius) {
            const overlap = b1.radius + b2.radius - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            b1.vx -= p * nx * 0.95;
            b1.vy -= p * ny * 0.95;
            b2.vx += p * nx * 0.95;
            b2.vy += p * ny * 0.95;

            playSound(520, 'sine', 0.05);
          }
        }
      }

      if (isShooting && !moving) {
        setIsShooting(false);
        // Switch turn if current player finished shot
        if (currentTurn === user.username) {
          const nextPlayer = opponent?.username || 'Oponente';
          socket.emit('pool_change_turn', { gameId, nextTurn: nextPlayer });
        }
      }
    };

    const render = () => {
      updatePhysics();

      // Clear Table & Draw Green Baize Cloth
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Outer Wood Frame
      ctx.fillStyle = '#3e1d13';
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
      ctx.strokeStyle = '#5a2d20';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, TABLE_WIDTH - 4, TABLE_HEIGHT - 4);

      // Inner Felt
      ctx.fillStyle = '#0f6b3b';
      ctx.fillRect(24, 24, TABLE_WIDTH - 48, TABLE_HEIGHT - 48);

      // Kitchen Head String line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(180, 24);
      ctx.lineTo(180, TABLE_HEIGHT - 24);
      ctx.stroke();

      // Pockets
      for (const p of pockets) {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Balls
      const whiteBall = ballsRef.current.find(b => b.id === 0);

      for (const b of ballsRef.current) {
        if (b.isPocketed) continue;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

        if (b.isStripe) {
          // Base white with colored stripe
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius - 2.5, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
        } else {
          ctx.fillStyle = b.color;
          ctx.fill();
        }

        // Inner ball number circle
        if (b.id !== 0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.number), b.x, b.y + 0.5);
        }

        // Highlight sheen
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();

        ctx.restore();
      }

      // Draw Aiming Guide & Cue Stick
      const isMyTurn = currentTurn === user.username;
      if (isMyTurn && !isShooting && whiteBall && !whiteBall.isPocketed) {
        const guideLen = 140;
        const targetX = whiteBall.x + Math.cos(aimAngle) * guideLen;
        const targetY = whiteBall.y + Math.sin(aimAngle) * guideLen;

        // Dotted trajectory line
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(whiteBall.x, whiteBall.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Cue Stick
        const stickDistance = 22 + (power * 0.3);
        const stickLength = 180;
        const cueStartX = whiteBall.x - Math.cos(aimAngle) * stickDistance;
        const cueStartY = whiteBall.y - Math.sin(aimAngle) * stickDistance;
        const cueEndX = whiteBall.x - Math.cos(aimAngle) * (stickDistance + stickLength);
        const cueEndY = whiteBall.y - Math.sin(aimAngle) * (stickDistance + stickLength);

        ctx.setLineDash([]);
        ctx.strokeStyle = '#c28544';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();

        // Cue Tip
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueStartX - Math.cos(aimAngle) * 6, cueStartY - Math.sin(aimAngle) * 6);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [aimAngle, power, currentTurn, isShooting, user.username, opponent?.username, soundEnabled]);

  // Handle Aiming with Canvas Pointer Click/Move
  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentTurn !== user.username || isShooting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const white = ballsRef.current.find(b => b.id === 0);
    if (white && !white.isPocketed) {
      const angle = Math.atan2(mouseY - white.y, mouseX - white.x);
      setAimAngle(angle);
    }
  };

  // Shoot Cue Ball
  const handleShoot = () => {
    if (currentTurn !== user.username || isShooting) return;
    const white = ballsRef.current.find(b => b.id === 0);
    if (!white || white.isPocketed) return;

    const force = (power / 100) * 22 + 4;
    white.vx = Math.cos(aimAngle) * force;
    white.vy = Math.sin(aimAngle) * force;
    setIsShooting(true);

    playSound(600, 'sine', 0.12);

    // Broadcast shot to opponent
    socket.emit('pool_shot_sync', {
      gameId,
      angle: aimAngle,
      force,
    });
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('pool_chat', {
      gameId,
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  const handleAbandon = () => {
    if (confirm('¿Estás seguro de que deseas abandonar la partida? Perderás tu apuesta.')) {
      socket.emit('abandon_pool_game', gameId);
      onClose();
    }
  };

  const isMyTurn = currentTurn === user.username;
  const pocketedBalls = ballsRef.current.filter(b => b.isPocketed && b.id !== 0);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-5xl bg-gradient-to-br from-[#181824] via-[#12121a] to-[#0c0d12] border-2 border-emerald-500/40 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-[#0a1810] rounded-[14px] flex items-center justify-center font-bold text-emerald-400">
                🎱
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black text-base sm:text-lg tracking-tight">Pool 8-Ball Pro</h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Sala #{gameId.substring(0, 6)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Coins size={13} /> Pozo: {bet * 2} LizCoins
                </span>
                <span>•</span>
                <span>{isHost ? 'Anfitrión' : 'Retador'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-gray-500" />}
            </button>
            <button
              onClick={handleAbandon}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Flag size={14} /> Abandonar
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Players Status & Turn Banner */}
        <div className="px-5 py-2.5 bg-black/30 border-b border-white/5 flex items-center justify-between text-xs sm:text-sm">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
            currentTurn === user.username 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' 
              : 'bg-black/20 border-white/10 text-gray-400'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-bold">{user.username} (Tú)</span>
          </div>

          <div className="text-center font-bold text-xs uppercase tracking-wider text-gray-300">
            {isMyTurn ? (
              <span className="text-emerald-400 animate-bounce inline-block">¡Es tu turno de tirar! 🎯</span>
            ) : (
              <span>Turno de {currentTurn}... ⏳</span>
            )}
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
            currentTurn !== user.username 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' 
              : 'bg-black/20 border-white/10 text-gray-400'
          }`}>
            <span className="font-bold">{opponent?.username || 'Oponente'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          </div>
        </div>

        {/* Game Canvas & Side Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4 items-center">
          {/* Billiard Table Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="relative w-full max-w-[760px] aspect-[760/400] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3e1d13] bg-[#0f6b3b]">
              <canvas
                ref={canvasRef}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                onPointerDown={handleCanvasPointer}
                onPointerMove={(e) => {
                  if (e.buttons === 1) handleCanvasPointer(e);
                }}
                className="w-full h-full cursor-crosshair touch-none"
              />

              {winner && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                    🏆
                  </div>
                  <h3 className="text-white text-2xl font-black">
                    {winner === user.username ? '¡Victoria! Has Ganado 🎉' : `Ganador: ${winner}`}
                  </h3>
                  <p className="text-emerald-400 font-bold text-sm">
                    {winner === user.username ? `+${bet * 2} LizCoins acreditados a tu cuenta` : 'Mejor suerte para la próxima'}
                  </p>
                  <p className="text-xs text-gray-400">{gameOverReason}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition"
                  >
                    Cerrar Partida
                  </button>
                </div>
              )}
            </div>

            {/* Controls Toolbar: Angle & Power */}
            <div className="w-full max-w-[760px] mt-3 flex items-center justify-between gap-4 bg-black/40 p-3 rounded-2xl border border-white/10">
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300">Potencia:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  disabled={!isMyTurn || isShooting}
                  className="flex-1 accent-emerald-500 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-mono text-emerald-400 font-bold w-9 text-right">{power}%</span>
              </div>

              <button
                onClick={handleShoot}
                disabled={!isMyTurn || isShooting || !!winner}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Play size={16} fill="white" />
                <span>¡Tirar!</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Rack of Pocketed Balls & In-Game Chat */}
          <div className="w-full lg:w-72 bg-black/40 border border-white/10 rounded-2xl flex flex-col h-72 lg:h-[450px] overflow-hidden">
            {/* Pocketed Balls Rack */}
            <div className="p-3 border-b border-white/10 bg-black/20">
              <div className="text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Bolas embocadas ({pocketedBalls.length}/15)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {pocketedBalls.length === 0 ? (
                  <span className="text-[11px] text-gray-500">Ninguna bola embocada aún</span>
                ) : (
                  pocketedBalls.map(b => (
                    <div
                      key={b.id}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm"
                      style={{ backgroundColor: b.color, color: b.number === 8 ? 'white' : 'black' }}
                    >
                      {b.number}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              <div className="text-[11px] text-gray-500 italic text-center">Chat de la mesa</div>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-1.5 rounded-xl ${msg.sender === user.username ? 'bg-emerald-500/20 text-emerald-200 ml-4' : 'bg-white/5 text-gray-200 mr-4'}`}>
                  <strong className="block text-[10px] opacity-75">{msg.sender}</strong>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-2 border-t border-white/10 bg-black/30 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar mensaje..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
