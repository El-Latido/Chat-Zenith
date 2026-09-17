import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """    } else {
       setIsAuthChecking(false);
       // Removed auto guest login
    }
    setIsAuthChecking(false);
  }, []);"""

content = re.sub(
    r'\} else \{\s*setUser\(prev => \(\{ \.\.\.prev, username: "Invitado_" \+ Math\.floor\(Math\.random\(\) \* 10000\), role: "user" \}\)\);\s*setIsLoggedIn\(true\);\s*\}\s*setIsAuthChecking\(false\);\s*\}, \[\]\);',
    replacement,
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
