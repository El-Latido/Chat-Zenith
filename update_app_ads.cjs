const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add states
const searchStates = `  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);`;
const replaceStates = `  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);`;
code = code.replace(searchStates, replaceStates);

const searchIcons = `import {
  LogOut,`;
const replaceIcons = `import {
  PlaySquare,
  LogOut,`;
code = code.replace(searchIcons, replaceIcons);


// Add ad logic and modals
const modalCode = `      {/* Out of Tokens Modal */}
      {outOfTokensAi && !isWatchingAd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-amber-500/30 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center">
            <button
              onClick={() => setOutOfTokensAi(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
               <span className="text-4xl">🪙</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Sin Moneditas!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Te has quedado sin Liz-Moneditas. Para seguir hablando con <span className="font-bold text-amber-400">{outOfTokensAi}</span> y otros personajes, mira un anuncio corto.
            </p>
            <button
              onClick={() => {
                 setIsWatchingAd(true);
                 setAdCountdown(5);
                 const interval = setInterval(() => {
                     setAdCountdown(prev => {
                         if (prev <= 1) {
                             clearInterval(interval);
                             socket.emit("watch_ad_reward", (res: any) => {
                                 if (res.success) {
                                     alert(\`¡Felicidades! Has ganado 100 Liz-Moneditas.\`);
                                     setOutOfTokensAi(null);
                                     setIsWatchingAd(false);
                                 }
                             });
                             return 0;
                         }
                         return prev - 1;
                     });
                 }, 1000);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PlaySquare size={20} />
              Ver Anuncio (Gratis)
            </button>
            <p className="text-xs text-gray-500 mt-4 italic">
              * SDK de publicidad integrado. Apoya al creador de ChatLiz.
            </p>
          </div>
        </div>
      )}

      {/* Ad Player Overlay */}
      {isWatchingAd && (
        <div className="fixed inset-0 bg-black z-[140] flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 text-white/50 text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-white/10">
            Anuncio Patrocinado
          </div>
          {adCountdown > 0 ? (
              <div className="absolute top-4 right-4 text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-white/10">
                La recompensa se entregará en {adCountdown}s
              </div>
          ) : (
              <div className="absolute top-4 right-4 text-green-400 text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-green-500/30">
                ¡Recompensa lista!
              </div>
          )}
          
          <div className="w-full max-w-3xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center border border-white/10">
             {/* Simulated Ad Video */}
             <video 
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
                autoPlay 
                muted
                className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] text-center px-4">
                     Publicidad SDK<br/><span className="text-amber-500">Demostración</span>
                 </h2>
             </div>
          </div>
          
          <p className="text-white/30 text-xs mt-6 text-center max-w-lg">
             Al visualizar este anuncio estás apoyando a los desarrolladores de la plataforma para mantener los servidores activos y a las IAs gratuitas.
          </p>
        </div>
      )}

      {selectedUserModal && (`;

code = code.replace(`      {selectedUserModal && (`, modalCode);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx with Rewarded Ads logic");
