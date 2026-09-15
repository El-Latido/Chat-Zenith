const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  useEffect(() => {
    if (!isLoggedIn) return;`;

const rep = `  useEffect(() => {
    if (!isLoggedIn) return;

    const handleReconnect = () => {
        if (user.username) {
            // If they have a googleUid, use google_login, else register_or_login
            if (user.googleUid) {
                socket.emit('google_login', {
                    email: user.securityEmail,
                    displayName: user.username,
                    photoURL: user.profilePic,
                    googleUid: user.googleUid,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }, () => {});
            } else {
                // We don't have the password in memory, but we can emit a special reconnect event 
                // Or since we don't have the password, we can emit a new 'reconnect_user' event
                socket.emit('reconnect_user', { username: user.username });
            }
        }
    };
    socket.on('connect', handleReconnect);
`;

if (code.includes(target) && !code.includes('handleReconnect')) {
    code = code.replace(target, rep);
    // Also we need to add cleanup
    const cleanupTarget = `    return () => {
        if (unsubMessages) unsubMessages();
    };`;
    const cleanupRep = `    return () => {
        socket.off('connect', handleReconnect);
        if (unsubMessages) unsubMessages();
    };`;
    code = code.replace(cleanupTarget, cleanupRep);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched reconnect logic in App.tsx");
} else {
    console.log("Could not patch reconnect");
}
