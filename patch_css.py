with open('src/index.css', 'a') as f:
    f.write("""
/* Shader Effects */
.shader-crt::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 100;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
}
.shader-scanlines {
    background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.15),
        rgba(0,0,0,0.15) 1px,
        transparent 1px,
        transparent 2px
    );
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 99;
}
.shader-vignette {
    box-shadow: inset 0 0 150px rgba(0,0,0,0.9);
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 98;
}
.shader-glow * {
    text-shadow: 0 0 5px currentColor !important;
    box-shadow: 0 0 5px currentColor !important;
}
.shader-chromatic {
    animation: chromatic 2s infinite alternate;
}
@keyframes chromatic {
    0% { text-shadow: -2px 0 red, 2px 0 cyan; }
    50% { text-shadow: 2px 0 red, -2px 0 cyan; }
    100% { text-shadow: -1px 0 red, 1px 0 cyan; }
}
.shader-pixelate {
    image-rendering: pixelated;
    filter: contrast(1.2) saturate(1.5);
}
""")
print("Patched index.css")
