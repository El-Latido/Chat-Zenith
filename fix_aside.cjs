const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            })}
          </div>
        {/* Main Chat Container */}`;

const replacement = `            })}
          </div>
        </aside>
        {/* Main Chat Container */}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Restored aside");
