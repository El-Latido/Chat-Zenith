const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetDeco = `  {
    id: "chess_theme_wood",`;

const repDeco = `  {
    id: "bubble_soap",
    type: "texture",
    category: "efectos",
    price: 300,
    url: "soap",
  },
  {
    id: "bubble_animals",
    type: "texture",
    category: "efectos",
    price: 450,
    url: "animals",
  },
  {
    id: "chess_theme_wood",`;

code = code.replace(targetDeco, repDeco);

// Then apply the CSS logic for them
const targetTex = `                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30 border-white/20";
                                if (bTexture === "glow") textureClasses = "shadow-[0_0_15px_rgba(255,255,255,0.2)]";`;

const repTex = `                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30 border-white/20";
                                if (bTexture === "glow") textureClasses = "shadow-[0_0_15px_rgba(255,255,255,0.2)]";
                                if (bTexture === "soap") textureClasses = "backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(255,255,255,0.5)] border border-white/40 overflow-visible";
                                if (bTexture === "animals") textureClasses = "overflow-visible";`;

code = code.replace(targetTex, repTex);

// In the chat message loop, if bTexture is "animals", render tiny absolute images
const targetContent = `                                      <span
                                        className={\`font-semibold \${nameColor} text-[13px] mb-0.5 cursor-pointer hover:text-white transition-colors tracking-wide\`}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >`;

const repContent = `                                      {bTexture === "animals" && (
                                        <>
                                          <div className="absolute -top-3 -left-3 text-2xl z-10 animate-bounce" style={{animationDuration: '2s'}}>🐰</div>
                                          <div className="absolute -bottom-3 -right-3 text-2xl z-10 animate-pulse">🐱</div>
                                        </>
                                      )}
                                      <span
                                        className={\`font-semibold \${nameColor} text-[13px] mb-0.5 cursor-pointer hover:text-white transition-colors tracking-wide\`}
                                        onClick={() => setInputValue((prev) => prev + \`@\${m.sender} \`)}
                                      >`;

code = code.replace(targetContent, repContent);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched bubble designs");
