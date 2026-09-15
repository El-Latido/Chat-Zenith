import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace global chat prompt
global_pattern = r"let parts = \[\s*\{\s*text:\s*`Historial de chat reciente:` \+\s*contextMsgs\s*\.map\(\s*\(m\) =>\s*`\[\$\{new Date\(m\.createdAt\?\.seconds \? m\.createdAt\.seconds \* 1e3 : typeof m\.createdAt === \"number\" \? m\.createdAt : Date\.now\(\)\)\.toLocaleTimeString\(\)\}\] \$\{m\.sender\}: \$\{m\.text\}`,\s*\)\s*\.join\(\"\\n\"\) \+\s*`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.`,\s*\},\s*\];"

global_replacement = """let parts = [
            {
              text:
                `Historial de chat reciente:\\n` +
                contextMsgs
                  .map(
                    (m) =>
                      `[${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,
                  )
                  .join("\\n") +
                `\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente a este nuevo mensaje como Elizabeth.`,
            },
          ];"""

content = re.sub(global_pattern, global_replacement, content)

# Replace private chat prompt
private_pattern = r"let parts = \[\s*\{\s*text:\s*`Historial de chat privado con \$\{currentUsername\}:` \+\s*contextMsgs\s*\.map\(\s*\(m\) =>\s*`\[\$\{new Date\(m\.timestamp\?\.seconds \? m\.timestamp\.seconds \* 1e3 : typeof m\.timestamp === \"number\" \? m\.timestamp : Date\.now\(\)\)\.toLocaleTimeString\(\)\}\] \$\{m\.sender\}: \$\{m\.text\}`,\s*\)\s*\.join\(\"\\n\"\) \+\s*`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.`,\s*\},\s*\];"

private_replacement = """let parts = [
            {
              text:
                `Historial de chat privado con ${currentUsername}:\\n` +
                contextMsgs
                  .map(
                    (m) =>
                      `[${new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1e3 : typeof m.timestamp === "number" ? m.timestamp : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,
                  )
                  .join("\\n") +
                `\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde de forma privada y directa a este nuevo mensaje.`,
            },
          ];"""

content = re.sub(private_pattern, private_replacement, content)

with open('server.ts', 'w') as f:
    f.write(content)

