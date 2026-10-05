import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, Send, MessageSquare } from "lucide-react";
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
    const isElizabeth = partner?.username === "Elizabeth";
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    
    // WebRTC refs for peer calls
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    // AI Call state
    const [userSubtitle, setUserSubtitle] = useState<string>("");
    const [aiSubtitle, setAiSubtitle] = useState<string>(
      isElizabeth ? "¡Hola! Te escucho con total claridad. ¿De qué te gustaría hablar hoy? ✨" : ""
    );
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputValue, setTextInputValue] = useState("");
    const speechRecognitionRef = useRef<any>(null);
    const aiAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    useEffect(() => {
        const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Speech synthesis helper for Elizabeth
    const speakAiText = (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_#`~]/g, '').trim();
        if (!clean) return;
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "es-ES";
        utterance.rate = 1.05;
        utterance.pitch = 1.1;

        // Try to find a natural Spanish voice
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.startsWith("es") && (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Paulina") || v.name.includes("Monica") || v.name.includes("Helena")));
        if (esVoice) utterance.voice = esVoice;

        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        utterance.onerror = () => setIsAiSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("SpeechSynthesis error:", e);
      }
    };

    // Initial greeting when calling Elizabeth
    useEffect(() => {
      if (isElizabeth) {
        const t = setTimeout(() => {
          speakAiText("¡Hola! Te escucho con total claridad. ¿De qué te gustaría hablar hoy?");
        }, 600);
        return () => clearTimeout(t);
      }
    }, [isElizabeth]);

    // Handle incoming private messages from Elizabeth during the call
    useEffect(() => {
      if (!isElizabeth) return;

      const handleAiMessage = (msg: any, sender: string) => {
        if (msg?.sender === "Elizabeth" || sender === "Elizabeth") {
          setIsAiThinking(false);
          const rawText = msg?.text || "";
          setAiSubtitle(rawText);

          // If Elizabeth returned an audio sample (e.g. Coqui XTTS)
          if (msg.voiceAudio || msg.audioBase64) {
            try {
              if (!aiAudioPlayerRef.current) {
                aiAudioPlayerRef.current = new Audio();
              }
              const audioSrc = msg.voiceAudio?.startsWith("data:") ? msg.voiceAudio : `data:audio/wav;base64,${msg.voiceAudio || msg.audioBase64}`;
              aiAudioPlayerRef.current.src = audioSrc;
              setIsAiSpeaking(true);
              aiAudioPlayerRef.current.onended = () => setIsAiSpeaking(false);
              aiAudioPlayerRef.current.onerror = () => {
                setIsAiSpeaking(false);
                speakAiText(rawText);
              };
              aiAudioPlayerRef.current.play().catch(() => speakAiText(rawText));
            } catch (err) {
              speakAiText(rawText);
            }
          } else {
            speakAiText(rawText);
          }
        }
      };

      socket.on("receive_private", handleAiMessage);
      return () => {
        socket.off("receive_private", handleAiMessage);
      };
    }, [isElizabeth]);

    // Initialize Call: Mic stream, WebRTC or Speech Recognition
    useEffect(() => {
        let isCancelled = false;

        const initCall = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                if (isCancelled) return;
                
                // Initialize visualizer with local mic
                try {
                  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioCtx) {
                    audioContext.current = new AudioCtx();
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
                        if (!isCancelled) {
                          requestAnimationFrame(updateLevel);
                        }
                    };
                    updateLevel();
                  }
                } catch (audioErr) {
                  console.warn("AudioContext error:", audioErr);
                }

                if (isElizabeth) {
                  // Setup Speech Recognition for voice conversation with Elizabeth
                  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (SpeechRec) {
                    try {
                      const recognizer = new SpeechRec();
                      recognizer.lang = "es-ES";
                      recognizer.continuous = true;
                      recognizer.interimResults = true;
                      
                      let finalPhrase = "";
                      let latestSpoken = "";
                      let silenceTimeout: any = null;

                      const dispatchSpeech = () => {
                        const messageToSend = (latestSpoken || finalPhrase).trim();
                        if (messageToSend && messageToSend.length > 1) {
                          sendVoicePromptToElizabeth(messageToSend);
                          finalPhrase = "";
                          latestSpoken = "";
                          setUserSubtitle("");
                        }
                      };

                      recognizer.onresult = (event: any) => {
                        let interim = "";
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                          if (event.results[i].isFinal) {
                            finalPhrase += " " + event.results[i][0].transcript;
                          } else {
                            interim += event.results[i][0].transcript;
                          }
                        }
                        const currentSpoken = (finalPhrase + " " + interim).trim();
                        if (currentSpoken) {
                          latestSpoken = currentSpoken;
                          setUserSubtitle(currentSpoken);

                          if (silenceTimeout) clearTimeout(silenceTimeout);
                          silenceTimeout = setTimeout(dispatchSpeech, 1200);
                        }
                      };

                      recognizer.onspeechstart = () => {
                        if (silenceTimeout) clearTimeout(silenceTimeout);
                      };

                      recognizer.onspeechend = () => {
                        if (silenceTimeout) clearTimeout(silenceTimeout);
                        silenceTimeout = setTimeout(dispatchSpeech, 900);
                      };

                      recognizer.onerror = (e: any) => {
                        console.warn("[Voice Call Speech Recognition]:", e?.error);
                      };

                      recognizer.onend = () => {
                        if (!isCancelled && !isMuted) {
                          try { recognizer.start(); } catch (_) {}
                        }
                      };

                      recognizer.start();
                      speechRecognitionRef.current = recognizer;
                    } catch (e) {
                      console.warn("SpeechRecognition init error:", e);
                    }
                  }
                } else {
                  // Peer-to-Peer WebRTC Setup
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
                }

            } catch (err) {
                console.error("Error starting audio call", err);
            }
        };

        initCall();

        // WebRTC Signaling listeners
        const handleOffer = async ({ offer, sdp }: any) => {
            if (!peerConnection.current) return;
            const desc = offer || sdp;
            if (desc) {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(desc));
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              socket.emit("rtc_answer", { target: partner.username, answer });
            }
        };

        const handleAnswer = async ({ answer, sdp }: any) => {
            if (peerConnection.current) {
              const desc = answer || sdp;
              if (desc) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(desc));
              }
            }
        };

        const handleCandidate = async ({ candidate }: any) => {
            if (peerConnection.current && candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        socket.on("rtc_offer", handleOffer);
        socket.on("webrtc_offer", handleOffer);
        socket.on("rtc_answer", handleAnswer);
        socket.on("webrtc_answer", handleAnswer);
        socket.on("rtc_ice_candidate", handleCandidate);
        socket.on("webrtc_ice_candidate", handleCandidate);

        return () => {
            isCancelled = true;
            socket.off("rtc_offer", handleOffer);
            socket.off("webrtc_offer", handleOffer);
            socket.off("rtc_answer", handleAnswer);
            socket.off("webrtc_answer", handleAnswer);
            socket.off("rtc_ice_candidate", handleCandidate);
            socket.off("webrtc_ice_candidate", handleCandidate);
            cleanup();
        };
    }, [isElizabeth, isInitiator, partner.username]);

    const sendVoicePromptToElizabeth = (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setIsAiThinking(true);
      setUserSubtitle(`Tú: "${clean}"`);

      socket.emit("send_private", {
        to: "Elizabeth",
        recipient: "Elizabeth",
        text: clean,
        id: Date.now().toString(),
        timestamp: Date.now(),
        isVoiceCall: true
      }, "Elizabeth", (res: any) => {
        if (!res?.success) {
          setIsAiThinking(false);
        }
      });
    };

    const cleanup = () => {
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.stop(); } catch (_) {}
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        if (aiAudioPlayerRef.current) {
          aiAudioPlayerRef.current.pause();
        }
        localStream.current?.getTracks().forEach((t) => t.stop());
        peerConnection.current?.close();
        if (audioContext.current && audioContext.current.state !== "closed") {
            audioContext.current.close().catch(() => {});
        }
    };

    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const nextMuted = !audioTrack.enabled;
                setIsMuted(nextMuted);
                if (speechRecognitionRef.current) {
                  if (nextMuted) {
                    try { speechRecognitionRef.current.stop(); } catch (_) {}
                  } else {
                    try { speechRecognitionRef.current.start(); } catch (_) {}
                  }
                }
            }
        }
    };

    const handleEndCall = () => {
        socket.emit('end_call', partner.username);
        cleanup();
        onEndCall();
    };

    const handleTextSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!textInputValue.trim()) return;
      sendVoicePromptToElizabeth(textInputValue);
      setTextInputValue("");
    };

    // Calculate ring sizes based on audio level or AI voice
    const effectiveAudioLevel = isAiSpeaking ? 60 + Math.random() * 40 : audioLevel;
    const ring1Size = 100 + (effectiveAudioLevel * 0.5);
    const ring2Size = 120 + (effectiveAudioLevel * 1.2);
    const ring3Size = 150 + (effectiveAudioLevel * 2);

    return (
        <div className="fixed inset-0 bg-[#060913] z-[200] flex flex-col items-center justify-between p-6 sm:p-10 animate-in fade-in duration-500 overflow-y-auto">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-purple-950/20 to-[#060913] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] max-w-[800px] max-h-[800px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none"></div>

            <audio ref={remoteAudioRef} autoPlay />

            {/* Top Bar Info */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-2">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 font-bold text-xs uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse">
                    <Volume2 size={15} />
                    {isElizabeth ? "Llamada de Voz con Elizabeth IA" : "Llamada de Voz Segura"}
                </div>
                
                <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md flex items-center gap-2">
                    <span>{partner.username}</span>
                    {isElizabeth && <Sparkles size={22} className="text-cyan-400" />}
                </h2>

                <div className="bg-black/50 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 shadow-inner mt-2">
                    <p className="text-cyan-300 font-mono text-base tracking-widest">
                        {formatTime(duration)}
                    </p>
                </div>
            </div>

            {/* Center: Avatar & Visualizer */}
            <div className="relative z-10 flex flex-col items-center justify-center my-6">
                <div className="relative flex items-center justify-center w-64 h-64">
                    {/* Visualizer Rings */}
                    <div 
                        className="absolute rounded-full border border-cyan-500/20 transition-all duration-75"
                        style={{ width: `${ring3Size}%`, height: `${ring3Size}%`, opacity: isMuted ? 0 : 0.25 }}
                    ></div>
                    <div 
                        className="absolute rounded-full border border-cyan-400/40 transition-all duration-75 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                        style={{ width: `${ring2Size}%`, height: `${ring2Size}%`, opacity: isMuted ? 0 : 0.6 }}
                    ></div>
                    <div 
                        className="absolute rounded-full border-2 border-cyan-300 transition-all duration-75 shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                        style={{ width: `${ring1Size}%`, height: `${ring1Size}%`, opacity: isMuted ? 0.3 : 1 }}
                    ></div>
                    
                    {/* Avatar Image */}
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#060913] shadow-2xl z-10 bg-[#121422]">
                        <img 
                            src={partner.profilePic || (isElizabeth ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.username}`)} 
                            alt={partner.username} 
                            className="w-full h-full object-cover" 
                        />
                        {isMuted && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                <MicOff size={34} className="text-red-400" />
                            </div>
                        )}
                        {isAiThinking && (
                            <div className="absolute inset-0 bg-cyan-950/70 flex flex-col items-center justify-center backdrop-blur-[2px] animate-pulse">
                                <Sparkles size={32} className="text-cyan-300 animate-spin" />
                                <span className="text-[10px] text-cyan-200 font-bold mt-1">Pensando...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtitles & Status Box */}
                {isElizabeth && (
                  <div className="w-full max-w-md mt-6 space-y-2 text-center">
                    {userSubtitle && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs text-gray-300 animate-in fade-in">
                        {userSubtitle}
                      </div>
                    )}
                    {aiSubtitle && (
                      <div className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-500/30 rounded-2xl px-5 py-3 text-xs text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-in fade-in leading-relaxed">
                        <span className="font-bold text-cyan-400 block mb-0.5">Elizabeth:</span>
                        {aiSubtitle}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Quick Text Input for Elizabeth Calls */}
            {isElizabeth && showTextInput && (
              <form onSubmit={handleTextSubmit} className="relative z-10 w-full max-w-md flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
                <input
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  placeholder="Escribe lo que quieres decirle a Elizabeth..."
                  className="flex-1 bg-black/60 border border-cyan-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-400 outline-none focus:border-cyan-400 shadow-inner"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  <Send size={16} />
                </button>
              </form>
            )}

            {/* Bottom Controls Bar */}
            <div className="relative z-10 flex items-center justify-center gap-6 bg-white/5 backdrop-blur-2xl px-8 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={isMuted ? "Activar Micrófono" : "Silenciar Micrófono"}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {isElizabeth && (
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className={`p-4 rounded-2xl transition-all duration-300 ${showTextInput ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title="Escribir mensaje en la llamada"
                  >
                    <MessageSquare size={24} />
                  </button>
                )}
                
                <button 
                    onClick={handleEndCall}
                    className="p-5 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] group"
                    title="Finalizar Llamada"
                >
                    <PhoneOff size={30} className="group-hover:scale-95 transition-transform" />
                </button>
            </div>
        </div>
    );
}
