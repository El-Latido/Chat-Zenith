const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the broken useEffect
const brokenEffect = `  useEffect(() => {
    // Auth anonymously for Firebase
    onAuthStateChanged(auth, (authUser) => {
       if (!authUser) {
           signInAnonymously(auth).catch(e => console.warn(e));
       }
    });
    if (user.username) {
        setupListeners();
    }
  }, [user.username]);`;

code = code.replace(brokenEffect, '');

// Inside the big useEffect, we had `// Removed onAuthStateChanged logic that was trapping setupListeners`
const targetToInsert = `    // Removed onAuthStateChanged logic that was trapping setupListeners`;
const insertReplacement = `    onAuthStateChanged(auth, (authUser) => {
       if (!authUser) {
           signInAnonymously(auth).catch(e => console.warn(e));
       }
    });
    if (user.username) {
        setupListeners();
    }`;

if (code.includes(targetToInsert)) {
    code = code.replace(targetToInsert, insertReplacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched setupListeners correctly");
} else {
    console.log("Could not find targetToInsert");
}
