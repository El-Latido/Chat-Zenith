const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const wrongSwap = `            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Main Video (Remote by default, Local if swapped) */}
                <video 
                    ref={isSwapped ? localVideoRef : remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    muted={isSwapped} // Local video should be muted
                    onClick={() => setIsSwapped(!isSwapped)}
                    className={\`w-full h-full object-cover cursor-pointer transition-opacity duration-500 \${(isSwapped ? isVideoOn : remoteStreamAvailable) ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}\`}
                />
                
                {/* Placeholder if Main video is not available */}
                {!(isSwapped ? isVideoOn : remoteStreamAvailable) && (
                    <div 
                      onClick={() => setIsSwapped(!isSwapped)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220] cursor-pointer"
                    >
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <img src={isSwapped ? \`https://api.dicebear.com/7.x/avataaars/svg?seed=local\` : (partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`)} alt="Profile" className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                        </div>
                        <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{isSwapped ? 'Tú' : partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                    </div>
                )}

                {/* PiP Video (Local by default, Remote if swapped) */}
                <div 
                    onClick={() => setIsSwapped(!isSwapped)}
                    className={\`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl cursor-pointer transition-all duration-500 \${(!isSwapped ? isVideoOn : remoteStreamAvailable) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}\`}
                >
                    <video 
                      ref={!isSwapped ? localVideoRef : remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      muted={!isSwapped} // Local video should be muted
                      className="w-full h-full object-cover" 
                    />
                </div>
            </div>`;

const correctSwap = `            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Remote Video Container */}
                <div 
                    onClick={() => setIsSwapped(false)}
                    className={\`transition-all duration-500 cursor-pointer overflow-hidden \${!isSwapped ? 'absolute inset-0 z-0' : 'absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl border-2 border-white/10 shadow-2xl z-20'} \${remoteStreamAvailable ? 'opacity-100' : (isSwapped ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100')}\`}
                >
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className={\`w-full h-full object-cover transition-opacity duration-500 \${remoteStreamAvailable ? 'opacity-100' : 'opacity-0'}\`}
                    />
                    {!remoteStreamAvailable && !isSwapped && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                                <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                <img src={partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`} alt={partner.username} className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                            </div>
                            <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{partner.username}</h3>
                            <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                        </div>
                    )}
                </div>

                {/* Local Video Container */}
                <div 
                    onClick={() => setIsSwapped(true)}
                    className={\`transition-all duration-500 cursor-pointer overflow-hidden \${isSwapped ? 'absolute inset-0 z-0' : 'absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl border-2 border-white/10 shadow-2xl z-20'} \${isVideoOn ? 'opacity-100 scale-100' : (isSwapped ? 'opacity-100' : 'opacity-0 scale-90 pointer-events-none')}\`}
                >
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={\`w-full h-full object-cover transition-opacity duration-500 \${isVideoOn ? 'opacity-100' : 'opacity-0'}\`}
                    />
                    {!isVideoOn && isSwapped && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                                <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                <img src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=local\`} alt="Tú" className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                            </div>
                            <h3 className="text-4xl font-light text-white mb-3 tracking-wide">Tú</h3>
                            <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                        </div>
                    )}
                </div>
            </div>`;

code = code.replace(wrongSwap, correctSwap);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
