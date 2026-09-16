import re

with open('./src/App.tsx', 'r') as f:
    content = f.read()

# Replace PremiumAudioPlayer usages
content = re.sub(
    r'<PremiumAudioPlayer src=\{m\.audio\} />',
    r'<PremiumAudioPlayer src={m.audio} styleType={user.audioVisualizerStyle} color1={user.audioVisualizerColor1} color2={user.audioVisualizerColor2} />',
    content
)

with open('./src/App.tsx', 'w') as f:
    f.write(content)
