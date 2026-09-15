const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [activeChat, setActiveChat] = useState("global");`;
const stateReplacement = `  const [activeChat, setActiveChat] = useState("global");
  const [previousChat, setPreviousChat] = useState("global");`;
code = code.replace(targetState, stateReplacement);

// Hook into setActiveChat to update previousChat?
// Easier: Just replace setActiveChat(something) with logic, or just have a wrapper function.
// Let's just create a wrapper function.
const wrapper = `  const changeChat = (newChat: string) => {
    if (newChat !== activeChat) {
      setPreviousChat(activeChat);
      setActiveChat(newChat);
    }
  };`;

// Insert wrapper after previousChat
code = code.replace(stateReplacement, stateReplacement + '\n' + wrapper);

// Replace ALL setActiveChat(...) calls with changeChat(...) except the one in the wrapper and the import/destructuring
// Wait, replacing all setActiveChat might be tricky with regex. Let's just patch the ones that matter: modal chat button and back button.

// Modal Chat button
const modalBtnTarget = `                        window.history.pushState({}, "", "/chat/" + encodeURIComponent(selectedUserModal.username));
                        setActiveChat(selectedUserModal.username);`;
const modalBtnReplacement = `                        window.history.pushState({}, "", "/chat/" + encodeURIComponent(selectedUserModal.username));
                        changeChat(selectedUserModal.username);`;
code = code.replace(modalBtnTarget, modalBtnReplacement);

// Back button in private chat header
const backBtnTarget = `onClick={() => setActiveChat("global")} 
                            className="text-[#D4AF37] hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                            title="Volver a Sala Global"`;
const backBtnReplacement = `onClick={() => setActiveChat(previousChat)} 
                            className="text-[#D4AF37] hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                            title="Volver Atrás"`;
code = code.replace(backBtnTarget, backBtnReplacement);

// Add an X button inside the user profile modal for better visibility just in case.
const modalHeaderTarget = `<div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
               <button 
                 onClick={() => setSelectedUserModal(null)} 
                 className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
               >
                 <X size={20} />
               </button>
            </div>`;
const modalHeaderReplacement = `<div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
               <button 
                 onClick={() => setSelectedUserModal(null)} 
                 className="absolute top-4 right-4 bg-black/80 text-white hover:bg-red-500 p-2 rounded-full transition-all shadow-xl border border-white/20 z-50"
                 title="Cerrar Perfil"
               >
                 <X size={20} strokeWidth={3} />
               </button>
            </div>`;
code = code.replace(modalHeaderTarget, modalHeaderReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched back logic and profile X button");
