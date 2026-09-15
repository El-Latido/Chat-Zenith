import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { socket } from "../socket";

export function ActiveCallModal({
    partner,
    isInitiator,
    onEndCall,
}: {
    partner: any;
    isInitiator: boolean;
    onEndCall: () => void;
}) {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    
    // WebRTC refs
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `\${m < 10 ? '0' : ''}\${m}:\${s < 10 ? '0' : ''}\${s}`;
    };

    useEffect(() => {
        const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const initCall = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                
                // Initialize visualizer
                audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyser.current = audioContext.current.createAnalyser();
                const source = audioContext.current.createMediaStreamSource(localStream.current);
                source.connect(analyser.current);
                analyser.current.fftSize = 256;
                const bufferLength = analyser.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                const updateLevel = () => {
                    if (analyser.current && !isMuted) {
                        analyser.current.getByteFrequencyData(dataArray);
                        const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
                        setAudioLevel(avg);
                    } else {
                        setAudioLevel(0);
                    }
                    requestAnimationFrame(updateLevel);
                };
                updateLevel();

                const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
                peerConnection.current = new RTCPeerConnection(configuration);

                localStream.current.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, localStream.current!);
                });

                peerConnection.current.ontrack = (event) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("rtc_ice_candidate", { target: partner.username, candidate: event.candidate });
                    }
                };

                if (isInitiator) {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    socket.emit("rtc_offer", { target: partner.username, offer });
                }

            } catch (err) {
                console.error("Error starting audio call", err);
            }
        };

        initCall();

        const handleOffer = async ({ offer }: any) => {
            if (!peerConnection.current) return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit("rtc_answer", { target: partner.username, answer });
        };

        const handleAnswer = async ({ answer }: any) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleCandidate = async ({ candidate }: any) => {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        socket.on("rtc_offer", handleOffer);
        socket.on("rtc_answer", handleAnswer);
        socket.on("rtc_ice_candidate", handleCandidate);

        return () => {
            socket.off("rtc_offer", handleOffer);
            socket.off("rtc_answer", handleAnswer);
            socket.off("rtc_ice_candidate", handleCandidate);
            cleanup();
        };
    }, []);

    const cleanup = () => {
        localStream.current?.getTracks().forEach((t) => t.stop());
        peerConnection.current?.close();
        if (audioContext.current) {
            audioContext.current.close();
        }
    };

    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const handleEndCall = () => {
        socket.emit('end_call', partner.username);
        cleanup();
        onEndCall();
    };

    // Calculate ring sizes based on audio level
    const ring1Size = 100 + (audioLevel * 0.5);
    const ring2Size = 120 + (audioLevel * 1.2);
    const ring3Size = 150 + (audioLevel * 2);

    return (
        <div className="fixed inset-0 bg-[#060913] z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-[#060913]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <audio ref={remoteAudioRef} autoPlay />

            {/* Main Call UI */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
                
                {/* Status text */}
                <p className="text-cyan-400 font-bold tracking-[0.2em] text-sm uppercase mb-12 animate-pulse flex items-center gap-2">
                    <Volume2 size={16} />
                    Llamada de Voz
                </p>

                {/* Avatar & Visualizer */}
                <div className="relative flex items-center justify-center w-64 h-64 mb-12">
                    {/* Visualizer Rings */}
                    <div 
                        className="absolute rounded-full border border-cyan-500/20 transition-all duration-75"
                        style={{ width: `\${ring3Size}%`, height: `\${ring3Size}%`, opacity: isMuted ? 0 : 0.2 }}
                    ></div>
                    <div 
                        className="absolute rounded-full border border-cyan-400/40 transition-all duration-75 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        style={{ width: `\${ring2Size}%`, height: `\${ring2Size}%`, opacity: isMuted ? 0 : 0.5 }}
                    ></div>
                    <div 
                        className="absolute rounded-full border-2 border-cyan-300 transition-all duration-75 shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                        style={{ width: `\${ring1Size}%`, height: `\${ring1Size}%`, opacity: isMuted ? 0.3 : 1 }}
                    ></div>
                    
                    {/* Avatar Image */}
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#060913] shadow-2xl z-10">
                        <img 
                            src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}`} 
                            alt={partner.username} 
                            className="w-full h-full object-cover bg-[#1A2639]" 
                        />
                        {isMuted && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                                <MicOff size={32} className="text-red-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <h2 className="text-3xl font-light text-white tracking-wide mb-2 drop-shadow-md">
                    {partner.username}
                </h2>
                <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-inner">
                    <p className="text-cyan-300 font-mono text-xl tracking-widest">
                        {formatTime(duration)}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 mt-16 bg-white/5 backdrop-blur-xl px-10 py-6 rounded-[2rem] border border-white/10 shadow-2xl">
                    <button 
                        onClick={toggleMute}
                        className={`p-5 rounded-2xl transition-all duration-300 \${isMuted ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    
                    <button 
                        onClick={handleEndCall}
                        className="p-6 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] group"
                    >
                        <PhoneOff size={36} className="group-hover:scale-95 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
}
