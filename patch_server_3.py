import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """          fallbackState.users[username] = {
            password,
            profilePic,
            statusMessage,
            role,
            pais_idioma: userCountryLanguage,
            securityEmail: userSecurityEmail,
            timezone: userTimezone,
            uid: newUid,
            profileLikes: 0,
            gender,
            birthdate,
            age,
          };"""

content = re.sub(
    r'fallbackState\.users\[username\] = \{\s*password,\s*profilePic,\s*statusMessage,\s*role,\s*pais_idioma: userCountryLanguage,\s*securityEmail: userSecurityEmail,\s*timezone: userTimezone,\s*uid: newUid,\s*profileLikes: 0,\s*\};',
    replacement,
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
