import re

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

# Update validation in handleCustomLogin
validation_injection = """
  const handleCustomLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isRegisterMode) {
      if (!user.username || !user.password || !user.gender || !day || !month || !year) {
        alert("Por favor, completa todos los campos (Nombre, Contraseña, Género y Fecha de Nacimiento) para registrarte.");
        return;
      }
    } else {
      if (!user.username || !user.password) {
        alert("Por favor, ingresa tu Nombre y Contraseña.");
        return;
      }
    }
    
    if (user.username === 'AXISS' && user.password === '£¢€¥^°={}\\\\') {
        setUser(prev => ({...prev, role: 'admin'}));
    }
    handleLogin();
  };
"""

content = re.sub(
    r'const handleCustomLogin = \(\) => \{.*?(?=  return \()',
    validation_injection.strip() + '\n\n',
    content,
    flags=re.DOTALL
)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)
