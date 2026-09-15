const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const typingBlock = `                  {/* Typing Indicator */}
                  {typingUsers[activeChat] &&
                    typingUsers[activeChat].length > 0 && (
                      <div className="flex flex-col gap-1 mb-4 px-2 md:px-6">
                        {typingUsers[activeChat].includes("Elizabeth") && (
                          <div className="text-[#D4AF37] text-sm font-medium italic flex items-center">
                            ELIZABETH está escribiendo
                            <span className="ml-1 flex gap-1">
                              <span className="animate-bounce">.</span>
                              <span
                                className="animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              >
                                .
                              </span>
                              <span
                                className="animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              >
                                .
                              </span>
                            </span>
                          </div>
                        )}
                        {typingUsers[activeChat].filter(
                          (u) => u !== "Elizabeth",
                        ).length > 0 && (
                          <div className="text-[#8B98B0] text-sm font-medium italic">
                            {typingUsers[activeChat]
                              .filter((u) => u !== "Elizabeth")
                              .join(", ")}{" "}
                            {typingUsers[activeChat].filter(
                              (u) => u !== "Elizabeth",
                            ).length > 1
                              ? "están"
                              : "está"}{" "}
                            escribiendo...
                          </div>
                        )}
                      </div>
                    )}`;

const inputArea = `{/* Input Area */}
                <div className="px-2 pb-2 pt-1 shrink-0 bg-transparent relative z-10 max-w-5xl w-full mx-auto flex flex-col gap-2">`;

const replacement = `{/* Input Area */}
                <div className="px-2 pb-2 pt-1 shrink-0 bg-transparent relative z-10 max-w-5xl w-full mx-auto flex flex-col gap-2">
                  {/* Typing Indicator (Moved out of scroll area to prevent bouncing) */}
                  {typingUsers[activeChat] &&
                    typingUsers[activeChat].length > 0 && (
                      <div className="flex flex-col gap-1 px-4 -mt-2">
                        {typingUsers[activeChat].includes("Elizabeth") && (
                          <div className="text-[#D4AF37] text-sm font-medium italic flex items-center">
                            ELIZABETH está escribiendo
                            <span className="ml-1 flex gap-1">
                              <span className="animate-bounce">.</span>
                              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                            </span>
                          </div>
                        )}
                        {typingUsers[activeChat].filter(u => u !== "Elizabeth").length > 0 && (
                          <div className="text-[#8B98B0] text-sm font-medium italic">
                            {typingUsers[activeChat].filter((u) => u !== "Elizabeth").join(", ")}{" "}
                            {typingUsers[activeChat].filter((u) => u !== "Elizabeth").length > 1 ? "están" : "está"}{" "}
                            escribiendo...
                          </div>
                        )}
                      </div>
                    )}
`;

code = code.replace(typingBlock, "");
code = code.replace(inputArea, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched typing indicator");
