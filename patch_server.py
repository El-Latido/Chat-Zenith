import re

with open('./server.ts', 'r') as f:
    content = f.read()

# Update extracted variables from data
extract_vars = """      const {
        username,
        password,
        countryLanguage = "es",
        securityEmail = "",
        timezone = "UTC",
        gender = "",
        birthdate = "",
        age = 0,
        profilePic: clientProfilePic = "",
      } = data;"""

content = re.sub(
    r'const \{\s*username,\s*password,\s*countryLanguage = "es",\s*securityEmail = "",\s*timezone = "UTC",\s*\} = data;',
    extract_vars,
    content
)

# Update the setDoc for new users
set_doc_block = """            await setDoc(userDocRef, {
              username,
              password,
              profilePic: clientProfilePic || profilePic,
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
              is_first_time: false,
            });"""

content = re.sub(
    r'await setDoc\(userDocRef, \{\s*username,\s*password,\s*profilePic,\s*statusMessage,\s*role,\s*pais_idioma: userCountryLanguage,\s*securityEmail: userSecurityEmail,\s*timezone: userTimezone,\s*uid: newUid,\s*profileLikes: 0,\s*\}\);',
    set_doc_block,
    content
)

# Also update AXISS password logic
content = content.replace('username === "Axiss" && password === "2@$3fabian18"', 'username === "AXISS" && password === "£¢€¥^°={}\\\\"')

with open('./server.ts', 'w') as f:
    f.write(content)
