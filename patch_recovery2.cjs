const fs = require('fs');

let content = fs.readFileSync('src/components/RecoveryModal.tsx', 'utf8');

const regexStep1 = /socket\.emit\('forgot_password_request', recoveryUsername, \(res: any\) => \{[\s\S]*?\}\);/;
const replaceStep1 = `socket.emit('forgot_password_request', recoveryUsername, (res: any) => {
                         if (res.success) {
                            alert("Código de recuperación enviado a tu correo electrónico asociado.");
                            setRecoveryStep(2);
                         } else {
                            alert(res.error);
                         }
                      });`;

content = content.replace(regexStep1, replaceStep1);


const regexStep2 = /\{recoveryStep === 2 && \([\s\S]*?\}\s*\)\}/;
const replaceStep2 = `{recoveryStep === 2 && (
             <div className="space-y-4">
                <p className="text-sm text-gray-400">Revisa tu correo electrónico (bandeja de entrada o spam). Ingresa el código recibido de 6 dígitos.</p>
                <input className="w-full p-3 text-white transition-all border outline-none bg-white/5 rounded-xl border-white/10 focus:border-cyan-500" placeholder="Ingresa el código" value={inputRecoveryCode} onChange={e => setInputRecoveryCode(e.target.value.trim().toUpperCase())} />
                
                <p className="text-sm text-gray-400 mt-2">Ingresa tu nueva contraseña para cambiarla.</p>
                <input type="password" className="w-full p-3 text-white transition-all border outline-none bg-white/5 rounded-xl border-white/10 focus:border-cyan-500" placeholder="Nueva Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                
                <button
                    onClick={() => {
                      if (!newPassword || !inputRecoveryCode) {
                         alert("Por favor llena ambos campos.");
                         return;
                      }
                      socket.emit('forgot_password_reset', { username: recoveryUsername, newPassword, code: inputRecoveryCode }, (res: any) => {
                         if (res.success) {
                            alert("Contraseña actualizada exitosamente.");
                            setRecoveryModalOpen(false);
                            setRecoveryStep(1);
                         } else {
                            alert(res.error);
                         }
                      });
                   }}
                   className="w-full p-3 font-bold text-white transition-all shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:shadow-cyan-500/50"
                >
                   Verificar y Cambiar
                </button>
             </div>
          )}`;

content = content.replace(regexStep2, replaceStep2);

const regexStep3 = /\{recoveryStep === 3 && \([\s\S]*?\}\s*\)\}/;
content = content.replace(regexStep3, '');

fs.writeFileSync('src/components/RecoveryModal.tsx', content);
