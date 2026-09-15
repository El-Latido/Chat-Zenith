const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { auth } from './firebaseConfig'")) {
    code = code.replace("import { auth, fdb, storage } from './firebaseConfig';", "import { auth, fdb, storage } from './firebaseConfig';\nimport { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';");
    code = code.replace("import { socket } from './socket';", "import { socket } from './socket';\nimport { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';");
}

const handleGoogleCode = `
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
         email: googleUser.email,
         displayName: googleUser.displayName,
         photoURL: googleUser.photoURL,
         googleUid: googleUser.uid,
         timezone
      };
      
      socket.emit('google_login', payload, (res: any) => {
         if (res.success) {
            setUser({
               ...user,
               username: res.username,
               profilePic: res.profilePic,
               statusMessage: res.statusMessage,
               role: res.role,
               countryLanguage: res.countryLanguage || user.countryLanguage,
               timezone,
               is_friends_public: res.is_friends_public,
               friends_list: res.friends_list || [],
               blocked_list: res.blocked_list || []
            });
            setIsLoggedIn(true);
         } else {
            alert(res.error || 'Error al iniciar sesión con Google');
         }
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
         alert("Error al autenticar con Google: " + error.message);
      }
    }
  };

  const handleLogin =`;

code = code.replace("const handleLogin =", handleGoogleCode);

// Pass it to <Login />
code = code.replace(
  "<Login user={user} setUser={setUser} handleLogin={handleLogin} setRecoveryModalOpen={setRecoveryModalOpen} />",
  "<Login user={user} setUser={setUser} handleLogin={handleLogin} setRecoveryModalOpen={setRecoveryModalOpen} handleGoogleLogin={handleGoogleLogin} />"
);

fs.writeFileSync('src/App.tsx', code);
