const fs = require('fs');

let brokenCode = fs.readFileSync('/tmp/server.ts.broken', 'utf8');
let lines = brokenCode.split('\n');
let fixedLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    fixedLines.push(line);
    
    // Check if we need to close a block
    if (line.match(/^\s*socket\.on\(/)) {
        // Look ahead for the next socket.on or if block
        let closed = false;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].match(/^\s*socket\.on\(/) || lines[j].match(/^\s*if \(\s*process\.env\.NODE_ENV/)) {
                // Before this next block, there should be a `});`
                // Let's see if the lines right before `j` look like they close the block
                let k = j - 1;
                while (k > i && lines[k].trim() === '') k--;
                if (lines[k] && !lines[k].includes('});')) {
                    // We found a missing close
                    lines.splice(j, 0, '    });');
                }
                break;
            }
        }
    }
}

// Ensure the final block closes properly
let hasFinalClose = false;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('});')) {
        hasFinalClose = true;
        break;
    }
}
if (!hasFinalClose) {
    // Attempt to close io.on
}

fs.writeFileSync('server.ts', lines.join('\n'));
