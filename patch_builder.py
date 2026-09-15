import re

with open("src/components/Builder3D.tsx", "r") as f:
    content = f.read()

# Add mobile detection state inside Builder3D component
old_state = "const [selectedItemId, setSelectedItemId] = useState<string | null>(null);"
new_state = """const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const isMobile = window.innerWidth < 768;"""

if old_state in content:
    content = content.replace(old_state, new_state)

# Add dpr to Canvas
old_canvas = "<Canvas shadows camera={{ position: [0, 60, 110], fov: 45 }}>"
new_canvas = "<Canvas shadows dpr={isMobile ? [1, 1] : [1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: false }} camera={{ position: [0, 60, 110], fov: 45 }}>"
content = content.replace(old_canvas, new_canvas)

# Disable post-processing on mobile
old_composer = """              <EffectComposer disableNormalPass multisampling={0}>
                 <N8AO aoRadius={4} intensity={2.5} color="#0a0a0a" distanceFalloff={1} />
                 <Bloom luminanceThreshold={0.8} mipmapBlur intensity={2.5} radius={0.8} />
                 <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={2} height={480} />
                 <ToneMapping adaptive resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
              </EffectComposer>"""

new_composer = """              {!isMobile && (
                  <EffectComposer disableNormalPass multisampling={0}>
                     <N8AO aoRadius={4} intensity={2.5} color="#0a0a0a" distanceFalloff={1} />
                     <Bloom luminanceThreshold={0.8} mipmapBlur intensity={2.5} radius={0.8} />
                     <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={2} height={480} />
                     <ToneMapping adaptive resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
                  </EffectComposer>
              )}"""
content = content.replace(old_composer, new_composer)

with open("src/components/Builder3D.tsx", "w") as f:
    f.write(content)
