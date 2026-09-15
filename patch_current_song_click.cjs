const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const target1 = `           ) : currentSong ? (
               <div className="flex flex-col gap-0.5 mb-1 px-2 py-1.5 max-h-[70px]" style={{ fontSize: '0.85rem' }}>`;

const rep1 = `           ) : currentSong ? (
               <div onClick={() => currentSong && setSelectedHistorySong({ title: currentSong.title, url: currentSong.url || 'https://listen.moe/stream' })} className="flex flex-col gap-0.5 mb-1 px-2 py-1.5 max-h-[70px] cursor-pointer hover:bg-white/5 rounded transition-colors" style={{ fontSize: '0.85rem' }}>`;

const target2 = `           {currentRequestedSong && (!currentLiveDJ || currentLiveDJ === 'Elizabeth') ? (
               <div className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 rounded-xl p-2 relative overflow-hidden">`;

const rep2 = `           {currentRequestedSong && (!currentLiveDJ || currentLiveDJ === 'Elizabeth') ? (
               <div onClick={() => currentRequestedSong && setSelectedHistorySong({ title: currentRequestedSong.title, url: currentRequestedSong.url })} className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 cursor-pointer rounded-xl p-2 relative overflow-hidden transition-colors">`;


if (code.includes(target1) && code.includes(target2)) {
    code = code.replace(target1, rep1);
    code = code.replace(target2, rep2);
    fs.writeFileSync('src/components/InlineRadio.tsx', code);
    console.log("Patched current song click");
} else {
    console.log("Could not patch current song click");
}
