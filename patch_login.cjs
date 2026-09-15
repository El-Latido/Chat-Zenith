const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// I will just replace the whole return block and styling.
const newRender = `  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0B0C] relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {isRegisterMode ? 'Crear cuenta' : 'ChatLiz'}
          </h1>
          <p className="text-white/50 text-sm">
            {isRegisterMode ? 'Únete a nuestra comunidad' : 'Inicia sesión para continuar'}
          </p>
        </div>

        <div className="bg-[#121316]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <User size={18} />
              </div>
              <input
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                placeholder="Nombre de usuario"
                value={user.username}
                onChange={e => setUser({...user, username: e.target.value})}
              />
            </div>

            {isRegisterMode && (
              <div className="relative animate-in fade-in slide-in-from-top-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                  type="email"
                  placeholder="Email de recuperación"
                  value={user.securityEmail || ''}
                  onChange={e => setUser({...user, securityEmail: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
              <input
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={user.password}
                onChange={e => setUser({...user, password: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-white text-black font-semibold rounded-2xl py-3.5 mt-2 hover:bg-white/90 transition-all active:scale-[0.98] text-sm"
            >
              {isRegisterMode ? 'Registrarse' : 'Entrar'}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-white/30 text-xs font-medium uppercase tracking-wider">O</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-6 bg-white/5 border border-white/10 text-white rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); }}
            className="text-white/50 hover:text-white text-sm font-medium transition-colors"
          >
            {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : 'Crear nueva cuenta'}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setRecoveryModalOpen(true); }}
            className="text-white/30 hover:text-white/80 text-xs transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
`;

const startIndex = code.indexOf('return (');
code = code.substring(0, startIndex) + newRender;

fs.writeFileSync('src/components/Login.tsx', code);
console.log("Patched login screen");
