const fs = require('fs');
let code = fs.readFileSync('src/components/RecoveryModal.tsx', 'utf8');

if (!code.includes("recoveryEmail")) {
  code = code.replace(
    "recoveryUsername: string;",
    "recoveryUsername: string;\n  recoveryEmail?: string;\n  setRecoveryEmail?: React.Dispatch<React.SetStateAction<string>>;"
  );

  code = code.replace(
    "recoveryUsername, setRecoveryUsername,",
    "recoveryUsername, setRecoveryUsername,\n  recoveryEmail, setRecoveryEmail,"
  );

  const newStep1Html = `<div className="space-y-4">
                <p className="text-sm text-gray-400">Ingresa tu usuario y correo de recuperación.</p>
                <input className="w-full p-3 text-white transition-all border outline-none bg-white/5 rounded-xl border-white/10 focus:border-cyan-500" placeholder="Usuario" value={recoveryUsername} onChange={e => setRecoveryUsername(e.target.value)} />
                {setRecoveryEmail && (
                   <input className="w-full p-3 text-white transition-all border outline-none bg-white/5 rounded-xl border-white/10 focus:border-cyan-500" type="email" placeholder="Correo electrónico" value={recoveryEmail || ''} onChange={e => setRecoveryEmail(e.target.value)} />
                )}
                <button 
                   onClick={() => {
                      if (!recoveryUsername || !recoveryEmail) {
                          alert("Por favor ingresa tu usuario y correo electrónico.");
                          return;
                      }
                      socket.emit('forgot_password_request', { username: recoveryUsername, email: recoveryEmail }, (res: any) => {
                         if (res.success) {
                            alert("Código de recuperación enviado a tu correo electrónico asociado.");
                            setRecoveryStep(2);
                         } else {
                            alert(res.error);
                         }
                      });
                   }}
                   className="w-full p-3 font-bold text-white transition-all shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:shadow-cyan-500/50"
                >
                   Enviar Código
                </button>
             </div>`;

  code = code.replace(
    /<div className="space-y-4">\s*<p className="text-sm text-gray-400">Ingresa tu usuario para solicitar un código de recuperación\.<\/p>[\s\S]*?<\/button>\s*<\/div>/,
    newStep1Html
  );
  fs.writeFileSync('src/components/RecoveryModal.tsx', code);
}
