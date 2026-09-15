const fs = require('fs');
let code = fs.readFileSync('src/components/AiSelectorModal.tsx', 'utf8');

code = code.replace(/\{Object\.values\(AI_CHARACTERS\)\.map\(\(char\) => \(/, "{Object.values(AI_CHARACTERS).map((char) => {\n            const dynamicAi = usersOnline.find(u => u.username === char.id);\n            return (");

code = code.replace(/src=\{char\.avatar\}/, "src={dynamicAi?.profilePic || char.avatar}");
code = code.replace(/<p className=\"text-gray-300 text-sm flex-1\">\{char\.description\}<\/p>/, '<p className="text-gray-300 text-sm flex-1">{dynamicAi?.statusMessage || char.description}</p>');
code = code.replace(/<h3 className=\"text-\[\#E8D9B0\] font-bold text-lg\">\{char\.name\}<\/h3>/, '<h3 className="text-[#E8D9B0] font-bold text-lg">{dynamicAi?.username || char.name}</h3>');

// Don't forget to close the bracket
code = code.replace(/<\/button>\n\s*<\/div>\n\s*\)\)}/, "</button>\n                  </div>\n                );})}");

fs.writeFileSync('src/components/AiSelectorModal.tsx', code);
console.log("Patched AiSelectorModal");
