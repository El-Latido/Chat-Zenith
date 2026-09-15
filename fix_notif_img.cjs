const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                      return (
                      <div 
                        key={isString ? i : n.id || i} 
                        onClick={() => {
                            if (type === 'private_message' && fromUser) {
                                setActiveChat(fromUser);
                                setShowNotifications(false);
                            } else if ((type === 'like' || type === 'profile_comment') && fromUser) {
                                const targetUserObj = usersOnline.find(u => u.username === user.username) || user;
                                setSelectedUserModal(targetUserObj);
                                setShowNotifications(false);
                            }
                        }}
                        className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300 flex items-center gap-3 cursor-pointer group"
                      >
                        {fromUser && (
                           <img 
                             src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\`} 
                             alt={fromUser}
                             className="w-8 h-8 rounded-full bg-[#1A2639] group-hover:scale-105 transition-transform"
                           />
                        )}`;

const replace = `                      const fromUserObj = fromUser ? usersOnline.find(u => u.username === fromUser) : null;
                      const avatarSrc = fromUserObj?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\`;

                      return (
                      <div 
                        key={isString ? i : n.id || i} 
                        onClick={() => {
                            if (type === 'private_message' && fromUser) {
                                setActiveChat(fromUser);
                                setShowNotifications(false);
                            } else if ((type === 'like' || type === 'profile_comment') && fromUser) {
                                const targetUserObj = usersOnline.find(u => u.username === user.username) || user;
                                setSelectedUserModal(targetUserObj);
                                setShowNotifications(false);
                            }
                        }}
                        className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300 flex items-center gap-3 cursor-pointer group"
                      >
                        {fromUser && (
                           <img 
                             src={avatarSrc} 
                             alt={fromUser}
                             className="w-8 h-8 object-cover rounded-full bg-[#1A2639] group-hover:scale-105 transition-transform"
                           />
                        )}`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
