import re

with open('server.ts', 'r') as f:
    content = f.read()

# Make email check conditional
email_check = """
            if (userSecurityEmail) {
                const qEmail = query(collection(fdb, "users"), where("securityEmail", "==", userSecurityEmail));
                const snapEmail = await getDocs(qEmail);
                if (!snapEmail.empty) {
                    return callback({ success: false, error: "Ya tienes una cuenta vinculada a la app con este correo." });
                }
            }
"""

content = re.sub(
    r'const qEmail = query\(collection\(fdb, "users"\), where\("securityEmail", "==", userSecurityEmail\)\);\s*const snapEmail = await getDocs\(qEmail\);\s*if \(!snapEmail\.empty\) \{\s*return callback\(\{ success: false, error: "Ya tienes una cuenta vinculada a la app con este correo\." \}\);\s*\}',
    email_check.strip(),
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
