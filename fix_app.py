import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'\{activeTheme === "mecha_celestial" \? \([\s\S]*?<MechaAvatarMedallion[\s\S]*?</MechaAvatarMedallion>\s*\) : \(\s*(<Avatar[\s\S]*?/>)\s*\)\}'
content = re.sub(pattern, r'\1', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
