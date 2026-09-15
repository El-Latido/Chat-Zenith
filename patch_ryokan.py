import re

with open("src/components/RyokanNeo.tsx", "r") as f:
    content = f.read()

old_tex = """        const createTex = (type: string) => {
            const size = 1024;"""

new_tex = """        const createTex = (type: string) => {
            const size = window.innerWidth < 768 ? 256 : 1024;"""

content = content.replace(old_tex, new_tex)

old_particles = """  const count = 1000;"""
new_particles = """  const count = window.innerWidth < 768 ? 200 : 1000;"""
content = content.replace(old_particles, new_particles)

old_steam = """  const count = 300;"""
new_steam = """  const count = window.innerWidth < 768 ? 80 : 300;"""
content = content.replace(old_steam, new_steam)

with open("src/components/RyokanNeo.tsx", "w") as f:
    f.write(content)
