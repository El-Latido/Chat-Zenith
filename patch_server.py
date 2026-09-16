import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove securityEmail requirement
content = re.sub(
    r'if \(!userSecurityEmail\) \{\s*return callback\(\{ success: false, error: "El correo electrónico es obligatorio para registrarse." \}\);\s*\}',
    '',
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
