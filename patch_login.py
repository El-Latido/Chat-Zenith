import re

with open("src/components/Login.tsx", "r") as f:
    content = f.read()

btn_pattern = re.compile(r'(<button\s+onClick=\{handleLogin\}[^>]*>.*?<\/button>)', re.DOTALL)

bypass_btn = """\\1
            
            <button
              onClick={() => {
                 setUser({...user, username: "Invitado", password: "123"});
                 setTimeout(() => handleLogin(), 100);
              }}
              className="w-full bg-transparent border border-white/20 text-white/70 font-bold rounded-2xl py-3.5 mt-4 hover:bg-white/10 transition-all text-sm"
            >
              Entrar rápido para ver el diseño (Invitado)
            </button>"""

content = btn_pattern.sub(bypass_btn, content, count=1)

with open("src/components/Login.tsx", "w") as f:
    f.write(content)
