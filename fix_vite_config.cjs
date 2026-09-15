const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const search = `    build: {
      sourcemap: true, // Enable sourcemaps for production
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'lucide': ['lucide-react'],
            'motion': ['motion'],
            'emoji': ['emoji-picker-react']
          }
        }
      }
    },`;
    
const replace = `    build: {
      sourcemap: true, // Enable sourcemaps for production
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'lucide': ['lucide-react']
          }
        }
      }
    },`;

code = code.replace(search, replace);
fs.writeFileSync('vite.config.ts', code);
