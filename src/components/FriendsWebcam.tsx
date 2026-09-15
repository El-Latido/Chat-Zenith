import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { Webcam, Video, VideoOff, Mic, MicOff, PhoneOff, User, RefreshCw } from "lucide-react";

export function FriendsWebcam({ user, onClose }: { user: any, onClose: () => void }) {
    const [state, setState] = useState<'idle' | 'searching' | 'matched'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [partnerDisconnected, setPartnerDisconnected] = useState(false);
    const [webcamName, setWebcamName] = useState(user.username);
    const [partnerName, setPartnerName] = useState("");

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const partnerSocketId = useRef<string | null>(null);

    useEffect(() => {
        const initLocalStream = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
            } catch (e) {
                console.error("Error accessing media devices.", e);
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
        socket.emit("leave_webcam_queue");
    };

    const nextPartner = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        setPartnerDisconnected(false);
        setState('searching');
        socket.emit("join_webcam_queue", { name: webcamName });
    };

    useEffect(() => {
        socket.on("webcam_matched", async ({ initiator, partnerSocket, partnerName }) => {
            setPartnerName(partnerName);
            setState('matched');
            partnerSocketId.current = partnerSocket;
            setPartnerDisconnected(false);

            const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            peerConnection.current = new RTCPeerConnection(config);

            localStream.current?.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, localStream.current!);
            });

            peerConnection.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("webcam_signal", { to: partnerSocketId.current, signal: { type: 'candidate', candidate: event.candidate } });
                }
            };

            if (initiator) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit("webcam_signal", { to: partnerSocketId.current, signal: { type: 'offer', offer } });
            }
        });

        socket.on("webcam_signal", async (data) => {
            const { signal, from } = data;
            if (from !== partnerSocketId.current) return;
            if (!peerConnection.current) return;

            if (signal.type === 'offer') {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.emit("webcam_signal", { to: partnerSocketId.current, signal: { type: 'answer', answer } });
            } else if (signal.type === 'answer') {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.answer));
            } else if (signal.type === 'candidate') {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        });

        socket.on("webcam_peer_disconnected", () => {
            setPartnerDisconnected(true);
        });

        return () => {
            socket.off("webcam_matched");
            socket.off("webcam_signal");
            socket.off("webcam_peer_disconnected");
        };
    }, []);

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="absolute inset-0 bg-[#0B0D17] flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                        <Webcam className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl uppercase tracking-wider">Friends Webcam</h2>
                        <p className="text-purple-400 text-sm font-mono tracking-widest">Random Chat</p>
                    </div>
                </div>
                <button onClick={onClose} className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                    Salir
                </button>
            </div>

            {/* Video Area */}
            <div className="relative w-full max-w-5xl aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 mt-16">
                {/* Remote Video */}
                <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                {state === 'matched' && !partnerDisconnected && partnerName && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                        <p className="text-white font-bold">{partnerName}</p>
                    </div>
                )}
                
                {/* Overlays */}
                {state === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <Webcam size={64} className="text-purple-500/50 mb-6" />
                        <h3 className="text-white text-2xl font-light mb-4">Conoce gente nueva al instante</h3>
                        <div className="flex flex-col items-center mb-8">
                            <label className="text-purple-300 text-sm mb-2 font-mono">TU NOMBRE EN WEBCAM (Anónimo)</label>
                            <input 
                                type="text" 
                                value={webcamName} 
                                onChange={(e) => setWebcamName(e.target.value)} 
                                className="bg-black/50 border border-purple-500/50 text-white text-center px-4 py-2 rounded-xl focus:outline-none focus:border-purple-400"
                                maxLength={20}
                            />
                        </div>
                        <button 
                            onClick={nextPartner}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all hover:scale-105"
                        >
                            ¡Empezar ahora!
                        </button>
                    </div>
                )}
                
                {state === 'searching' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                        <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-purple-300 font-mono text-xl tracking-widest animate-pulse">Buscando amigo...</p>
                    </div>
                )}

                {state === 'matched' && partnerDisconnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <User size={64} className="text-gray-500 mb-6" />
                        <h3 className="text-white text-2xl font-light mb-8">Tu amigo se ha desconectado</h3>
                        <button 
                            onClick={nextPartner}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
                        >
                            Buscar a otro
                        </button>
                    </div>
                )}

                {/* Local Video */}
                <div className="absolute bottom-6 right-6 w-48 aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                    <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                </div>
            </div>

            {/* Controls bottom */}
            {state === 'matched' && (
                <div className="flex items-center gap-6 mt-8">
                    <button 
                        onClick={nextPartner}
                        className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 px-6 py-4 rounded-2xl flex items-center gap-2 font-bold transition-all"
                    >
                        <RefreshCw size={20} />
                        Siguiente
                    </button>
                    <button 
                        onClick={toggleMute}
                        className={`p-4 rounded-2xl transition-all \${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button 
                        onClick={toggleVideo}
                        className={`p-4 rounded-2xl transition-all \${isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                    <button 
                        onClick={() => {
                            if(peerConnection.current) peerConnection.current.close();
                            socket.emit("webcam_disconnect", { to: partnerSocketId.current });
                            setState('idle');
                        }}
                        className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}
