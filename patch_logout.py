import re

with open('src/components/ProfileConfigModal.tsx', 'r') as f:
    content = f.read()

replacement = """onClick={() => {
                      localStorage.removeItem('chatliz_user');
                      window.location.reload();
                    }}"""

content = content.replace('onClick={() => window.location.reload()}', replacement)

with open('src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(content)
