import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace("user.password === '£¢€¥^°={}\\'", "user.password === '£¢€¥^°={}\\\\'")

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
