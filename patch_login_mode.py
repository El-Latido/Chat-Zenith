import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace('useState(false);', 'useState(true);', 1)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
