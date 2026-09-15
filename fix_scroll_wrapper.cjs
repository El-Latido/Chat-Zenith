const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            <p className="text-[#8B98B0] text-xs">Conectado(a)</p>
          </div>
          <div className="px-4 mt-2">`;

const replacement = `            <p className="text-[#8B98B0] text-xs">Conectado(a)</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
          <div className="px-4 mt-2">`;

code = code.replace(target, replacement);

const targetEnd = `            })}
          </div>
        </aside>`;

const replacementEnd = `            })}
          </div>
          </div>
        </aside>`;

code = code.replace(targetEnd, replacementEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Added wrapper properly");
