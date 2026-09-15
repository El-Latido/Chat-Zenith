const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(
  "handleLogin: (e?: React.FormEvent) => void;",
  "handleLogin: (e?: React.FormEvent) => void;\n  handleGoogleLogin?: () => void;"
);

code = code.replace(
  "export function Login({ user, setUser, handleLogin, setRecoveryModalOpen }: LoginProps) {",
  "export function Login({ user, setUser, handleLogin, setRecoveryModalOpen, handleGoogleLogin }: LoginProps) {"
);

const googleButtonHtml = `
                   {/* Botón ENTRAR AL CHAT */}
                   <button 
                     onClick={handleLogin}
                     className="btn-submit"
                   >
                      <span>ENTRAR AL CHAT</span>
                   </button>
                   
                   <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                      <span style={{ margin: '0 10px', color: '#9ca3af', fontSize: '0.8rem' }}>O INTENTA CON</span>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                   </div>

                   <button 
                     type="button"
                     onClick={handleGoogleLogin}
                     className="btn-google"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '8px' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      <span>Iniciar sesión con Google</span>
                   </button>
`;

code = code.replace(
  /<button\s+onClick=\{handleLogin\}\s+className="btn-submit"\s*>\s*<span>ENTRAR AL CHAT<\/span>\s*<\/button>/,
  googleButtonHtml
);

const googleBtnStyle = `
        .btn-google {
          position: relative;
          width: 100%;
          padding: 0.875rem;
          margin-top: 1rem;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.9375rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .btn-google:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }
`;

code = code.replace("</style>", googleBtnStyle + "</style>");

fs.writeFileSync('src/components/Login.tsx', code);
