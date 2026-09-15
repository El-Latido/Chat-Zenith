const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    socket.on("report_user", async (data) => {
      if (!currentUsername) return;
      const { target, reason, proofBase64 } = data;
      if (fdb) {
          try {
             const { collection, addDoc } = require("firebase/firestore");
             await addDoc(collection(fdb, "reports"), {
                 reporter: currentUsername,
                 target,
                 reason,
                 proofBase64,
                 createdAt: Date.now()
             });
          } catch(e) { console.error("Error saving report", e); }
      }
      
      // Notify admins
      for (const un in activeUsers) {
          if (activeUsers[un].role === "admin") {
              io.to(activeUsers[un].socketId).emit("receive_global", {
                  sender: "Sistema",
                  text: \`\\u{1F6A8} NUEVO REPORTE: \${currentUsername} reportó a \${target}. Motivo: \${reason}\`,
                  id: Date.now().toString()
              });
          }
      }
    });`;

const replace = `    socket.on("report_user", async (data) => {
      if (!currentUsername) return;
      const { target, reason, proofBase64 } = data;
      if (fdb) {
          try {
             const { collection, addDoc } = require("firebase/firestore");
             await addDoc(collection(fdb, "reports"), {
                 reporter: currentUsername,
                 target,
                 reason,
                 proofBase64,
                 createdAt: Date.now()
             });
          } catch(e) { console.error("Error saving report", e); }
      }
      
      // Notify admins privately
      for (const un in activeUsers) {
          if (activeUsers[un].role === "admin") {
              io.to(activeUsers[un].socketId).emit("system_message", {
                  text: \`\\u{1F6A8} NUEVO REPORTE: \${currentUsername} ha reportado a \${target}. Revisa el panel de reportes.\`
              });
          }
      }
    });

    socket.on("get_reports", async (callback) => {
      if (activeUsers[currentUsername]?.role !== "admin") return callback([]);
      if (!fdb) return callback([]);
      try {
          const { collection, getDocs, query, orderBy } = require("firebase/firestore");
          const q = query(collection(fdb, "reports"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(reports);
      } catch(e) {
          console.error("Error fetching reports", e);
          callback([]);
      }
    });

    socket.on("delete_report", async (reportId, callback) => {
      if (activeUsers[currentUsername]?.role !== "admin") return callback({success: false});
      if (!fdb) return callback({success: false});
      try {
          const { doc, deleteDoc } = require("firebase/firestore");
          await deleteDoc(doc(fdb, "reports", reportId));
          callback({success: true});
      } catch(e) {
          console.error("Error deleting report", e);
          callback({success: false});
      }
    });`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
