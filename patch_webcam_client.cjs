const fs = require('fs');
let code = fs.readFileSync('src/components/FriendsWebcam.tsx', 'utf8');

// Add states
code = code.replace(
  /const \[partnerDisconnected, setPartnerDisconnected\] = useState\(false\);/,
  `const [partnerDisconnected, setPartnerDisconnected] = useState(false);
    const [webcamName, setWebcamName] = useState(user.username);
    const [partnerName, setPartnerName] = useState("");`
);

// Add customName to emit
code = code.replace(
  /socket\.emit\("join_webcam_queue"\);/,
  `socket.emit("join_webcam_queue", { name: webcamName });`
);

// Receive partnerName
code = code.replace(
  /socket\.on\("webcam_matched", async \(\{ initiator, partnerSocket \}\) => \{/,
  `socket.on("webcam_matched", async ({ initiator, partnerSocket, partnerName }) => {
            setPartnerName(partnerName);`
);

// Allow editing name in idle state
const idleBlock = `<Webcam size={64} className="text-purple-500/50 mb-6" />
                        <h3 className="text-white text-2xl font-light mb-8">Conoce gente nueva al instante</h3>`;
const idleReplace = `<Webcam size={64} className="text-purple-500/50 mb-6" />
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
                        </div>`;
code = code.replace(idleBlock, idleReplace);

// Display partnerName when matched
const remoteVideo = `<video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />`;
const remoteVideoReplace = `<video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                {state === 'matched' && !partnerDisconnected && partnerName && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                        <p className="text-white font-bold">{partnerName}</p>
                    </div>
                )}`;
code = code.replace(remoteVideo, remoteVideoReplace);

fs.writeFileSync('src/components/FriendsWebcam.tsx', code);
console.log("Patched client webcam UI");
