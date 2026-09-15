const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const stateMatch = `  const [activeTab, setActiveTab] = useState<'perfil' | 'apariencia' | 'idioma' | 'cuenta'>('perfil');`;
const stateReplace = `  const [activeTab, setActiveTab] = useState<'perfil' | 'apariencia' | 'idioma' | 'cuenta'>('perfil');
  const [incognito, setIncognito] = useState((user as any).incognito || false);`;

code = code.replace(stateMatch, stateReplace);

const saveMatch = `  const handleSaveProfile = async () => {`;
const saveReplace = `
  const toggleIncognito = () => {
     const nextVal = !incognito;
     setIncognito(nextVal);
     import('../socket').then(({ socket }) => {
         socket.emit("update_incognito", nextVal);
     });
  };

  const handleSaveProfile = async () => {`;

code = code.replace(saveMatch, saveReplace);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Fixed incognito state in ProfileConfigModal.tsx");
