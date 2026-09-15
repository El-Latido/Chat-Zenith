import re

with open("src/App.tsx", "r") as f:
    content = f.read()

replacement = """      } catch (e) {}
    } else {
       setUser(prev => ({ ...prev, username: "Invitado_" + Math.floor(Math.random() * 10000), role: "user" }));
       setIsLoggedIn(true);
    }
    setIsAuthChecking(false);
  }, []);"""

content = re.sub(r'\}\s*catch\s*\(e\)\s*\{\}\s*\}\s*setIsAuthChecking\(false\);\s*\}, \[\]\);', replacement, content)

# Remove the manual bypass button if it's there
content = re.sub(r'<div className="fixed top-4 right-4 z-\[9999\]">.*?Omitir Login.*?<\/button>\s*<\/div>', '', content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
