import re

with open('server.ts', 'r') as f:
    lines = f.readlines()

lines.insert(1068, '            if (!gender || !birthdate) { return callback({ success: false, error: "Por favor, utiliza el modo SIGN UP para registrarte y proporcionar tu género y fecha de nacimiento." }); }\n')
lines.insert(1148, '          if (!gender || !birthdate) { return callback({ success: false, error: "Por favor, utiliza el modo SIGN UP para registrarte y proporcionar tu género y fecha de nacimiento." }); }\n')

with open('server.ts', 'w') as f:
    f.writelines(lines)
