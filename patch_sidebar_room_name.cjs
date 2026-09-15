const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `              <div className="flex items-center gap-2">
                <Hash size={18} />
                Salas Creadas
              </div>`;

const replacement = `              <div className="flex items-center gap-2">
                <Hash size={18} />
                Crear Sala
              </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
