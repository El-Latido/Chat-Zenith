import React, { useState, useEffect } from 'react';
import { Bot, X, CheckCircle } from 'lucide-react';
import { socket } from '../socket';

interface AdminConfigAiModalProps {
  aiUsername: string;
  setAdminConfigAiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiProfileForm: { profilePic: string; statusMessage: string; systemInstruction?: string; username?: string; bubbleColor?: string; bubbleBorder?: string; bubbleShape?: string; bubbleTexture?: string; };
  setAiProfileForm: React.Dispatch<React.SetStateAction<{ profilePic: string; statusMessage: string; systemInstruction: string; username?: string; bubbleColor?: string; bubbleBorder?: string; bubbleShape?: string; bubbleTexture?: string; }>>;
}

export function AdminConfigAiModal({ setAdminConfigAiOpen, aiProfileForm, setAiProfileForm, aiUsername }: AdminConfigAiModalProps) {
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
     if (successMsg) {
        const timer = setTimeout(() => {
           setSuccessMsg('');
           setAdminConfigAiOpen(false);
        }, 3000);
        return () => clearTimeout(timer);
     }
  }, [successMsg, setAdminConfigAiOpen]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
       <div className="bg-[#12141c] p-6 lg:p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-fuchsia-500/20 max-h-[90vh] overflow-y-auto scrollbar-thin">
         <button onClick={() => setAdminConfigAiOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={20} />
         </button>
         <h2 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2 mb-6">
            <Bot size={22} />
            Configurar {aiUsername}
         </h2>

         {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 font-medium">
               <CheckCircle size={20} />
               <p className="text-sm">{successMsg}</p>
            </div>
         )}

         <div className="space-y-4">
           <div className="bg-[#1a1b26] p-4 rounded-xl border border-white/5 mb-6">
              <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">Asignar Rol de DJ</h3>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 const target = (e.target as any).djTarget.value;
                 const start = (e.target as any).djStart.value;
                 const end = (e.target as any).djEnd.value;
                 if (target && start && end) {
                    socket.emit('admin_set_dj_schedule', { targetUser: target, schedule: { start, end } });
                    (e.target as any).reset();
                 }
              }} className="flex flex-col gap-3">
                 <input name="djTarget" type="text" placeholder="Nombre de usuario" className="w-full bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                 <div className="flex gap-2">
                    <input name="djStart" type="time" className="flex-1 bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                    <span className="text-gray-500 self-center">-</span>
                    <input name="djEnd" type="time" className="flex-1 bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                 </div>
                 <button type="submit" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-medium py-2 rounded-lg text-sm transition-colors border border-cyan-500/30">
                    Asignar DJ
                 </button>
              </form>
           </div>
           
           <div className="bg-[#1a1b26] p-4 rounded-xl border border-red-500/20 mb-6">
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">Control de Emergencia</h3>
              <button 
                 onClick={() => {
                     socket.emit('admin_cut_transmission');
                     setSuccessMsg('Transmisión de DJ cortada exitosamente.');
                 }}
                 className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold py-2 rounded-lg text-sm transition-colors border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                 Cortar Transmisión DJ Activa
              </button>
           </div>

           <p className="text-sm text-gray-400 leading-relaxed mb-4">
             Como administrador (Axiss), puedes modificar el perfil de la IA.
           </p>
           
           <div className="flex flex-col items-center mb-6">
             <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                <div className="w-28 h-28 rounded-full border border-cyan-400/50 p-1 relative z-10 bg-[#0a0a16] shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center overflow-hidden [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]">
                   {aiProfileForm.profilePic ? (
                      <img referrerPolicy="no-referrer" src={aiProfileForm.profilePic} alt="avatar" className="w-full h-full object-cover rounded-full" />
                   ) : (
                      <Bot size={40} className="text-cyan-400" />
                   )}
                   <input type="file" title="Subir foto de perfil IA" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const MAX_SIZE = 400;

                            if (width > height) {
                              if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              }
                            } else {
                              if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', profilePic: dataUrl});
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                   }} />
                </div>
             </div>
             <span className="text-xs text-gray-500 mt-3 font-semibold uppercase tracking-wider">Haz clic para cambiar foto</span>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-400">Estado / Información</label>
             <input 
                value={aiProfileForm.statusMessage || ''}
                onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: aiProfileForm.systemInstruction || '', statusMessage: e.target.value})}
                maxLength={60}
                placeholder="Ej: IA Asistente virtual"
                type="text"
                className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white" 
             />
           </div>

           <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-400">Instrucciones de Identidad (system_instruction)</label>
             <textarea 
                value={aiProfileForm.systemInstruction || ''}
                onChange={e => setAiProfileForm({...aiProfileForm, systemInstruction: e.target.value})}
                placeholder="Ej: A partir de ahora hablarás solo en rimas..."
                rows={4}
                className="w-full bg-[#0a0a16] p-3 rounded-xl border border-white/10 outline-none focus:border-fuchsia-500 transition-all text-white text-sm resize-none scrollbar-thin" 
             />
           </div>

           <button 
             onClick={() => {
               
      let callbackCalled = false;
      const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
              setSuccessMsg('Guardado localmente (Timeout del servidor)');
          }
      }, 4000);

      socket.emit("update_ai_config", { aiUsername, profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction, bubbleColor: aiProfileForm.bubbleColor, bubbleBorder: aiProfileForm.bubbleBorder, bubbleShape: aiProfileForm.bubbleShape, bubbleTexture: aiProfileForm.bubbleTexture }, (res: any) => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          if (res.success || res.success === undefined) {
              setSuccessMsg(`¡Perfil de ${aiUsername} actualizado con éxito!`);
          } else {
              alert("Error: " + res.error);
          }
      });
             }}
             className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-3 rounded-xl font-bold transition-colors shadow-[0_4px_14px_rgba(217,70,239,0.3)]"
            >
              Guardar Perfil IA
            </button>
         </div>
       </div>
    </div>
  );
}
