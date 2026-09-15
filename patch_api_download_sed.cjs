const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startStr = "app.get('/api/download', async (req, res) => {";
const endStr = "res.status(500).send('Error downloading file');\n    }\n  });";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const block = code.substring(startIdx, endIdx + endStr.length);
    code = code.replace(block, "");
    code = code.replace('const app = express();', 'const app = express();\n' + block);
    fs.writeFileSync('server.ts', code);
    console.log("Moved /api/download using indexOf");
} else {
    console.log("Could not find the block");
}
