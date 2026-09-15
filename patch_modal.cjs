const fs = require('fs');
let code = fs.readFileSync('src/components/AdminConfigLizModal.tsx', 'utf8');

code = code.replace(/AdminConfigLizModalProps/g, 'AdminConfigAiModalProps');
code = code.replace(/setAdminConfigLizOpen/g, 'setAdminConfigAiOpen');
code = code.replace(/AdminConfigLizModal/g, 'AdminConfigAiModal');

// Add aiUsername to props
code = code.replace(
  /export function AdminConfigAiModal\(\{\s*setAdminConfigAiOpen,\s*aiProfileForm,\s*setAiProfileForm\s*\}\: AdminConfigAiModalProps\) \{/,
  'export function AdminConfigAiModal({ setAdminConfigAiOpen, aiProfileForm, setAiProfileForm, aiUsername }: AdminConfigAiModalProps) {'
);
code = code.replace(
  /interface AdminConfigAiModalProps \{/,
  'interface AdminConfigAiModalProps {\\n  aiUsername: string;'
);

// Add aiUsername to emit
code = code.replace(
  /socket\.emit\('update_ai_config', \{ profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction \}/,
  'socket.emit("update_ai_config", { aiUsername, profilePic: aiProfileForm.profilePic, statusMessage: aiProfileForm.statusMessage, systemInstruction: aiProfileForm.systemInstruction })'
);

// Replace visual text
code = code.replace(/Perfil de ELIZABETH/g, 'Perfil de {aiUsername}');
code = code.replace(/Configuración de ELIZABETH/g, 'Configuración de {aiUsername}');

fs.writeFileSync('src/components/AdminConfigAiModal.tsx', code);
// Remove the old one
fs.unlinkSync('src/components/AdminConfigLizModal.tsx');
console.log("Patched modal");
