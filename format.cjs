const fs = require('fs');
let code = fs.readFileSync('src/components/RecoveryModal.tsx', 'utf8');
// Just use a completely new file
fs.writeFileSync('src/components/RecoveryModal.tsx', `import React from 'react';
import { X } from 'lucide-react';
import { socket } from '../socket';

interface RecoveryModalProps {
  recoveryStep: number;
  setRecoveryStep: React.Dispatch<React.SetStateAction<number>>;
  recoveryUsername: string;
  setRecoveryUsername: React.Dispatch<React.SetStateAction<string>>;
  recoveryCodeStr: string;
  setRecoveryCodeStr: React.Dispatch<React.SetStateAction<string>>;
  inputRecoveryCode: string;
  setInputRecoveryCode: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setRecoveryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function RecoveryModal({
  recoveryStep, setRecoveryStep,
  recoveryUsername, setRecoveryUsername,
  recoveryCodeStr, setRecoveryCodeStr,
  inputRecoveryCode, setInputRecoveryCode,
  newPassword, setNewPassword,
  setRecoveryModalOpen
}: RecoveryModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
       <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/10 w-full max-w-sm relative">
          <button onClick={() => { setRecoveryModalOpen(false); setRecoveryStep(1); }} className="absolute text-gray-500 top-4 right-4 hover:text-white">
             <X size={20} />
          </button>
          <h3 className="mb-4 text-xl font-bold text-center text-white">Recuperar Contraseña</h3>
          
          {recoveryStep === 1 && (
             <div className="space-y-4">
                <p className="text-sm text-gray-400">Ingresa tu usuario para solicitar un código de recuperación.</p>
                <input className="w-full p-3 text-white transition-all border outline-none bg-white/5 rounded-xl border-white/10 focus:border-cyan-500" placeholder="Usuario" value={recoveryUsername} onChange={e => setRecoveryUsername(e.target.value)} />
                <button
                    onClick={() => {
                      if (!recoveryUsername) return;
                      socket.emit('forgot_password_request', recoveryUsername, (res: any) => {
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
             </div>
          )}

          {recoveryStep === 2 && (
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
          )}
       </div>
    </div>
  );
}
`);
