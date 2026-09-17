import re

with open('server.ts', 'r') as f:
    content = f.read()

payload_match = re.search(r'mood: userMood,\s*preferred_background: preferredBackground,\s*\}\);', content)
if payload_match:
    content = content.replace(payload_match.group(0), 
'''mood: userMood,
            preferred_background: preferredBackground,
            preferred_theme: typeof preferredTheme !== 'undefined' ? preferredTheme : "",
            bubbleColor: typeof bubbleColor !== 'undefined' ? bubbleColor : "",
            bubbleBorder: typeof bubbleBorder !== 'undefined' ? bubbleBorder : "",
            bubbleShape: typeof bubbleShape !== 'undefined' ? bubbleShape : "",
            bubbleTexture: typeof bubbleTexture !== 'undefined' ? bubbleTexture : "",
            audioVisualizerStyle: typeof audioVisualizerStyle !== 'undefined' ? audioVisualizerStyle : "",
            audioVisualizerColor1: typeof audioVisualizerColor1 !== 'undefined' ? audioVisualizerColor1 : "",
            audioVisualizerColor2: typeof audioVisualizerColor2 !== 'undefined' ? audioVisualizerColor2 : "",
          });''')

with open('server.ts', 'w') as f:
    f.write(content)
