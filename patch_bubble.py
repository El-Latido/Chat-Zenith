import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_logic = """                                let shapeClasses = "rounded-[20px] rounded-tl-sm";
                                if (bShape === "square") shapeClasses = "rounded-md";
                                if (bShape === "pill") shapeClasses = "rounded-full rounded-tl-sm px-5";
                                if (bShape === "leaf") shapeClasses = "rounded-br-3xl rounded-tl-3xl rounded-tr-md rounded-bl-md";
                                
                                let textureClasses = "";
                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30";
                                if (bTexture === "gradient") textureClasses = "bg-gradient-to-br from-white/20 to-transparent";"""

new_logic = """                                let shapeClasses = bShape;
                                let textureClasses = "";
                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30 border-white/20";
                                if (bTexture === "glow") textureClasses = "shadow-[0_0_15px_rgba(255,255,255,0.2)]";"""

code = code.replace(old_logic, new_logic)

# In case `bShape` wasn't correctly initialized:
old_init = """                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded" : "rounded");
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "solid" : "solid");"""

new_init = """                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded-2xl" : "rounded-2xl rounded-tr-sm");
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "none" : "none");"""
code = code.replace(old_init, new_init)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Patched bubble logic")
