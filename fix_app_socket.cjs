const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchPrivate = `    socket.on("receive_private", (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {
        setUnreadPMs((prev) => ({ ...prev, [fromUser]: true }));
        setNotifications((prev) => [\`Nuevo mensaje de \${fromUser}\`, ...prev]);
        setToasts((prev) => [`;
        
const replacePrivate = `    socket.on("user_liked", (fromUser: string) => {
        playNotifySound();
        setNotifications(prev => [{
            id: Date.now().toString(),
            type: 'like',
            text: \`A \${fromUser} le gustó tu perfil\`,
            fromUser,
            read: false,
            timestamp: Date.now()
        }, ...prev]);
    });
    
    socket.on("new_profile_comment", (data: { fromUser: string, comment: any }) => {
        playNotifySound();
        setNotifications(prev => [{
            id: Date.now().toString(),
            type: 'profile_comment',
            text: \`\${data.fromUser} comentó en tu perfil: "\${data.comment.text}"\`,
            fromUser: data.fromUser,
            read: false,
            timestamp: Date.now()
        }, ...prev]);
    });

    socket.on("receive_private", (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChatRef.current !== fromUser) {
        setUnreadPMs((prev) => ({ ...prev, [fromUser]: true }));
        setNotifications((prev) => [{
            id: Date.now().toString(),
            type: 'private_message',
            text: \`Nuevo mensaje de \${fromUser}\`,
            fromUser,
            read: false,
            timestamp: Date.now()
        }, ...prev]);
        setToasts((prev) => [`;

code = code.replace(searchPrivate, replacePrivate);

const renderSearch = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300">
                        {typeof n === 'string' ? n : n.text || 'Notificación'}
                      </div>
                    ))
                  )}`;
                  
const renderReplace = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const isString = typeof n === 'string';
                      const text = isString ? n : n.text || 'Notificación';
                      const fromUser = !isString ? n.fromUser : null;
                      const type = !isString ? n.type : 'system';
                      
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
                             src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\`} 
                             alt={fromUser}
                             className="w-8 h-8 rounded-full bg-[#1A2639] group-hover:scale-105 transition-transform"
                           />
                        )}
                        <div className="flex-1">
                            {text}
                            {!isString && n.timestamp && (
                                <div className="text-[10px] text-gray-500 mt-1">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                      </div>
                    )})
                  )}`;

code = code.replace(renderSearch, renderReplace);

fs.writeFileSync('src/App.tsx', code);
