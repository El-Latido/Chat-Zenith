const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  useEffect(() => {
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);`;
  
code = code.replace(search, '');
fs.writeFileSync('src/App.tsx', code);
