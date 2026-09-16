import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'gender: userGender || gender,',
    'gender: userGender || gender,\n        age: userAge || age,'
)

with open('server.ts', 'w') as f:
    f.write(content)
