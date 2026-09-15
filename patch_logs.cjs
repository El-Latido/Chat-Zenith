const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const logPatch = `
const fsLog = require('fs');
const originalConsoleError = console.error;
console.error = (...args) => {
    fsLog.appendFileSync('server_error.log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\\n');
    originalConsoleError(...args);
};
`;

if (!code.includes('server_error.log')) {
    code = code.replace(/import express from "express";/, "import express from 'express';\n" + logPatch);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with file logging");
}
