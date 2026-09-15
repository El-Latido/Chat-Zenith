const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const reportButton = `
                {selectedUserModal.username !== user.username && (
                    <button
                      onClick={() => setReportTarget(selectedUserModal.username)}
                      className="text-xs text-gray-500 hover:text-red-400 mt-4 underline decoration-dotted underline-offset-4"
                    >
                      Reportar Usuario
                    </button>
                )}
`;

const deleteButton = `
                {selectedUserModal.username !== user.username && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <button
                          onClick={() => setReportTarget(selectedUserModal.username)}
                          className="text-xs text-gray-500 hover:text-red-400 underline decoration-dotted underline-offset-4"
                        >
                          Reportar Usuario
                        </button>
                        {(user.role === "admin" || user.username.toUpperCase() === "AXISS") && (
                            <button
                                onClick={() => {
                                    if(confirm(\`¿Estás seguro de que quieres eliminar la cuenta de \${selectedUserModal.username}?\`)) {
                                        socket.emit("admin_delete_user", selectedUserModal.username, (res: any) => {
                                            if(res.success) {
                                                alert("Cuenta eliminada y correo enviado.");
                                                setSelectedUserModal(null);
                                            } else {
                                                alert("Error: " + res.error);
                                            }
                                        });
                                    }
                                }}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                            >
                                ELIMINAR CUENTA (Admin)
                            </button>
                        )}
                    </div>
                )}
`;

code = code.replace(reportButton, deleteButton);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched admin delete button in App.tsx");
