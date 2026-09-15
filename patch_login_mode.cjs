const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// Add state for isRegisterMode
code = code.replace(
  "export function Login({ user, setUser, handleLogin, setRecoveryModalOpen, handleGoogleLogin }: LoginProps) {",
  "import { useState } from 'react';\nexport function Login({ user, setUser, handleLogin, setRecoveryModalOpen, handleGoogleLogin }: LoginProps) {\n  const [isRegisterMode, setIsRegisterMode] = useState(false);"
);

// Modify titles
code = code.replace(
  /<h1 className="login-title">¡Bienvenido a ChatLiz!<\/h1>\s*<p className="login-subtitle">Inicia sesión o regístrate para continuar\.<\/p>/g,
  `{isRegisterMode ? (
             <>
               <h1 className="login-title">Crea tu cuenta</h1>
               <p className="login-subtitle">Ingresa tus datos para registrarte.</p>
             </>
           ) : (
             <>
               <h1 className="login-title">¡Bienvenido a ChatLiz!</h1>
               <p className="login-subtitle">Inicia sesión para continuar.</p>
             </>
           )}`
);

// Conditionally render Email input
const emailInputHtml = `{isRegisterMode && (
                   <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                     <div className="input-icon" style={{ color: '#fbbf24' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                     </div>
                     <input 
                       className="login-input" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                       type="email" 
                       placeholder="Email (Recuperación)..." 
                       value={user.securityEmail || ''}
                       onChange={e => setUser({...user, securityEmail: e.target.value})} 
                       onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     />
                   </div>
                   )}`;

code = code.replace(
  /<div className="input-group" style=\{\{ marginBottom: '1\.5rem' \}\}>\s*<div className="input-icon" style=\{\{ color: '#fbbf24' \}\}>\s*<svg[\s\S]*?<\/svg>\s*<\/div>\s*<input\s*className="login-input" style=\{\{ borderColor: 'rgba\(251, 191, 36, 0\.3\)' \}\}\s*type="email"\s*placeholder="Email \(Recuperación\)\.\.\."\s*value=\{user\.securityEmail \|\| ''\}\s*onChange=\{e => setUser\(\{\.\.\.user, securityEmail: e\.target\.value\}\)\}\s*onKeyDown=\{e => e\.key === 'Enter' && handleLogin\(\)\}\s*\/>\s*<\/div>/g,
  emailInputHtml
);

// Modify submit button text
code = code.replace(
  /<span>ENTRAR AL CHAT<\/span>/g,
  "<span>{isRegisterMode ? 'REGISTRARSE' : 'ENTRAR AL CHAT'}</span>"
);

// Modify bottom links
const linksHtml = `           <button 
               onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); }}
              className="link-btn link-cyan"
           >
              {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : 'Crear nueva cuenta'}
           </button>`;
code = code.replace(
  /<button\s*onClick=\{handleLogin\}\s*className="link-btn link-cyan"\s*>\s*Crear nueva cuenta\s*<\/button>/g,
  linksHtml
);

fs.writeFileSync('src/components/Login.tsx', code);
