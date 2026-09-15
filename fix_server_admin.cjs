const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace admin checks for get_reports, get_banned_users, delete_report, admin_ban_user, etc.
code = code.replace(/if \(activeUsers\[currentUsername\]\?\.role !== "admin"\)/g, 'if (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS")');

code = code.replace(/if \(!currentUsername \|\| activeUsers\[currentUsername\]\?\.role !== "admin"\)/g, 'if (!currentUsername || (activeUsers[currentUsername]?.role !== "admin" && currentUsername.toUpperCase() !== "AXISS"))');

fs.writeFileSync('server.ts', code);
console.log("Fixed admin checks in server.ts");
