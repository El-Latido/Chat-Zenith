const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const overlayCode = `
    {reactionMenuId && (
        <div className="fixed inset-0 z-40" onPointerDown={() => setReactionMenuId(null)}></div>
    )}
`;

code = code.replace("{/* Chat Feed */}", overlayCode + "\n{/* Chat Feed */}");
fs.writeFileSync('src/App.tsx', code);
