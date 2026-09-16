import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'handleLogin();',
    'handleLogin(e, { age: calculateAge(day, month, year), birthdate: `${day}/${month}/${year}` });'
)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
