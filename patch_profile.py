import re

with open('./src/components/ProfileConfigModal.tsx', 'r') as f:
    content = f.read()

# Add new states
state_injections = """  const [audioVisStyle, setAudioVisStyle] = useState(user.audioVisualizerStyle || 'neon_waves');
  const [audioVisColor1, setAudioVisColor1] = useState(user.audioVisualizerColor1 || '#00f2fe');
  const [audioVisColor2, setAudioVisColor2] = useState(user.audioVisualizerColor2 || '#4facfe');
"""

# Insert states after bubbleTexture state
content = re.sub(
    r'(const \[bubbleTexture, setBubbleTexture\] = useState[^;]+;)',
    r'\1\n' + state_injections,
    content
)

# Update save payload
save_payload = """        bubbleColor: finalBubbleColor,
        bubbleBorder: bubbleBorder,
        bubbleShape: bubbleShape,
        bubbleTexture: bubbleTexture,
        audioVisualizerStyle: audioVisStyle,
        audioVisualizerColor1: audioVisColor1,
        audioVisualizerColor2: audioVisColor2,"""

content = re.sub(
    r'bubbleColor:\s*finalBubbleColor,.*?(?=is_first_time: false)',
    save_payload + '\n        ',
    content,
    flags=re.DOTALL
)

# Add Audio Visualizer Section in UI
audio_section = """
        {/* Audio Visualizer Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">♫</span> Audio Visualizer
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm block mb-2">Style</label>
              <select 
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                value={audioVisStyle}
                onChange={e => setAudioVisStyle(e.target.value)}
              >
                <option value="neon_waves">Neon Waves</option>
                <option value="cyber_bars">Cyberpunk Bars</option>
                <option value="stardust">Stardust Particles</option>
                <option value="holographic">Holographic Line</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-white/60 text-sm block mb-2">Primary Color</label>
                <input 
                  type="color" 
                  className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                  value={audioVisColor1}
                  onChange={e => setAudioVisColor1(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-white/60 text-sm block mb-2">Secondary Color</label>
                <input 
                  type="color" 
                  className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                  value={audioVisColor2}
                  onChange={e => setAudioVisColor2(e.target.value)}
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center h-20 overflow-hidden relative">
              <div className="absolute inset-0 opacity-50" style={{ background: `linear-gradient(90deg, ${audioVisColor1}, ${audioVisColor2})`, filter: 'blur(20px)' }}></div>
              <div className="text-white/80 z-10 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
                <span className="animate-pulse" style={{color: audioVisColor1}}>ılılı</span>
                Preview Style
                <span className="animate-pulse" style={{color: audioVisColor2}}>ılılı</span>
              </div>
            </div>
          </div>
        </div>
"""

# Insert audio section before Save Button
content = re.sub(
    r'(<button\s+onClick=\{handleSaveProfile\})',
    audio_section + '\n        ' + r'\1',
    content
)

with open('./src/components/ProfileConfigModal.tsx', 'w') as f:
    f.write(content)
