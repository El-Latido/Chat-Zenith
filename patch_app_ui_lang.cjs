const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert dictionary near the top of App component
const dictionaryRegex = /const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\);/;
const uiDict = `
  const DICT: Record<string, Record<string, string>> = {
    es: { chatGlobal: "Chat Global", online: "En línea", type: "Escribe un mensaje...", send: "Enviar", friends: "Amigos", settings: "Ajustes", search: "Buscar...", profile: "Perfil", unread: "Nuevos" },
    en: { chatGlobal: "Global Chat", online: "Online", type: "Type a message...", send: "Send", friends: "Friends", settings: "Settings", search: "Search...", profile: "Profile", unread: "New" },
    pt: { chatGlobal: "Chat Global", online: "Online", type: "Digite uma mensagem...", send: "Enviar", friends: "Amigos", settings: "Configurações", search: "Procurar...", profile: "Perfil", unread: "Novo" },
    fr: { chatGlobal: "Chat Mondial", online: "En ligne", type: "Tapez un message...", send: "Envoyer", friends: "Amis", settings: "Paramètres", search: "Rechercher...", profile: "Profil", unread: "Nouveau" },
    de: { chatGlobal: "Globaler Chat", online: "Online", type: "Nachricht eingeben...", send: "Senden", friends: "Freunde", settings: "Einstellungen", search: "Suchen...", profile: "Profil", unread: "Neu" },
    it: { chatGlobal: "Chat Globale", online: "In linea", type: "Scrivi un messaggio...", send: "Invia", friends: "Amici", settings: "Impostazioni", search: "Cerca...", profile: "Profilo", unread: "Nuovo" }
  };
  const t = (key: string) => {
     const lang = user.pais_idioma || 'es';
     return DICT[lang]?.[key] || DICT['es'][key] || key;
  };
`;

code = code.replace(dictionaryRegex, uiDict + "\n  const [messages, setMessages] = useState<Message[]>([]);");

// Replace some hardcoded UI strings with t(...)
code = code.replace(/>Chat Global</g, ">{t('chatGlobal')}<");
code = code.replace(/placeholder="Escribe un mensaje..."/g, "placeholder={t('type')}");
code = code.replace(/>En línea</g, ">{t('online')}<");
code = code.replace(/>Amigos</g, ">{t('friends')}<");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched UI language");
