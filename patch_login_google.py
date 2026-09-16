import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

# Remove the google login button
content = re.sub(
    r'<button\s*type="button"\s*onClick=\{handleGoogleLogin\}.*?</button>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
