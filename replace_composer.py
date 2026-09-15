import re

with open("src/components/Builder3D.tsx", "r") as f:
    content = f.read()

old_composer = """              <EffectComposer disableNormalPass>
                 <N8AO aoRadius={2} intensity={1} color="#000000" />
                 <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
              </EffectComposer>"""

new_composer = """              <EffectComposer disableNormalPass multisampling={0}>
                 <N8AO aoRadius={4} intensity={2.5} color="#0a0a0a" distanceFalloff={1} />
                 <Bloom luminanceThreshold={0.8} mipmapBlur intensity={2.5} radius={0.8} />
                 <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={2} height={480} />
                 <ToneMapping adaptive resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
              </EffectComposer>"""

content = content.replace(old_composer, new_composer)

with open("src/components/Builder3D.tsx", "w") as f:
    f.write(content)
