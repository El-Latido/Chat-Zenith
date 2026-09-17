import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  signInAnonymously,\nimport { onAuthStateChanged,\n  GoogleAuthProvider,\n  signInWithPopup,\n} from \"firebase/auth\";", "import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from \"firebase/auth\";")
with open('src/App.tsx', 'w') as f:
    f.write(content)
