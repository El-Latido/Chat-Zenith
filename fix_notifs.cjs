const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix the image logic
const searchAvatar = `                      const fromUserObj = fromUser ? usersOnline.find(u => u.username === fromUser) : null;
                      const avatarSrc = fromUserObj?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\`;`;

const replaceAvatar = `                      const fromUserObj = fromUser ? (usersOnline.find(u => u.username === fromUser) || userCache[fromUser]) : null;
                      const avatarSrc = fromUserObj?.profilePic || (fromUser ? \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${fromUser}\` : undefined);`;

code = code.replace(searchAvatar, replaceAvatar);

// 2. Fix the delete logic in Limpiar button
const searchLimpiar = `                               // Assuming updateDoc and doc are imported from firebaseConfig
                               await updateDoc(doc(db, "notifications", n.id), { isRead: true });`;

const replaceLimpiar = `                               await deleteDoc(doc(db, "notifications", n.id));`;

code = code.replace(searchLimpiar, replaceLimpiar);

// 3. Fix the delete logic in individual notification click
const searchClick = `                            if (n.id && n.id.length > 10) {
                                try { await updateDoc(doc(db, "notifications", n.id), { isRead: true }); } catch(e){}
                            }`;

const replaceClick = `                            if (n.id && n.id.length > 13) {
                                try { await deleteDoc(doc(db, "notifications", n.id)); } catch(e){}
                            }`;

code = code.replace(searchClick, replaceClick);

// Note: I also changed n.id.length > 13 to avoid hitting local Date.now() notifications which are 13 chars.
// But wait, the Limpiar button has length > 10. Let's fix that too.
const searchLimpiarFilter = `const firestoreNotifs = notifications.filter(n => n.id && n.id.length > 10);`;
const replaceLimpiarFilter = `const firestoreNotifs = notifications.filter(n => n.id && n.id.length > 13);`;
code = code.replace(searchLimpiarFilter, replaceLimpiarFilter);


// 4. Ensure deleteDoc is imported
if (!code.includes('deleteDoc')) {
    const searchImport = `  doc,`;
    const replaceImport = `  doc,\n  deleteDoc,`;
    code = code.replace(searchImport, replaceImport);
}

fs.writeFileSync('src/App.tsx', code);
