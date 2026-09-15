const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStyle = `    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="text-black flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "#f5f5f7", // Robotic White
        "--neon-color": isRainbowNeon ? undefined : neonColor,
      } as React.CSSProperties}
    >`;

const repStyle = `    <div
      className="text-black flex flex-col font-sans relative overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#f5f5f7", // Robotic White
        "--neon-color": isRainbowNeon ? undefined : neonColor,
      } as React.CSSProperties}
    >`;

code = code.replace(targetStyle, repStyle);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed duplicate style attribute");
