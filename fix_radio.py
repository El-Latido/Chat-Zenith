import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove Gift
content = content.replace('<button className="hover:text-white transition-colors"><Gift size={22} /></button>', '')

# Change Play button to toggle radio
content = content.replace(
    '<button className="hover:text-white transition-colors"><Play size={22} /></button>',
    '<button onClick={() => setIsRadioOpen(!isRadioOpen)} className="hover:text-white transition-colors"><Play size={22} /></button>'
)

# Add state isRadioOpen
content = content.replace(
    'const [isSidebarOpen, setIsSidebarOpen] = useState(false);',
    'const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [isRadioOpen, setIsRadioOpen] = useState(false);'
)

# Render InlineRadio above the input area
inline_radio_render = """
            {isRadioOpen && (
              <div className="absolute bottom-full mb-2 left-0 z-50">
                <InlineRadio />
              </div>
            )}
            {activeChat !== "global" && (
"""
content = content.replace('{activeChat !== "global" && (', inline_radio_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)
