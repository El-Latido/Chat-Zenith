import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add a generic FileIcon from lucide-react if not imported
if 'FileIcon' not in content:
    content = content.replace('ImageIcon,', 'ImageIcon, FileIcon,')

# Message rendering - inject right after image logic
render_logic = """
                                      {m.video && (
                                        <div className="mt-2">
                                          <video src={m.video} controls className="rounded-xl border border-white/20 max-w-full shadow-md h-auto max-h-48 object-contain" />
                                        </div>
                                      )}
                                      {m.file && (
                                        <div className="mt-2 flex">
                                          <a href={m.file.url} download={m.file.name} className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-colors text-sm">
                                            <FileIcon size={18} className="text-cyan-400" />
                                            <span className="truncate max-w-[200px]">{m.file.name}</span>
                                          </a>
                                        </div>
                                      )}
"""

content = re.sub(
    r'(onClick=\{\(e\) => \{ e\.stopPropagation\(\); setExpandedImage\(m\.image\); \}\}\s*alt="adjunto"\s*/>\s*</div>\s*\)\})',
    r'\1' + render_logic,
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
