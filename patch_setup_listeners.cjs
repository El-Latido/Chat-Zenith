const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetToRemove = `    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            if (user.username) {
                setupListeners();
            }
        } else {
            signInAnonymously(auth).catch((error) => {
                if (error.code === 'auth/api-key-not-valid' || error.message.includes('API key not valid')) {
                    console.warn("⚠️ Firebase sin configurar: Faltan las variables de entorno en Hugging Face. Las funciones web seguirán funcionando con WebSocket.");
                } else {
                    console.error("Error de autenticación Firebase:", error);
                }
            });
        }
    });`;

const replacement = `    // Removed onAuthStateChanged logic that was trapping setupListeners`;

if (code.includes(targetToRemove)) {
    code = code.replace(targetToRemove, replacement);
    
    const targetToInsert = `  useEffect(() => {
    if (!isLoggedIn) return;`;
    const insertReplacement = `  useEffect(() => {
    // Auth anonymously for Firebase
    onAuthStateChanged(auth, (authUser) => {
       if (!authUser) {
           signInAnonymously(auth).catch(e => console.warn(e));
       }
    });
    if (user.username) {
        setupListeners();
    }
  }, [user.username]);

  useEffect(() => {
    if (!isLoggedIn) return;`;
    
    code = code.replace(targetToInsert, insertReplacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched setupListeners");
} else {
    console.log("Could not find target to remove");
}
