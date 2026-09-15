const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const importTarget = `import { Radio, Play, Pause, Volume2, VolumeX, Loader2, Music, ListMusic, ChevronDown, ChevronUp, Youtube, User } from 'lucide-react';`;
const importRep = `import { Radio, Play, Pause, Volume2, VolumeX, Loader2, Music, ListMusic, ChevronDown, ChevronUp, Youtube, User, Download, X } from 'lucide-react';`;

const stateTarget = `  const [songHistory, setSongHistory] = useState<any[]>([]);`;
const stateRep = `  const [songHistory, setSongHistory] = useState<any[]>([]);
  const [selectedHistorySong, setSelectedHistorySong] = useState<any>(null);
  const [downloadFormat, setDownloadFormat] = useState<'mp3'|'mp4'>('mp3');
  const [downloadQuality, setDownloadQuality] = useState<'high'|'low'>('high');`;

const liTarget = `<li key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity" >`;
const liRep = `<li key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#1A2639]" onClick={() => s?.url && setSelectedHistorySong(s)}>`;

const renderTarget = `        </div>
      )}`;
const renderRep = `        </div>
      )}

      {selectedHistorySong && (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#12141c] border border-[#D4AF37]/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative flex flex-col gap-4">
                  <button onClick={() => setSelectedHistorySong(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white bg-white/5 p-1 rounded-full"><X size={18}/></button>
                  
                  <div className="flex flex-col gap-1 pr-6">
                      <h3 className="text-lg font-bold text-white leading-tight">{selectedHistorySong.title}</h3>
                      <p className="text-xs text-gray-400">Descargar o ver en YouTube</p>
                  </div>
                  
                  <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                      <button onClick={() => setDownloadFormat('mp3')} className={\`flex-1 py-1.5 rounded text-xs font-bold transition-all \${downloadFormat === 'mp3' ? 'bg-[#D4AF37] text-black shadow' : 'text-gray-400 hover:text-white'}\`}>MP3 (Audio)</button>
                      <button onClick={() => setDownloadFormat('mp4')} className={\`flex-1 py-1.5 rounded text-xs font-bold transition-all \${downloadFormat === 'mp4' ? 'bg-[#D4AF37] text-black shadow' : 'text-gray-400 hover:text-white'}\`}>MP4 (Video)</button>
                  </div>

                  <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                      <button onClick={() => setDownloadQuality('high')} className={\`flex-1 py-1.5 rounded text-xs font-bold transition-all \${downloadQuality === 'high' ? 'bg-pink-500 text-white shadow' : 'text-gray-400 hover:text-white'}\`}>Alta Calidad</button>
                      <button onClick={() => setDownloadQuality('low')} className={\`flex-1 py-1.5 rounded text-xs font-bold transition-all \${downloadQuality === 'low' ? 'bg-pink-500 text-white shadow' : 'text-gray-400 hover:text-white'}\`}>Baja Calidad</button>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                      <a href={\`/api/download?url=\${encodeURIComponent(selectedHistorySong.url)}&format=\${downloadFormat}&quality=\${downloadQuality}\`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                          <Download size={18} />
                          Descargar {downloadFormat.toUpperCase()}
                      </a>
                      
                      <a href={selectedHistorySong.url} target="_blank" rel="noopener noreferrer" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                          <Youtube size={18} />
                          Ver en YouTube
                      </a>
                  </div>
              </div>
          </div>
      )}
`;

code = code.replace(importTarget, importRep);
code = code.replace(stateTarget, stateRep);
code = code.replace(liTarget, liRep);
code = code.replace(renderTarget, renderRep);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
console.log("Patched radio modal");
