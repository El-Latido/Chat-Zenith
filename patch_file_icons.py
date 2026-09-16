import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add generalFileInputRef
content = re.sub(
    r'(const fileInputRef = useRef<HTMLInputElement>\(null\);)',
    r'\1\n  const generalFileInputRef = useRef<HTMLInputElement>(null);',
    content
)

# Render attachments selected (Preview area)
preview_area_replace = """{selectedFile && (
                    <div className="absolute bottom-16 left-4 bg-[#27272a] p-2 rounded-xl border border-white/20 shadow-xl flex items-center gap-2 max-w-sm overflow-hidden text-xs text-white">
                       <span className="truncate">{selectedFile.name}</span>
                       <button onClick={() => setSelectedFile(null)}><X size={14} /></button>
                    </div>
                  )}"""

content = re.sub(
    r'(\{selectedImage && \()',
    preview_area_replace + '\n                  ' + r'\1',
    content
)

# Fix input field and attach generalFileInputRef
# Replacing the input buttons area
icons_search = r'''<div className="flex items-center gap-2 sm:gap-3">
                    <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><Plus size={24} /></button>
                    <button onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} className="text-gray-400 hover:text-white transition-colors"><Paperclip size={22} /></button>
                    <button onClick=\{\(\) => setShowEmojiPicker\(!showEmojiPicker\)\} className="text-gray-400 hover:text-white transition-colors"><Smile size={24} /></button>'''

icons_replace = '''<div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white transition-colors hidden sm:block"><ImageIcon size={24} /></button>
                    <button onClick={() => generalFileInputRef.current?.click()} className="text-gray-400 hover:text-white transition-colors"><Paperclip size={22} /></button>
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-white transition-colors"><Smile size={24} /></button>'''

content = re.sub(icons_search, icons_replace, content)

# Add the actual hidden input for general files
input_element_search = r'(<input type="file" accept="image/\*" className="hidden" ref=\{fileInputRef\} onChange=\{handleImageSelect\} />)'
input_element_replace = r'\1\n                      <input type="file" accept="*" className="hidden" ref={generalFileInputRef} onChange={handleGeneralFileSelect} />'

content = re.sub(input_element_search, input_element_replace, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
