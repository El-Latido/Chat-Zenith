const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const popupCode = `                             {reactionMenuId === (m.id || idx.toString()) && (
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
                             {isLiz ? (`;

code = code.replace(/\{isLiz \? \(/, popupCode);

fs.writeFileSync('src/App.tsx', code);
