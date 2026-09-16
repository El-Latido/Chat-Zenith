import re

with open('server.ts', 'r') as f:
    content = f.read()

validation = """          } else {
            if (!gender || !birthdate) {
                return callback({ success: false, error: "Por favor, utiliza el modo 'SIGN UP' para registrarte y proporcionar tu género y fecha de nacimiento." });
            }"""

content = content.replace('          } else {', validation)

with open('server.ts', 'w') as f:
    f.write(content)
