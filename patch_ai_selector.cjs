const fs = require('fs');
let code = fs.readFileSync('src/components/AiSelectorModal.tsx', 'utf8');

code = code.replace(/interface AiSelectorModalProps \{/, "interface AiSelectorModalProps {\n  usersOnline?: any[];");

code = code.replace(/export function AiSelectorModal\(\{ onClose, onSelect, userCoins, socket \}: AiSelectorModalProps\) \{/, "export function AiSelectorModal({ onClose, onSelect, userCoins, socket, usersOnline = [] }: AiSelectorModalProps) {");

code = code.replace(/\{Object\.values\(AI_CHARACTERS\)\.map\(\(char\) => \(/, "{Object.values(AI_CHARACTERS).map((char) => {\n            const dynamicAi = usersOnline.find(u => u.username === char.id);\n            return (");

code = code.replace(/src=\{char\.avatar\}/, "src={dynamicAi?.profilePic || char.avatar}");
code = code.replace(/<p className=\"text-xs text-indigo-200 mt-1 line-clamp-2\">\{char\.description\}<\/p>/, '<p className="text-xs text-indigo-200 mt-1 line-clamp-2">{dynamicAi?.statusMessage || char.description}</p>');
code = code.replace(/<h3 className="font-bold text-lg text-white">\{char\.name\}<\/h3>/, '<h3 className="font-bold text-lg text-white">{dynamicAi?.username || char.name}</h3>');

// Don't forget to close the bracket
code = code.replace(/<\/button>\n\s*\)\)}/, "</button>\n            );})}");

fs.writeFileSync('src/components/AiSelectorModal.tsx', code);
console.log("Patched AiSelectorModal");
