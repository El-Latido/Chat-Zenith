const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There are two places where reactions are rendered, one in global, one in private.
// We should find {Object.entries(m.reactions).map(([emoji, count]: any) => (
// and replace it with {Object.entries(m.reactions).map(([emoji, users]: any) => ( ... {users.length} ... ))

const search1 = `{Object.entries(m.reactions).map(([emoji, count]: any) => (
                                        <span
                                          key={emoji}
                                          className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full text-white"
                                        >
                                          {emoji} {count}
                                        </span>
                                      ))}`;

const replace1 = `{Object.entries(m.reactions).map(([emoji, users]: any) => (
                                        <div
                                          key={emoji}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const userList = Array.isArray(users) ? users : Array(users).fill("Usuario anónimo");
                                            alert(\`Reacciones \${emoji}: \\n\${userList.join(", ")}\`);
                                          }}
                                          className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full text-white cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1"
                                          title={Array.isArray(users) ? users.join(", ") : ""}
                                        >
                                          {emoji} {Array.isArray(users) ? users.length : users}
                                        </div>
                                      ))}`;

code = code.replace(search1, replace1);

const search2 = `{Object.entries(m.reactions).map(([emoji, count]: any) => (
                                        <span
                                          key={emoji}
                                          className="bg-black/10 text-xs px-1.5 py-0.5 rounded-full text-black"
                                        >
                                          {emoji} {count}
                                        </span>
                                      ))}`;

const replace2 = `{Object.entries(m.reactions).map(([emoji, users]: any) => (
                                        <div
                                          key={emoji}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const userList = Array.isArray(users) ? users : Array(users).fill("Usuario anónimo");
                                            alert(\`Reacciones \${emoji}: \\n\${userList.join(", ")}\`);
                                          }}
                                          className="bg-black/10 text-xs px-1.5 py-0.5 rounded-full text-black cursor-pointer hover:bg-black/20 transition-colors flex items-center gap-1"
                                          title={Array.isArray(users) ? users.join(", ") : ""}
                                        >
                                          {emoji} {Array.isArray(users) ? users.length : users}
                                        </div>
                                      ))}`;

code = code.replace(search2, replace2);

fs.writeFileSync('src/App.tsx', code);
