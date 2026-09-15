const fs = require('fs');

const files = ['src/components/CustomRooms.tsx', 'src/components/social/SocialFeed.tsx', 'src/components/FriendsWebcam.tsx'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');

    // Make backgrounds more transparent to show global blobs
    code = code.replace(
        /bg-\[#0B0B0C\]/g,
        'bg-transparent'
    );
    code = code.replace(
        /bg-\[#0F1012\]\/90 backdrop-blur-md/g,
        'bg-white/[0.03] backdrop-blur-xl shadow-lg'
    );
    code = code.replace(
        /bg-black\/40 border border-white\/5/g,
        'bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
    );
    
    // Buttons
    code = code.replace(
        /bg-white text-black hover:bg-white\/90/g,
        'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
    );
    code = code.replace(
        /bg-gradient-to-r from-white to-gray-200 hover:opacity-90 text-black/g,
        'bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    );
    
    code = code.replace(
        /bg-\[#0F1012\] border border-white\/10/g,
        'bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
    );

    fs.writeFileSync(file, code);
});

console.log("Patched vibrant colors in components");
