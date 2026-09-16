import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const handleLogin = (e?: React.FormEvent) => {',
    'const handleLogin = (e?: React.FormEvent, extraData: any = {}) => {'
)

content = content.replace(
    'const loginPayload = { ...user, timezone };',
    'const loginPayload = { ...user, ...extraData, timezone };'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
