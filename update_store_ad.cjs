const fs = require('fs');
let code = fs.readFileSync('src/components/StoreModal.tsx', 'utf8');

const navBarSearch = `            <div className="flex gap-2">
              {categories.map((cat, i) => (`;

const navBarReplace = `            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCurrentCategoryIndex(-1)}
                className={\`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap \${currentCategoryIndex === -1 ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}\`}
              >
                🎥 Ganar LM
              </button>
              {categories.map((cat, i) => (`;

code = code.replace(navBarSearch, navBarReplace);

const stateSearch = `  const [chessBet, setChessBet] = useState(10);`;
const stateReplace = `  const [chessBet, setChessBet] = useState(10);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(0);`;
code = code.replace(stateSearch, stateReplace);

const renderSearch = `          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories[currentCategoryIndex].items.map((dec) => {`;

const renderReplace = `          {currentCategoryIndex === -1 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-amber-500/20">
                  <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-amber-500/20">
                      <Sparkles size={40} className="text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-400 mb-2">Recarga Gratis</h3>
                  <p className="text-gray-400 text-center mb-8 max-w-sm">
                      Mira un video patrocinado para ganar <span className="text-amber-400 font-bold">100 LM</span> y continuar hablando con nuestras guías IA.
                  </p>
                  
                  {isPlayingAd ? (
                      <div className="flex flex-col items-center w-full max-w-md">
                          <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center mb-4 overflow-hidden relative">
                              <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white z-10">Anuncio</div>
                              <video src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" autoPlay muted playsInline className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-4xl font-bold text-white drop-shadow-lg">{adTimeLeft}s</span>
                              </div>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 transition-all duration-1000 ease-linear" style={{ width: \`\${((15 - adTimeLeft) / 15) * 100}%\` }}></div>
                          </div>
                      </div>
                  ) : (
                      <button 
                          onClick={() => {
                              setIsPlayingAd(true);
                              setAdTimeLeft(15);
                              let timeLeft = 15;
                              const interval = setInterval(() => {
                                  timeLeft -= 1;
                                  setAdTimeLeft(timeLeft);
                                  if (timeLeft <= 0) {
                                      clearInterval(interval);
                                      setIsPlayingAd(false);
                                      // Tell server to add coins
                                      socket.emit('watch_ad_reward');
                                  }
                              }, 1000);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
                      >
                          Ver Video (15s)
                      </button>
                  )}
              </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories[currentCategoryIndex].items.map((dec) => {`;

code = code.replace(renderSearch, renderReplace);

fs.writeFileSync('src/components/StoreModal.tsx', code);
