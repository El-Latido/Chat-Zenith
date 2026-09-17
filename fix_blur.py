import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace backdrop-blur on large containers
content = content.replace('bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] backdrop-blur-xl', 'bg-[#0a0a0c] border-r border-white/10')
content = content.replace('bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] backdrop-blur-md', 'bg-[#0a0a0c] border-r border-white/10')
content = content.replace('bg-[#0a0a0c]/80 backdrop-blur-2xl', 'bg-[#0a0a0c]')
content = content.replace('backdrop-blur-2xl', 'backdrop-blur-md')
content = content.replace('backdrop-blur-xl', 'backdrop-blur-md')

with open('src/App.tsx', 'w') as f:
    f.write(content)
