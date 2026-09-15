const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(`            })}
          </div>
          </div>
        </aside>`, `            })}
          </div>
        </aside>`);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed extra div");
