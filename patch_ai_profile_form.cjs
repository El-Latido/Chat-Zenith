const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /const \[aiProfileForm, setAiProfileForm\] = useState\(\{([^}]+)\}\);/;
const replace1 = `const [aiProfileForm, setAiProfileForm] = useState({$1, bubbleColor: "rgba(15, 17, 26, 0.9)", bubbleBorder: "border-[#D4AF37]", bubbleShape: "rounded-2xl", bubbleTexture: "none"});`;
code = code.replace(regex1, replace1);

const regex2 = /setAiProfileForm\(\{\s*profilePic: selectedUserModal\.profilePic \|\| "",\s*statusMessage: selectedUserModal\.statusMessage \|\| "Inteligencia Artificial",\s*systemInstruction: selectedUserModal\.systemInstruction \|\| "",\s*\}\);/g;
const replace2 = `setAiProfileForm({
                          profilePic: selectedUserModal.profilePic || "",
                          statusMessage: selectedUserModal.statusMessage || "Inteligencia Artificial",
                          systemInstruction: selectedUserModal.systemInstruction || "",
                          bubbleColor: selectedUserModal.bubbleColor || "rgba(15, 17, 26, 0.9)",
                          bubbleBorder: selectedUserModal.bubbleBorder || "border-[#D4AF37]",
                          bubbleShape: selectedUserModal.bubbleShape || "rounded-2xl",
                          bubbleTexture: selectedUserModal.bubbleTexture || "none",
                        });`;
code = code.replace(regex2, replace2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched AI profile form state");
