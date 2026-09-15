const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `  socket.on("like_user", async (targetUser: string) => {`;
const replace = `  socket.on("add_profile_comment", async (data: { targetUser: string, comment: string }) => {
    if (!socket.data.user) return;
    try {
        const commentObj = {
            author: socket.data.user.username,
            text: data.comment,
            timestamp: Date.now()
        };
        await updateDoc(doc(db, "users", data.targetUser), {
            profileComments: arrayUnion(commentObj)
        });
        // Notify the target user if online
        const targetSocketId = Array.from(io.sockets.sockets.values()).find(s => s.data?.user?.username === data.targetUser)?.id;
        if (targetSocketId) {
            io.to(targetSocketId).emit("new_profile_comment", { fromUser: socket.data.user.username, comment: commentObj });
        }
        // Send back to the commenter to update UI
        socket.emit("profile_comment_added", { targetUser: data.targetUser, comment: commentObj });
    } catch (e) {
        console.error("Error adding profile comment", e);
    }
  });

  socket.on("like_user", async (targetUser: string) => {`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
