const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      {selectedUserModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedUserModal(null)}
        >
          <div
            className="bg-[#0f111a] rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >`;

const replacement = `      {selectedUserModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto overscroll-none"
          onClick={() => setSelectedUserModal(null)}
          style={{ overscrollBehavior: 'none' }}
        >
          <div
            className="bg-[#0f111a] rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10 my-8 mt-16"
            onClick={(e) => e.stopPropagation()}
          >`;

code = code.replace(target, replacement);

const targetBtn = `               <button
                 onClick={() => setSelectedUserModal(null)}
                 className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
               >
                 <X size={20} />
               </button>`;

const replacementBtn = `               <button
                 onClick={() => setSelectedUserModal(null)}
                 className="absolute top-4 right-4 text-white hover:text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all shadow-lg z-50 border border-white/20"
               >
                 <X size={24} strokeWidth={3} />
               </button>`;
code = code.replace(targetBtn, replacementBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched profile modal X button and scroll");
