import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Let's add a quick bypass button directly above the Login component in App.tsx
bypass_btn = """<div className="fixed top-4 right-4 z-[9999]">
          <button 
             onClick={() => {
                setUser({...user, username: "Invitado_Diseño", role: "user"});
                setIsLoggedIn(true);
             }}
             className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg border border-white/20"
          >
             Omitir Login (Ver Diseño)
          </button>
        </div>
        <Login"""

content = content.replace("<Login", bypass_btn)

with open("src/App.tsx", "w") as f:
    f.write(content)
