const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const renderSearch = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const isString = typeof n === 'string';
                      const text = isString ? n : n.text || 'Notificación';
                      const fromUser = !isString ? n.fromUser : null;
                      const type = !isString ? n.type : 'system';`;
                      
const renderReplace = `{notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const isString = typeof n === 'string';
                      const text = isString ? n : n.text || 'Notificación';
                      const fromUser = !isString ? (n.fromUser || n.senderName) : null;
                      const type = !isString ? (n.type === 'MESSAGE' ? 'private_message' : (n.type === 'LIKE' ? 'like' : n.type)) : 'system';`;

code = code.replace(renderSearch, renderReplace);
fs.writeFileSync('src/App.tsx', code);
