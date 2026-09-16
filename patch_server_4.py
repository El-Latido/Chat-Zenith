import re

with open('server.ts', 'r') as f:
    content = f.read()

# Update gender, age in active user creation
content = content.replace(
    'gender: userGender,',
    'gender: userGender || gender,'
)

content = content.replace(
    'let userGender = "";',
    'let userGender = "";\n      let userAge = 0;'
)

content = content.replace(
    'userGender = user?.gender || "";',
    'userGender = user?.gender || "";\n            userAge = user?.age || 0;'
)

content = content.replace(
    'userGender = fallbackState.users[username].gender || "";',
    'userGender = fallbackState.users[username].gender || "";\n          userAge = fallbackState.users[username].age || 0;'
)

with open('server.ts', 'w') as f:
    f.write(content)
