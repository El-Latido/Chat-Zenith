const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const dictDef = `
  const DICT: Record<string, Record<string, string>> = {
    es: { chatGlobal: "Chat Global", online: "En línea", type: "Escribe un mensaje...", send: "Enviar", friends: "Amigos", settings: "Ajustes", search: "Buscar...", profile: "Perfil", unread: "Nuevos" },
    en: { chatGlobal: "Global Chat", online: "Online", type: "Type a message...", send: "Send", friends: "Friends", settings: "Settings", search: "Search...", profile: "Profile", unread: "New" },
    pt: { chatGlobal: "Chat Global", online: "Online", type: "Digite uma mensagem...", send: "Enviar", friends: "Amigos", settings: "Configurações", search: "Procurar...", profile: "Perfil", unread: "Novo" },
    fr: { chatGlobal: "Chat Mondial", online: "En ligne", type: "Tapez un message...", send: "Envoyer", friends: "Amis", settings: "Paramètres", search: "Rechercher...", profile: "Profil", unread: "Nouveau" },
    de: { chatGlobal: "Globaler Chat", online: "Online", type: "Nachricht eingeben...", send: "Senden", friends: "Freunde", settings: "Einstellungen", search: "Suchen...", profile: "Profil", unread: "Neu" },
    it: { chatGlobal: "Chat Globale", online: "In linea", type: "Scrivi un messaggio...", send: "Invia", friends: "Amici", settings: "Impostazioni", search: "Cerca...", profile: "Profil", unread: "Nuovo" }
  };
  const t = (key: string) => {
     const lang = user.pais_idioma || 'es';
     return DICT[lang]?.[key] || DICT['es'][key] || key;
  };
`;
if (!appCode.includes('const DICT')) {
    appCode = appCode.replace(/const \[messages, setMessages\] = useState<any\[\]>\(\[\]\);/, dictDef + "\n  const [messages, setMessages] = useState<any[]>([]);");
    fs.writeFileSync('src/App.tsx', appCode);
    console.log("Fixed App.tsx t definition");
}

// Fix ProfileConfigModal.tsx
let profileCode = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');
// Increase z-index and ensure scrolling works inside modal content
profileCode = profileCode.replace(/className="fixed inset-0 z-50 flex items-center justify-center p-4"/g, 'className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"');
// Backdrop block pointer events below
profileCode = profileCode.replace(/className="absolute inset-0 bg-black\/70 backdrop-blur-md transition-opacity"/g, 'className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity pointer-events-auto"');
fs.writeFileSync('src/components/ProfileConfigModal.tsx', profileCode);
console.log("Fixed ProfileConfigModal z-index and backdrop");
