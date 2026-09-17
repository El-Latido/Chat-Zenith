import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("      {isConfigOpen && (\n              {showChatConfig && (", "      {showChatConfig && (")

with open('src/App.tsx', 'w') as f:
    f.write(content)
