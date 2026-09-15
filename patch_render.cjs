const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badgeCodeLiz = `
                                         {m.reactions && Object.keys(m.reactions).length > 0 && (
                                             <div className="flex flex-wrap gap-1 mt-1">
                                                 {Object.entries(Object.values(m.reactions).reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as any)).map(([emoji, count]: any) => (
                                                     <span key={emoji} className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full text-white">{emoji} {count}</span>
                                                 ))}
                                             </div>
                                         )}
`;

code = code.replace("{(m.type === 'audio' || m.audio) && <div className=\"mt-1.5\"><PremiumAudioPlayer src={m.audio} /></div>}", "{(m.type === 'audio' || m.audio) && <div className=\"mt-1.5\"><PremiumAudioPlayer src={m.audio} /></div>}" + badgeCodeLiz);

const badgeCodeUser = `
                                         {m.reactions && Object.keys(m.reactions).length > 0 && (
                                             <div className="flex flex-wrap gap-1 mt-1">
                                                 {Object.entries(Object.values(m.reactions).reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as any)).map(([emoji, count]: any) => (
                                                     <span key={emoji} className="bg-black/10 text-xs px-1.5 py-0.5 rounded-full text-black">{emoji} {count}</span>
                                                 ))}
                                             </div>
                                         )}
`;

code = code.replace("{(m.type === 'audio' || m.audio) && <div className=\"w-full mt-1.5\"><PremiumAudioPlayer src={m.audio} /></div>}", "{(m.type === 'audio' || m.audio) && <div className=\"w-full mt-1.5\"><PremiumAudioPlayer src={m.audio} /></div>}" + badgeCodeUser);

const popupCode = `
                             {reactionMenuId === (m.id || idx.toString()) && (
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 bg-[#1A2035] border border-[#D4AF37]/40 shadow-2xl rounded-full px-3 py-2 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                                     {EMOTICONS.map(emoji => (
                                         <button 
                                             key={emoji}
                                             onClick={(e) => { e.stopPropagation(); handleReaction(m.id || idx.toString(), m.docId, emoji); }}
                                             className="text-2xl hover:scale-125 transition-transform origin-bottom"
                                         >{emoji}</button>
                                     ))}
                                 </div>
                             )}
`;

// Insert popup code before closing div of the message container
code = code.replace(/(\s*)(<\/div>\s*\);\s*})/g, (match, p1, p2) => {
    return popupCode + p2;
});

fs.writeFileSync('src/App.tsx', code);
