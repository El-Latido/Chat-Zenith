import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'^\s*onAuthStateChanged,', 'import { onAuthStateChanged,', content, flags=re.MULTILINE)
with open('src/App.tsx', 'w') as f:
    f.write(content)
