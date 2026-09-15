const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    socket.on("report_user", async (data) => {`;
const replace = `    socket.on("get_reports", async (callback) => {
        if (!currentUsername || (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS")) return callback([]);
        if (fdb) {
            try {
                const { collection, getDocs, orderBy, query } = require("firebase/firestore");
                const q = query(collection(fdb, "reports"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(reports);
            } catch(e) {
                console.error("Error fetching reports", e);
                callback([]);
            }
        } else {
            callback([]);
        }
    });

    socket.on("delete_report", async (id, callback) => {
        if (!currentUsername || (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS")) return callback({success: false});
        if (fdb) {
            try {
                const { doc, deleteDoc } = require("firebase/firestore");
                await deleteDoc(doc(fdb, "reports", id));
                callback({success: true});
            } catch(e) {
                console.error("Error deleting report", e);
                callback({success: false});
            }
        } else {
            callback({success: false});
        }
    });

    socket.on("report_user", async (data) => {`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log("Added get_reports and delete_report to server.ts");
