const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLoadAiUser = `  const loadAiUser = __name(async () => {
    if (fdb) {
      try {
        const docR = await getDoc(doc(fdb, "users", "Elizabeth"));
        if (docR.exists()) aiUserTempCache = docR.data();
      } catch (e) {}
    } else {
      if (fallbackState.users["Elizabeth"])
        aiUserTempCache = {
          ...fallbackState.users["Elizabeth"],
          username: "Elizabeth",
        };
    }
  }, "loadAiUser");`;

const newLoadAiUser = `  const loadAiUser = __name(async () => {
    if (fdb) {
      try {
        for (const ai of Object.keys(AI_CHARACTERS)) {
            const docR = await getDoc(doc(fdb, "users", ai));
            if (docR.exists()) aiUserTempCache[ai] = { ...aiUserTempCache[ai], ...docR.data() };
        }
      } catch (e) {}
    } else {
      for (const ai of Object.keys(AI_CHARACTERS)) {
        if (fallbackState.users[ai])
          aiUserTempCache[ai] = {
            ...aiUserTempCache[ai],
            ...fallbackState.users[ai],
            username: ai,
          };
      }
    }
  }, "loadAiUser");`;
  
code = code.replace(oldLoadAiUser, newLoadAiUser);

// Fix line 1561 for DJ schedule
const oldDJ = `      if (target === "Elizabeth" && aiUserTempCache) {
        aiUserTempCache.role = "dj";
        aiUserTempCache.djSchedule = data.schedule;`;
const newDJ = `      if (target === "Elizabeth" && aiUserTempCache["Elizabeth"]) {
        aiUserTempCache["Elizabeth"].role = "dj";
        aiUserTempCache["Elizabeth"].djSchedule = data.schedule;`;
code = code.replace(oldDJ, newDJ);

fs.writeFileSync('server.ts', code);
