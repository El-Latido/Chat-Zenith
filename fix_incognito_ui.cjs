const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const anchor = `</button>
                  </div>
                </div>`;

const incognitoBlock = `</button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 \${incognito ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-black/40"}\`}>
                            <EyeOff size={24} className={\`transition-all duration-300 \${incognito ? "text-white" : "text-gray-500"}\`} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Modo Incógnito (Espía)</h4>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Desapareces de la lista, solo puedes usar chat privado.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={incognito} onChange={toggleIncognito} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                </div>
`;

code = code.replace(anchor, incognitoBlock);

// Also missing the EyeOff import since it probably failed.
if(!code.includes('EyeOff')) {
  code = code.replace(/import \{ X, User/, 'import { EyeOff, X, User');
}

// Ensure the incognito state and toggle are there
if(!code.includes('const [incognito, setIncognito]')) {
  code = code.replace(/const \[statusMessage, setStatusMessage\] = useState\(user\.statusMessage \|\| ""\);/, 'const [statusMessage, setStatusMessage] = useState(user.statusMessage || "");\n  const [incognito, setIncognito] = useState(user.incognito || false);');
  
  const saveFunction = `const handleSave = () => {`;
  const saveReplacement = `
    const toggleIncognito = () => {
       const nextVal = !incognito;
       setIncognito(nextVal);
       socket.emit("update_incognito", nextVal);
    };
    const handleSave = () => {`;
  code = code.replace(saveFunction, saveReplacement);
}

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Fixed Incognito UI");
