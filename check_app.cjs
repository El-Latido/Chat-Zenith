const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /catch\s*\(\s*error:\s*any\s*\)\s*\{[\s\S]*?\}/;
const newCatch = `catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
         // do nothing
      } else if (error.message && error.message.includes('Cross-Origin')) {
         alert("La ventana de Google está bloqueada por el navegador dentro de esta vista previa. Para usar Google Login, por favor abre la aplicación en una nueva pestaña (haciendo clic en la flecha de la esquina superior derecha).");
      } else {
         alert("Error al autenticar con Google. Si estás en la vista previa, intenta abrir la app en una pestaña nueva.\\nDetalle: " + error.message);
      }
    }`;

code = code.replace(regex, newCatch);
fs.writeFileSync('src/App.tsx', code);
