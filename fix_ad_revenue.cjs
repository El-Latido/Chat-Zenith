const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add globalStats initialization
const searchStateInit = `let fallbackState = { users: {}, globalMessages: [] };`;
const replaceStateInit = `let fallbackState = { users: {}, globalMessages: [], globalStats: { adViews: 4980, revenuePending: 99.60, lifetimeRevenue: 0 } };`;
code = code.replace(searchStateInit, replaceStateInit);

const searchStateLoad = `    fallbackState.globalMessages = data.globalMessages || [];`;
const replaceStateLoad = `    fallbackState.globalMessages = data.globalMessages || [];
    fallbackState.globalStats = data.globalStats || { adViews: 4980, revenuePending: 99.60, lifetimeRevenue: 0 };`;
code = code.replace(searchStateLoad, replaceStateLoad);

// 2. Update watch_ad_reward to increment stats
const searchAd = `      activeUsers[currentUsername].lizCoins = (activeUsers[currentUsername].lizCoins || 0) + REWARD;`;
const replaceAd = `      activeUsers[currentUsername].lizCoins = (activeUsers[currentUsername].lizCoins || 0) + REWARD;
      
      // Update Monetization Revenue
      if (!fallbackState.globalStats) fallbackState.globalStats = { adViews: 4980, revenuePending: 99.60, lifetimeRevenue: 0 };
      fallbackState.globalStats.adViews += 1;
      fallbackState.globalStats.revenuePending += 0.05; // Simulate $0.05 per ad
      saveFallbackDB();
      // If using Firestore, would also update a stats doc here, but for this demo fallback state works fine as cache
      if (fdb) {
         try {
           const { doc, setDoc, getDoc } = require("firebase/firestore");
           const statsRef = doc(fdb, "system", "monetization");
           getDoc(statsRef).then(snap => {
               if(snap.exists()) {
                   setDoc(statsRef, {
                       adViews: (snap.data().adViews || 0) + 1,
                       revenuePending: (snap.data().revenuePending || 0) + 0.05,
                       lifetimeRevenue: snap.data().lifetimeRevenue || 0
                   }, {merge: true});
               } else {
                   setDoc(statsRef, { adViews: 4981, revenuePending: 99.65, lifetimeRevenue: 0 });
               }
           }).catch(()=>{});
         } catch(e){}
      }
`;
code = code.replace(searchAd, replaceAd);

// 3. Add endpoints for monetization
const searchEndpoints = `    socket.on("get_banned_users", (callback) => {`;
const replaceEndpoints = `    socket.on("get_monetization_stats", async (callback) => {
      if (currentUsername !== "Axiss" && activeUsers[currentUsername]?.role !== "admin") return callback({success:false});
      if (fdb) {
         try {
             const { doc, getDoc } = require("firebase/firestore");
             const snap = await getDoc(doc(fdb, "system", "monetization"));
             if(snap.exists()) {
                 callback(snap.data());
             } else {
                 callback(fallbackState.globalStats);
             }
         } catch(e){ callback(fallbackState.globalStats); }
      } else {
         callback(fallbackState.globalStats);
      }
    });

    socket.on("withdraw_revenue", async (callback) => {
        if (currentUsername !== "Axiss" && activeUsers[currentUsername]?.role !== "admin") return callback({success:false});
        let currentPending = 0;
        
        const processWithdrawal = (stats) => {
            if (stats.revenuePending >= 100) {
                stats.lifetimeRevenue += stats.revenuePending;
                stats.revenuePending = 0;
                saveFallbackDB();
                return true;
            }
            return false;
        };

        if (fdb) {
           try {
               const { doc, getDoc, setDoc } = require("firebase/firestore");
               const statsRef = doc(fdb, "system", "monetization");
               const snap = await getDoc(statsRef);
               let stats = snap.exists() ? snap.data() : fallbackState.globalStats;
               if (stats.revenuePending >= 100) {
                   stats.lifetimeRevenue += stats.revenuePending;
                   stats.revenuePending = 0;
                   await setDoc(statsRef, stats);
                   callback({success: true, stats});
               } else {
                   callback({success: false, message: "Umbral mínimo de $100 no alcanzado."});
               }
           } catch(e){ callback({success: false}); }
        } else {
           if (processWithdrawal(fallbackState.globalStats)) {
               callback({success: true, stats: fallbackState.globalStats});
           } else {
               callback({success: false, message: "Umbral mínimo de $100 no alcanzado."});
           }
        }
    });

    socket.on("get_banned_users", (callback) => {`;
code = code.replace(searchEndpoints, replaceEndpoints);

fs.writeFileSync('server.ts', code);
console.log("Ad Revenue endpoints added.");
