const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Modify chatList mapping to make click work properly
const searchChatMap = `                  <div
                    key={friendUsername}
                    className="flex items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div
                      onClick={() => {
                        closeAllModals();
                        setSelectedUserModal((friendInfo || {
                            username: friendUsername,
                            profilePic: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${friendUsername}\`
                        }) as any);
                      }}
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 overflow-hidden relative flex-shrink-0">`;
const replaceChatMap = `                  <div
                    key={friendUsername}
                    className="flex items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div
                      onClick={() => {
                        setActiveChat(friendUsername);
                        setUnreadPMs((prev) => ({
                          ...prev,
                          [friendUsername]: false,
                        }));
                        setIsFriendsSidebarOpen(false);
                      }}
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-[#D4AF37]/30 overflow-hidden relative flex-shrink-0">`;
code = code.replace(searchChatMap, replaceChatMap);

// Modify snippet size and color for better visibility
const searchSnippet = `                          {unreadPMs[friendUsername] && (
                            <div className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {chatInfo.lastMessage || "Conversación"}
                        </p>`;
const replaceSnippet = `                          {unreadPMs[friendUsername] && (
                            <div className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></div>
                          )}
                        </div>
                        <p className={\`text-sm truncate \${unreadPMs[friendUsername] ? "text-white font-semibold" : "text-gray-400"}\`}>
                          {chatInfo.lastMessage || "Conversación"}
                        </p>`;
code = code.replace(searchSnippet, replaceSnippet);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed Mailbox click and snippet.");
