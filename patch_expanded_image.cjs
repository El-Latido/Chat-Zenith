const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change adCountdown
code = code.replace(
    'setAdCountdown(5);',
    'setAdCountdown(15);'
);

// Add expanded image modal at the end of the App just before final closing div
const targetEnd = `    </div>
  );
}

export default App;`;

const repEnd = `      {expandedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            alt="Expanded"
          />
          <button 
             className="absolute top-4 right-4 text-white hover:bg-white/10 p-3 rounded-full transition-colors"
             onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
          >
             <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;`;

code = code.replace(targetEnd, repEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched expanded image and ad time");
