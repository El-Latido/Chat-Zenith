const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                        onClick={() => {
                            if (type === 'private_message' && fromUser) {
                                setActiveChat(fromUser);
                                setShowNotifications(false);
                            } else if ((type === 'like' || type === 'profile_comment') && fromUser) {
                                const targetUserObj = usersOnline.find(u => u.username === user.username) || user;
                                setSelectedUserModal(targetUserObj);
                                setShowNotifications(false);
                            }
                        }}`;
                        
const replace = `                        onClick={async () => {
                            if (n.id && n.id.length > 10) {
                                try { await updateDoc(doc(db, "notifications", n.id), { isRead: true }); } catch(e){}
                            }
                            // Optimistically remove from state
                            setNotifications(prev => prev.filter((_, idx) => idx !== (isString ? i : prev.findIndex(p => p.id === n.id))));

                            if (type === 'private_message' && fromUser) {
                                setActiveChat(fromUser);
                                setShowNotifications(false);
                            } else if ((type === 'like' || type === 'profile_comment') && fromUser) {
                                const targetUserObj = usersOnline.find(u => u.username === user.username) || user;
                                setSelectedUserModal(targetUserObj);
                                setShowNotifications(false);
                            }
                        }}`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
