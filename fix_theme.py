import re

with open('src/components/ProfileConfigModal.tsx', 'r') as f:
    content = f.read()

# Default fallback replacement
content = content.replace("localStorage.getItem(\"chatliz_theme\") || 'mecha_celestial'", "localStorage.getItem(\"chatliz_theme\") || 'default'")

# Remove Mecha Celestial Card
# Finding the block from {/* Mecha Celestial Card */} to {/* Cyberpunk Neón Card */}
pattern = r"\{\/\* Mecha Celestial Card \*\/\}.*?(?=\{\/\* Cyberpunk Neón Card \*\/\})"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(content)


with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("localStorage.getItem(\"chatliz_theme\") || \"mecha_celestial\"", "localStorage.getItem(\"chatliz_theme\") || \"default\"")
content = content.replace("activeTheme === 'mecha_celestial' ? '/mecha_celestial_bg.jpg' : chatBgImage", "activeTheme === 'default' ? chatBgImage : chatBgImage")

with open('src/App.tsx', 'w') as f:
    f.write(content)


with open('src/components/InlineRadio.tsx', 'r') as f:
    content = f.read()

content = content.replace("theme === 'mecha_celestial'", "theme === 'NONE'")

with open('src/components/InlineRadio.tsx', 'w') as f:
    f.write(content)
