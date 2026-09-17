import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<Mail size={16} className="text-white mr-3" />',
    '<User size={16} className="text-white mr-3" />'
)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
