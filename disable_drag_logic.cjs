const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace onPieceDrop with one that just returns false
    const regex = /function onPieceDrop\([\s\S]*?return false;\n  \}/g;
    const newFunc = `function onPieceDrop(sourceSquare: string, targetSquare: string) {
    // Return false to prevent dragging to move, enforcing tap-to-move
    return false;
  }`;
    
    code = code.replace(regex, newFunc);
    fs.writeFileSync(filePath, code);
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
