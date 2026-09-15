const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const search = `  profileLikes?: number;
}`;
const replace = `  profileLikes?: number;
  profileComments?: { author: string, text: string, timestamp: number }[];
}`;

code = code.replace(search, replace);
fs.writeFileSync('src/types.ts', code);
