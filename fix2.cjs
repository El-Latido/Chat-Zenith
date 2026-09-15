const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

// I know the issue is around line 1066 to 1070
// Let's just find the `return (` at line 1050 and the `});` at line 1072.

for (let i = 1065; i < 1070; i++) {
    if (lines[i].includes('</div>')) {
        lines[i] = '';
    }
}
lines[1066] = '                        </div>';
lines[1067] = '                    );';
lines[1068] = '                 })}';

fs.writeFileSync('src/App.tsx', lines.join('\n'));
