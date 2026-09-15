const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetTex2 = `                                    {!isMe && (
                                      {bTexture === "animals" && (`;

const repTex2 = `                                    {bTexture === "soap" && (
                                        <div className="absolute inset-0 rounded-[inherit] pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,154,158,0.2) 0%, rgba(254,207,239,0.2) 99%, rgba(254,207,239,0.2) 100%)', mixBlendMode: 'overlay' }}></div>
                                    )}
                                    {bTexture === "animals" && (
                                        <>
                                          <div className="absolute -top-3 -left-3 text-2xl z-10 animate-bounce pointer-events-none" style={{animationDuration: '2s'}}>🐰</div>
                                          <div className="absolute -bottom-3 -right-3 text-2xl z-10 animate-pulse pointer-events-none">🐱</div>
                                        </>
                                    )}
                                    {!isMe && (
                                      {bTexture === "animals" && (`;

code = code.replace(targetTex2, repTex2);

const cleanupTarget = `                                      {bTexture === "animals" && (
                                        <>
                                          <div className="absolute -top-3 -left-3 text-2xl z-10 animate-bounce" style={{animationDuration: '2s'}}>🐰</div>
                                          <div className="absolute -bottom-3 -right-3 text-2xl z-10 animate-pulse">🐱</div>
                                        </>
                                      )}
                                      <span`;

const cleanupRep = `                                      <span`;
code = code.replace(cleanupTarget, cleanupRep);

fs.writeFileSync('src/App.tsx', code);
