const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

// Add isSwapped state
const stateInsert = `    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);`;
code = code.replace(`    const [isVideoOn, setIsVideoOn] = useState(false);`, stateInsert);

// Fix ontrack
const onTrackOld = `                peerConnection.current.ontrack = (event) => {
                    setRemoteStreamAvailable(true);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };`;
const onTrackNew = `                peerConnection.current.ontrack = (event) => {
                    setRemoteStreamAvailable(true);
                    if (remoteVideoRef.current) {
                        if (event.streams && event.streams[0]) {
                            remoteVideoRef.current.srcObject = event.streams[0];
                        } else {
                            let stream = remoteVideoRef.current.srcObject;
                            if (!stream) {
                                stream = new MediaStream();
                                remoteVideoRef.current.srcObject = stream;
                            }
                            stream.addTrack(event.track);
                        }
                        // Ensure it plays
                        remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                    }
                };`;
code = code.replace(onTrackOld, onTrackNew);

// Fix the video rendering part
const videoRenderOld = `<div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Remote Video/Audio */}
                <video 
                     ref={remoteVideoRef} 
                     autoPlay 
                     playsInline 
                     className={\`w-full h-full object-cover transition-opacity duration-500 \${remoteStreamAvailable ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}\`}
                />
                
                {/* Placeholder if no remote video (but audio still plays via video tag) */}
                {!remoteStreamAvailable && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <img src={partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`} alt={partner.username} className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                        </div>
                        <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className={\`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-500 \${isVideoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}\`}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>`;

const videoRenderNew = `<div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Remote Video Container */}
                <div 
                    onClick={() => isSwapped && setIsSwapped(false)}
                    className={\`transition-all duration-500 overflow-hidden flex items-center justify-center \${!isSwapped ? 'absolute inset-0 w-full h-full' : 'absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 rounded-3xl border-2 border-white/10 shadow-2xl z-20 cursor-pointer hover:scale-105'} \${remoteStreamAvailable ? 'bg-black' : 'bg-gradient-to-b from-[#12141c] to-[#0B1220]'}\`}
                >
                    <video 
                         ref={remoteVideoRef} 
                         autoPlay 
                         playsInline 
                         className={\`w-full h-full object-cover transition-opacity duration-500 \${remoteStreamAvailable ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}\`}
                    />
                    {!remoteStreamAvailable && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={\`\${isSwapped ? 'w-16 h-16 border-[3px]' : 'w-48 h-48 border-[6px] mb-8'} rounded-full overflow-hidden border-cyan-500/30 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700\`}>
                                <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                <img src={partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`} alt={partner.username} className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                            </div>
                            {!isSwapped && (
                                <>
                                    <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{partner.username}</h3>
                                    <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Local Video Container */}
                <div 
                    onClick={() => !isSwapped && isVideoOn && setIsSwapped(true)}
                    className={\`transition-all duration-500 overflow-hidden bg-[#12141c] \${isSwapped ? 'absolute inset-0 w-full h-full' : 'absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 rounded-3xl border-2 border-white/10 shadow-2xl z-20 cursor-pointer hover:scale-105'} \${(!isVideoOn && !isSwapped) ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}\`}
                >
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {(!isVideoOn && isSwapped) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                           <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 flex items-center justify-center bg-[#1A2639]">
                               <span className="text-white text-xl">Tu video apagado</span>
                           </div>
                        </div>
                    )}
                </div>
            </div>`;

code = code.replace(videoRenderOld, videoRenderNew);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
