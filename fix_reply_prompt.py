import re

with open('server.ts', 'r') as f:
    code = f.read()

target = r'`NUEVO MENSAJE DE \$\{currentUsername\}: "\$\{msg\.text\}"\\nResponde directamente como Elizabeth.`'
replace = r'`NUEVO MENSAJE DE ${currentUsername}: "${msg.text}"` + (msg.replyTo ? `\n(Este mensaje responde al mensaje de ${msg.replyTo.sender}: "${msg.replyTo.text}")` : "") + `\nResponde directamente como Elizabeth.`'

code = re.sub(target, replace, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Done")
