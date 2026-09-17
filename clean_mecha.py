import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove imports
content = re.sub(r'import\s*\{[^}]*MechaFiligreeBubble[^}]*\}\s*from\s*"./components/theme/MechaCelestialTheme";', '', content)

# 2. Remove MechaAvatarMedallion wrapper logic
content = re.sub(r'\{activeTheme === "mecha_celestial" \? \(\s*<MechaAvatarMedallion className="w-9 h-9">\s*(<img.*?>)\s*</MechaAvatarMedallion>\s*\) : \(\s*<div[^>]*>.*?</div>\s*\)\}', r'\1', content, flags=re.DOTALL)
# Ah wait, the current code has `activeTheme === "mecha_celestial"` inside `{(() => { ... })()}` for the bubble, and a different one for the avatar.
# It's better to just use regex to rip out the `if (activeTheme === "mecha_celestial") { ... }` block.

with open('src/App.tsx', 'w') as f:
    f.write(content)
