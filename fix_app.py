import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix inputValue
content = content.replace('const handleSendMessage = () => {\n    if (!inputValue.trim()', 'const handleSendMessage = () => {\n    const inputValue = inputRef.current?.value || "";\n    if (!inputValue.trim()')

# Add missing imports for profile config modal
with open('src/components/ProfileConfigModal.tsx', 'r') as f:
    profile_content = f.read()

if 'Users' not in profile_content.split('from \'lucide-react\'')[0]:
    profile_content = profile_content.replace('User, Globe, MessageSquare', 'User, Globe, MessageSquare, Users, Calendar')

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(profile_content)
