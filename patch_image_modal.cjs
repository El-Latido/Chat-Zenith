const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `                                        <img
                                          referrerPolicy="no-referrer"
                                          src={m.image}
                                          className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover cursor-pointer hover:opacity-80"
                                          onClick={() => setExpandedImage(m.image)}
                                          alt="adjunto"
                                        />`;

const replacement1 = `                                        <img
                                          referrerPolicy="no-referrer"
                                          src={m.image}
                                          className="rounded-xl border border-black/10 max-w-full shadow-md h-auto max-h-48 object-contain cursor-pointer hover:opacity-80 relative z-20"
                                          onClick={(e) => { e.stopPropagation(); setExpandedImage(m.image); }}
                                          alt="adjunto"
                                        />`;
                                        
code = code.replace(target1, replacement1);
fs.writeFileSync('src/App.tsx', code);
