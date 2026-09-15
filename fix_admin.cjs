const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `{user?.role === "admin" && (
            <div className="px-4 mt-2 grid grid-cols-2 gap-2">
              <button`;
const replace = `{(user?.role === "admin" || user?.username?.toUpperCase() === "AXISS") && (
            <div className="px-4 mt-2 grid grid-cols-2 gap-2">
              <button`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed admin panel visibility in App.tsx");
} else {
    console.log("Could not find the admin check pattern.");
}
