const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

const search = `                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="btn-eye"
                     >`;
const replace = `                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="btn-eye"
                       aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                     >`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/Login.tsx', code);
