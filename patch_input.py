import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Replace the useState for inputValue with a useRef
content = re.sub(
    r'const \[inputValue, setInputValue\] = useState\(""\);',
    r'const inputRef = useRef<HTMLInputElement>(null);',
    content
)

# 2. Update handleInputChange to remove setInputValue
content = re.sub(
    r'setInputValue\(e\.target\.value\);\n',
    r'',
    content
)

# 3. Update handleSendMessage
# We need to extract the value from the ref
send_msg_start = r'const handleSendMessage = async \(\) => \{'
send_msg_replacement = r'''const handleSendMessage = async () => {
    const inputValue = inputRef.current?.value || "";'''

content = re.sub(send_msg_start, send_msg_replacement, content)

# 4. Update clearing the input
content = re.sub(
    r'setInputValue\(""\);',
    r'if (inputRef.current) inputRef.current.value = "";',
    content
)

# 5. Update mentions
content = re.sub(
    r'setInputValue\(\(prev\) => prev \+ `@\$\{m\.sender\} `\)',
    r'if (inputRef.current) inputRef.current.value += `@${m.sender} `',
    content
)

# 6. Update the input element in JSX
input_jsx = r'''value=\{inputValue\}\s*onChange=\{handleInputChange\}\s*onKeyDown=\{\(e\) => \{\s*if \(e\.key === "Enter"\) handleSendMessage\(\);\s*\}\}\s*className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"\s*placeholder="Type here\.\.\."\s*id="chat-input-field"\s*autoComplete="off"\s*spellCheck="false"'''

new_input_jsx = r'''ref={inputRef}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                        placeholder="Type here..."
                        id="chat-input-field"
                        autoComplete="off"
                        spellCheck="false"'''

content = re.sub(input_jsx, new_input_jsx, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

