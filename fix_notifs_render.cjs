const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300">
                        {n}
                      </div>
                    ))
                  )}`;

const replace = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-gray-300">
                        {typeof n === 'string' ? n : n.text || 'Notificación'}
                      </div>
                    ))
                  )}`;

code = code.replace(search, replace);

fs.writeFileSync('src/App.tsx', code);
