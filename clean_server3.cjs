const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let skip = false;
let out = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tutiFruttiState')) {
    // If we see tutiFruttiState, we probably shouldn't include this line.
    // However, what if it's a bracket?
  }
}
