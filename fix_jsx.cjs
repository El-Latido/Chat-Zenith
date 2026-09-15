const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `          {(user?.role === "admin" || user?.username?.toUpperCase() === "AXISS") && (
            <div className="px-4 mt-2 grid grid-cols-2 gap-2">`;
const replace = `          {(user?.role === "admin" || user?.username?.toUpperCase() === "AXISS") && (
            <>
            <div className="px-4 mt-2 grid grid-cols-2 gap-2">`;
code = code.replace(search, replace);

const searchEnd = `                Ingresos SDK
              </button>
            </div>
          )}`;
const replaceEnd = `                Ingresos SDK
              </button>
            </div>
            </>
          )}`;
code = code.replace(searchEnd, replaceEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed JSX wrapper");
