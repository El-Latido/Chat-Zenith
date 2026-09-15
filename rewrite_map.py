import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Find the start of the map block
map_start_str = ".map((m, idx) => {"
map_start_idx = code.find(map_start_str)

# Find the end of the map block: we know it ends right before `                  {/* Typing Indicator */}`
typing_indicator_str = "{/* Typing Indicator */}"
typing_idx = code.find(typing_indicator_str, map_start_idx)

# We want to replace everything inside the map function return statement.
# The return statement starts with: return ( <div key={m.id || idx} ...
# And ends before the typing indicator.

return_start = code.find("return (", map_start_idx)
return_end = code.rfind(");", return_start, typing_idx) + 2

unified_bubble = """return (
                        <div
                          key={m.id || idx}
                          className="relative flex justify-start px-1 md:px-2 group"
                          onPointerDown={(e) => {
                            if (e.pointerType === "mouse" && e.button !== 0) return;
                            reactionTimerRef.current = setTimeout(() => setReactionMenuId(m.id || idx.toString()), 500);
                          }}
                          onPointerUp={() => clearTimeout(reactionTimerRef.current)}
                          onPointerMove={() => clearTimeout(reactionTimerRef.current)}
                          onPointerCancel={() => clearTimeout(reactionTimerRef.current)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setReactionMenuId(m.id || idx.toString());
                          }}
                        >
                          {reactionMenuId === (m.id || idx.toString()) && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 bg-[#1A2035] border border-[#D4AF37]/40 shadow-2xl rounded-full px-3 py-2 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                              {EMOTICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(m.id || idx.toString(), m.docId, emoji);
                                  }}
                                  className="text-2xl hover:scale-125 transition-transform origin-bottom"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 w-full mt-1.5 group">
                            <div
                              className="relative shrink-0 mt-1 cursor-pointer"
                              onClick={() => senderInfo && setSelectedUserModal(senderInfo)}
                            >
                              <img
                                referrerPolicy="no-referrer"
                                src={avatarUrl}
                                className={`w-8 h-8 rounded-full object-cover border shadow-sm ${m.sender === "Elizabeth" ? "border-[#D4AF37]/50" : "border-[#5A52A5]/30 bg-white/5"}`}
                                alt={m.sender}
                              />
                              {decUrl && (
                                <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                  <img
                                    referrerPolicy="no-referrer"
                                    src={decUrl}
                                    className={`w-[130%] h-[130%] object-contain filter drop-shadow-sm ${m.sender !== "Elizabeth" ? "opacity-80 mix-blend-multiply" : ""}`}
                                    style={{ imageRendering: "pixelated" }}
                                    alt=""
                                  />
                                </div>
                              )}
                            </div>
                            
                            {(() => {
                                const bColor = senderInfo?.bubbleColor || (m.sender === "Elizabeth" ? "transparent" : "#F2E3C6");
                                const bBorder = senderInfo?.bubbleBorder || (m.sender === "Elizabeth" ? "#D4AF3740" : "transparent");
                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded" : "rounded");
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "solid" : "solid");
                                const isElizabeth = m.sender === "Elizabeth";

                                let shapeClasses = "rounded-[20px] rounded-tl-sm";
                                if (bShape === "square") shapeClasses = "rounded-md";
                                if (bShape === "pill") shapeClasses = "rounded-full rounded-tl-sm px-5";
                                if (bShape === "leaf") shapeClasses = "rounded-br-3xl rounded-tl-3xl rounded-tr-md rounded-bl-md";
                                
                                let textureClasses = "";
                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30";
                                if (bTexture === "gradient") textureClasses = "bg-gradient-to-br from-white/20 to-transparent";
                                
                                const nameColor = isElizabeth ? "text-[#D4AF37]" : "text-[#5A52A5]";
                                const textColor = (bColor === "transparent" || bColor.toLowerCase() === "#1a2035" || isElizabeth) ? "text-[#E8D9B0]" : "text-[#1A2035]";
                                const timeColor = isElizabeth ? "text-[#8B98B0]" : "text-[#5A52A5]/70";

                                return (
                                  <div 
                                    className={`${shapeClasses} ${textureClasses} px-3.5 py-2 max-w-[85%] shadow-sm flex flex-col relative min-w-[150px] transition-all`}
                                    style={{ 
                                        backgroundColor: bColor !== "transparent" ? bColor : undefined,
                                        borderWidth: (bBorder !== "transparent" || isElizabeth) ? (isElizabeth ? '0 0 0 3px' : '1px') : '0',
                                        borderColor: bBorder !== "transparent" ? bBorder : (isElizabeth ? '#D4AF3740' : 'transparent'),
                                        boxShadow: (bBorder !== "transparent" && !isElizabeth) ? `0 0 8px ${bBorder}80` : undefined,
                                    }}
                                  >
                                    <span
                                      className={`font-bold ${nameColor} text-[13px] mb-1 cursor-pointer hover:underline uppercase`}
                                      onClick={() => setInputValue((prev) => prev + `@${m.sender} `)}
                                    >
                                      {m.sender}
                                    </span>
                                    {m.replyTo && (
                                      <div className={`bg-black/10 border-l-2 border-[#5A52A5]/50 px-2 py-1 mb-1 rounded text-xs italic flex flex-col ${textColor}`}>
                                        <span className="font-bold opacity-80">{m.replyTo.sender}</span>
                                        <span className="truncate opacity-70">{m.replyTo.text}</span>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                      <span
                                        className={`${textColor} text-[14px] leading-snug flex-1 cursor-pointer hover:bg-black/5 rounded px-1 transition-colors`}
                                        onClick={() => setReplyingTo(m)}
                                      >
                                        {m.text}
                                      </span>
                                      <button
                                        onClick={() => setReplyingTo(m)}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${nameColor} hover:opacity-80 p-1`}
                                        title="Responder"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="9 14 4 9 9 4"></polyline>
                                          <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                                        </svg>
                                      </button>
                                      <span className={`${timeColor} text-[11px] font-mono shrink-0 ml-auto pl-2`}>
                                        {timeStr}
                                      </span>
                                    </div>
                                    {m.image && (
                                      <div className="mt-1.5">
                                        <img
                                          referrerPolicy="no-referrer"
                                          src={m.image}
                                          className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover cursor-pointer hover:opacity-80"
                                          onClick={() => setReplyingTo(m)}
                                          alt="adjunto"
                                        />
                                      </div>
                                    )}
                                    {(m.type === "audio" || m.audio) && (
                                      <div className="w-full mt-1.5">
                                        <PremiumAudioPlayer src={m.audio} />
                                      </div>
                                    )}
                                    {m.reactions && Object.keys(m.reactions).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(m.reactions).map(([emoji, users]) => (
                                          <div
                                            key={emoji}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const userList = Array.isArray(users) ? users : Array(users).fill("Usuario anónimo");
                                              alert(`Reacciones ${emoji}: \\n${userList.join(", ")}`);
                                            }}
                                            className="bg-black/10 text-xs px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-black/20 transition-colors flex items-center gap-1"
                                            style={{ color: textColor }}
                                            title={Array.isArray(users) ? users.join(", ") : ""}
                                          >
                                            {emoji} {Array.isArray(users) ? users.length : users}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                            })()}
                          </div>
                        </div>
                      );"""

new_code = code[:return_start] + unified_bubble + code[return_end:]

with open('src/App.tsx', 'w') as f:
    f.write(new_code)
print("Rewrote map block")
