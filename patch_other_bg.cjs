const fs = require('fs');

const files = ['src/components/CustomRooms.tsx', 'src/components/social/SocialFeed.tsx', 'src/components/FriendsWebcam.tsx'];

const bgContent = `
      {/* Premium Animated Glowing Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '3s' }}></div>
      
      {/* Glassmorphism background filter overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0"></div>
`;

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');

    // Replace the main wrapper div's class to relative and overflow-hidden if it isn't already, then insert the blobs as the first children.
    
    // For CustomRooms
    if (file.includes('CustomRooms')) {
        code = code.replace(
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">',
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">' + bgContent
        );
    }
    
    // For SocialFeed
    if (file.includes('SocialFeed')) {
        code = code.replace(
            '<div className="flex-1 flex flex-col h-full bg-[#0B0B0C] overflow-hidden">',
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">' + bgContent
        );
        code = code.replace(
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">',
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">' + bgContent
        );
    }

    // For FriendsWebcam
    if (file.includes('FriendsWebcam')) {
        code = code.replace(
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">',
            '<div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">' + bgContent
        );
    }

    fs.writeFileSync(file, code);
});
console.log("Patched other backgrounds");
