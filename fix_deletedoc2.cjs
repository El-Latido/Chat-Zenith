const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(',\n, deleteDoc } from "firebase/firestore";', ',\n  deleteDoc \n} from "firebase/firestore";');
fs.writeFileSync('src/App.tsx', code);
