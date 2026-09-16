import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add new state for file
state_injection = """  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, url: string} | null>(null);
"""
content = re.sub(
    r'(const \[showEmojiPicker, setShowEmojiPicker\] = useState\(false\);)',
    state_injection + r'\1',
    content
)

# Add handler for file select
file_handler = """
  const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande (máx 5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          url: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };
"""

content = re.sub(
    r'(const handleImageSelect = )',
    file_handler + '\n  ' + r'\1',
    content
)

# Update clear payload
content = re.sub(
    r'setSelectedImage\(null\); setAudioUrl\(null\); setSelectedGif\(null\);',
    r'setSelectedImage(null); setAudioUrl(null); setSelectedGif(null); setSelectedFile(null);',
    content
)

# Update check for empty message
content = re.sub(
    r'!inputValue\.trim\(\) && !selectedImage && !audioUrl && !selectedGif',
    r'!inputValue.trim() && !selectedImage && !audioUrl && !selectedGif && !selectedFile',
    content
)

# Update payload adding
add_payload = """    if (selectedGif) payload.image = selectedGif;
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        payload.video = selectedFile.url;
      } else {
        payload.file = selectedFile;
      }
    }"""
content = re.sub(
    r'if \(selectedGif\) payload\.image = selectedGif;',
    add_payload,
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
