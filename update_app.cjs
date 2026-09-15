const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Disable Auto-complete for chat input
code = code.replace(
    'id="chat-input-field"',
    'id="chat-input-field"\n                            autoComplete="off"\n                            spellCheck="false"'
);

// 2. Add neonColor state and background state
const stateTarget = `  const [activeChat, setActiveChat] = useState("global");`;
const stateRep = `  const [activeChat, setActiveChat] = useState("global");
  const [neonColor, setNeonColor] = useState(() => localStorage.getItem("chatliz_neon_color") || "#00f3ff");
  const [chatBgImage, setChatBgImage] = useState(() => localStorage.getItem("chatliz_chat_bg") || "");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isRainbowNeon, setIsRainbowNeon] = useState(() => localStorage.getItem("chatliz_rainbow_neon") === "true");`;
code = code.replace(stateTarget, stateRep);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched states");
