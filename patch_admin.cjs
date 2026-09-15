const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSdk = `            <div className="px-4 mt-2">
              <button
                className={\`w-full flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border \${isMonetizationOpen ? "border-green-500/50" : "border-green-500/20"} px-3 py-2 rounded-2xl hover:bg-green-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_monetization_stats", (stats: any) => setMonetizationStats(stats));
                  setIsMonetizationOpen(!isMonetizationOpen);
                }}
              >
                <DollarSign size={16} strokeWidth={1.5} />
                Ingresos SDK
              </button>
            </div>
            </>
          )}`;

const repSdk = `            </>
          )}
          {user?.username?.toUpperCase() === "AXISS" && (
            <div className="px-4 mt-2">
              <button
                className={\`w-full flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border \${isMonetizationOpen ? "border-green-500/50" : "border-green-500/20"} px-3 py-2 rounded-2xl hover:bg-green-500/20 transition-all text-sm font-medium\`}
                onClick={() => {
                  closeAllModals();
                  socket.emit("get_monetization_stats", (stats: any) => setMonetizationStats(stats));
                  setIsMonetizationOpen(!isMonetizationOpen);
                }}
              >
                <DollarSign size={16} strokeWidth={1.5} />
                Ingresos SDK
              </button>
            </div>
          )}`;

code = code.replace(targetSdk, repSdk);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched admin visibility");
