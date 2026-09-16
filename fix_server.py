import re

with open('server.ts', 'r') as f:
    content = f.read()

bad_string = """          if (!gender || !birthdate) {
              return callback({ success: false, error: "Por favor, utiliza el modo 'SIGN UP' para registrarte y proporcionar tu género y fecha de nacimiento." });
          }"""

bad_string2 = """            if (!gender || !birthdate) {
                return callback({ success: false, error: "Por favor, utiliza el modo 'SIGN UP' para registrarte y proporcionar tu género y fecha de nacimiento." });
            }"""

# Fix the first one everywhere except the correct spot.
# First, revert ALL of them to just empty.
content = content.replace(bad_string, "")
content = content.replace(bad_string2, "")

# Now inject it safely at the correct spots.
correct_injection_1 = """          } else {
            if (!gender || !birthdate) {
                return callback({ success: false, error: "Por favor, utiliza el modo 'SIGN UP' para registrarte y proporcionar tu género y fecha de nacimiento." });
            }
            const qEmail = query(collection(fdb, "users"), where("securityEmail", "==", userSecurityEmail));"""

content = content.replace(
    '} else {\n            if (userSecurityEmail) {',
    correct_injection_1.replace('            const qEmail = query(collection(fdb, "users"), where("securityEmail", "==", userSecurityEmail));', '            if (userSecurityEmail) {')
)

correct_injection_2 = """        } else {
          if (!gender || !birthdate) {
              return callback({ success: false, error: "Por favor, utiliza el modo 'SIGN UP' para registrarte y proporcionar tu género y fecha de nacimiento." });
          }
          const newUid = Math.random()"""

content = content.replace(
    '} else {\n          const newUid = Math.random()',
    correct_injection_2
)

with open('server.ts', 'w') as f:
    f.write(content)
