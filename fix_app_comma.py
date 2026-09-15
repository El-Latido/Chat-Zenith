with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace('systemInstruction: "",\n  bubbleColor:', 'systemInstruction: "",\n  bubbleColor:')

# Let's just do a regex replace to insert the comma
import re
code = re.sub(r'systemInstruction:\s*"",\s*bubbleColor:', 'systemInstruction: "",\n    bubbleColor:', code)
with open('src/App.tsx', 'w') as f:
    f.write(code)
