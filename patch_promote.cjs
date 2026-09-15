const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `                            </button>
                        )}`;

const repBtn = `                            </button>
                        )}
                        {user.username.toUpperCase() === "AXISS" && selectedUserModal.role !== "admin" && selectedUserModal.username.toUpperCase() !== "AXISS" && (
                            <button
                                onClick={() => {
                                    if(confirm(\`¿Promover a \${selectedUserModal.username} como Administrador?\`)) {
                                        socket.emit("admin_promote_user", selectedUserModal.username, (res: any) => {
                                            if(res.success) {
                                                alert("Usuario promovido a Administrador.");
                                                setSelectedUserModal(null);
                                            }
                                        });
                                    }
                                }}
                                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                            >
                                PROMOVER A ADMIN
                            </button>
                        )}`;

code = code.replace(targetBtn, repBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched promote button");
