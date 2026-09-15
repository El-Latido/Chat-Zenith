const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const onlineSidebarSearch = `                  onClick={() => {
                    closeAllModals();
                    setIsSidebarOpen(false);
                    setActiveChat(u.username);
                  }}`;
const onlineSidebarReplace = `                  onClick={() => {
                    closeAllModals();
                    setSelectedUserModal(u as any);
                  }}`;
code = code.replace(onlineSidebarSearch, onlineSidebarReplace);

const friendsSidebarSearch = `                      onClick={() => {
                        setActiveChat(friendUsername);
                        setUnreadPMs((prev) => ({
                          ...prev,
                          [friendUsername]: false,
                        }));
                        setIsFriendsSidebarOpen(false);
                      }}`;
const friendsSidebarReplace = `                      onClick={() => {
                        closeAllModals();
                        setSelectedUserModal((friendInfo || {
                            username: friendUsername,
                            profilePic: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${friendUsername}\`
                        }) as any);
                      }}`;
code = code.replace(friendsSidebarSearch, friendsSidebarReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed sidebar onClicks");
