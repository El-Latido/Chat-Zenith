const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const replacement = `  ownedDecorations?: string[];
  elo?: number;
  uid?: string;
  profileLikes?: number;
  profileComments?: { author: string, text: string, timestamp: number }[];
  bubbleColor?: string;
  bubbleBorder?: string;
  bubbleShape?: string;
  bubbleTexture?: string;
}`;

code = code.replace(/ownedDecorations\?: string\[\];[\s\S]*?profileComments\?:.*?\[\];\s*\}/, replacement);
fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
