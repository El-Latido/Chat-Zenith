const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add the helper function right after bottomRef
const searchRef = `  const bottomRef = useRef<HTMLDivElement>(null);`;
const replaceRef = `  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (bottomRef.current?.parentElement) {
      bottomRef.current.parentElement.scrollTo({
        top: bottomRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };`;
code = code.replace(searchRef, replaceRef);

// Replace all scrollIntoView calls
code = code.replace(/\(\) => bottomRef\.current\?\.scrollIntoView\(\{ behavior: "smooth" \}\)/g, 'scrollToBottom');
code = code.replace(/\(\) => bottomRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\)/g, 'scrollToBottom');
code = code.replace(/\(\) => bottomRef\.current\?\.scrollIntoView\(\)/g, 'scrollToBottom');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed scrolling logic.");
