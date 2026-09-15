const fs = require('fs');
const files = ['src/components/social/SocialFeed.tsx', 'src/components/CustomRooms.tsx', 'src/components/FriendsWebcam.tsx'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // Sidebar background
    code = code.replace(
        /bg-\[#121B2A\]\/95/g,
        'bg-[#0F1012]/95'
    );
    code = code.replace(
        /bg-\[#121B2A\]\/90/g,
        'bg-[#0F1012]/90'
    );

    // General deep backgrounds
    code = code.replace(
        /bg-\[#121B2A\]/g,
        'bg-[#0F1012]'
    );
    
    code = code.replace(
        /bg-\[#1A2639\]\/50/g,
        'bg-[#0B0B0C]'
    );

    code = code.replace(
        /border-\[#D4AF37\]\/30/g,
        'border-white/5'
    );
    code = code.replace(
        /border-\[#D4AF37\]\/50/g,
        'border-white/10'
    );
    code = code.replace(
        /border-\[#D4AF37\]\/20/g,
        'border-white/5'
    );

    code = code.replace(/text-\[#D4AF37\]/g, 'text-white/80');
    code = code.replace(/text-\[#E8D9B0\]/g, 'text-white');
    code = code.replace(/text-\[#8B98B0\]/g, 'text-white/50');
    code = code.replace(/hover:text-\[#E8D9B0\]/g, 'hover:text-white');
    
    code = code.replace(/bg-\[#D4AF37\]/g, 'bg-white text-black');
    code = code.replace(/hover:bg-\[#E8D9B0\]/g, 'hover:bg-white/90');
    code = code.replace(/from-\[#D4AF37\] to-\[#F3E5AB\]/g, 'from-white to-gray-200');

    fs.writeFileSync(file, code);
});
console.log("Modernized components");
