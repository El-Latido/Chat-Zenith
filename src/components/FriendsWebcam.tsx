import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { Webcam, Video, VideoOff, Mic, MicOff, PhoneOff, User, RefreshCw, ShieldAlert } from "lucide-react";

export function FriendsWebcam({ user, onClose }: { user: any; onClose: () => void }) {
    const [state, setState] = useState<'idle' | 'searching' | 'matched'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [partnerDisconnected, setPartnerDisconnected] = useState(false);
    const [webcamName] = useState(user.username);
    const [partnerName, setPartnerName] = useState("");

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const partnerSocketId = useRef<string | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    useEffect(() => {
        const initLocalStream = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        frameRate: { ideal: 30, max: 30 }
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
            } catch (e) {
                console.error("Error accessing media devices:", e);
                alert("No se pudo acceder a tu cámara o micrófono.");
            }
        };
        initLocalStream();

        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        localStream.current?.getTracks().forEach(t => t.stop());
        peerConnection.current?.close();
        peerConnection.current = null;
        pendingCandidates.current = [];
        socket.emit("leave_webcam_queue");
    };

    const nextPartner = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        pendingCandidates.current = [];
        setPartnerDisconnected(false);
        setState('searching');
        socket.emit("join_webcam_queue", { name: webcamName });
    };

    const drainCandidates = async (pc: RTCPeerConnection) => {
        while (pendingCandidates.current.length > 0) {
            const cand = pendingCandidates.current.shift();
            if (cand) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (err) {
                    console.warn("Failed to add buffered candidate:", err);
                }
            }
        }
    };

    useEffect(() => {
        const handleMatched = async ({ initiator, partnerSocket, partnerName }: any) => {
            setPartnerName(partnerName);
            setState('matched');
            partnerSocketId.current = partnerSocket;
            setPartnerDisconnected(false);
            pendingCandidates.current = [];

            const config: RTCConfiguration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' }
                ]
            };

            if (peerConnection.current) {
                peerConnection.current.close();
            }

            const pc = new RTCPeerConnection(config);
            peerConnection.current = pc;

            if (localStream.current) {
                localStream.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStream.current!);
                });
            }

            pc.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    remoteVideoRef.current.play().catch(e => console.warn("Remote playback play() notice:", e));
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && partnerSocketId.current) {
                    socket.emit("webcam_signal", {
                        to: partnerSocketId.current,
                        signal: { type: 'candidate', candidate: event.candidate }
                    });
                }
            };

            if (initiator) {
                try {
                    const offer = await pc.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true
                    });
                    await pc.setLocalDescription(offer);
                    socket.emit("webcam_signal", {
                        to: partnerSocketId.current,
                        signal: { type: 'offer', offer }
                    });
                } catch (err) {
                    console.error("Error creating WebRTC offer:", err);
                }
            }
        };

        const handleSignal = async (data: any) => {
            const { signal, from } = data;
            if (from !== partnerSocketId.current) return;
            const pc = peerConnection.current;
            if (!pc) return;

            try {
                if (signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
                    await drainCandidates(pc);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("webcam_signal", {
                        to: partnerSocketId.current,
                        signal: { type: 'answer', answer }
                    });
                } else if (signal.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                    await drainCandidates(pc);
                } else if (signal.type === 'candidate') {
                    if (pc.remoteDescription && pc.remoteDescription.type) {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    } else {
                        pendingCandidates.current.push(signal.candidate);
                    }
                }
            } catch (err) {
                console.error("WebRTC signal handling error:", err);
            }
        };

        const handlePeerDisconnected = () => {
            setPartnerDisconnected(true);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        };

        socket.on("webcam_matched", handleMatched);
        socket.on("webcam_signal", handleSignal);
        socket.on("webcam_peer_disconnected", handlePeerDisconnected);

        return () => {
            socket.off("webcam_matched", handleMatched);
            socket.off("webcam_signal", handleSignal);
            socket.off("webcam_peer_disconnected", handlePeerDisconnected);
        };
    }, []);

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="absolute inset-0 bg-[#0B0D17] flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                        <Webcam className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg sm:text-xl uppercase tracking-wider flex items-center gap-2">
                            Friends Webcam
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30 font-mono">
                                Admin Only
                            </span>
                        </h2>
                        <p className="text-purple-400 text-xs sm:text-sm font-mono tracking-widest">Random Chat En Directo</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="px-5 sm:px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                >
                    Salir
                </button>
            </div>

            {/* Video Area */}
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl sm:rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/10 mt-14">
                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {state === 'matched' && !partnerDisconnected && partnerName && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 z-10">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-white tracking-wide">{partnerName}</span>
                    </div>
                )}

                {/* Empty State */}
                {state === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090F] p-6 text-center z-10">
                        <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center text-purple-400 mb-4 animate-bounce">
                            <Webcam size={40} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Conéctate en Vivo</h3>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mb-6">
                            Transmisión directa de audio y video en tiempo real.
                        </p>
                        <button
                            onClick={nextPartner}
                            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                        >
                            Comenzar Búsqueda
                        </button>
                    </div>
                )}

                {/* Searching State */}
                {state === 'searching' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090F] p-6 text-center z-10">
                        <RefreshCw size={44} className="text-purple-400 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-1">Emparejando...</h3>
                        <p className="text-xs text-gray-400">Buscando usuario disponible en directo sin demoras</p>
                    </div>
                )}

                {/* Partner Disconnected State */}
                {partnerDisconnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center z-10">
                        <PhoneOff size={40} className="text-rose-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">El usuario se ha desconectado</h3>
                        <button
                            onClick={nextPartner}
                            className="px-6 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow-lg"
                        >
                            Buscar Siguiente
                        </button>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className="absolute bottom-4 right-4 w-28 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900 z-10">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
                        Tú ({webcamName})
                    </div>
                </div>
            </div>

            {/* Controls */}
            {state === 'matched' && !partnerDisconnected && (
                <div className="flex items-center gap-3 sm:gap-4 mt-6 z-20">
                    <button
                        onClick={toggleMute}
                        className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
                            isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        title={isMuted ? 'Activar Micrófono' : 'Silenciar Micrófono'}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
                            isVideoOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        title={isVideoOff ? 'Activar Cámara' : 'Apagar Cámara'}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>

                    <button
                        onClick={nextPartner}
                        className="flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                    >
                        <RefreshCw size={18} />
                        <span>Siguiente</span>
                    </button>
                </div>
            )}
        </div>
    );
}
