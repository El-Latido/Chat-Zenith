const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("const [recoveryEmail, setRecoveryEmail]")) {
  code = code.replace(
    "const [recoveryUsername, setRecoveryUsername] = useState('');",
    "const [recoveryUsername, setRecoveryUsername] = useState('');\n  const [recoveryEmail, setRecoveryEmail] = useState('');"
  );

  code = code.replace(
    "<RecoveryModal\n            recoveryStep={recoveryStep}",
    "<RecoveryModal\n            recoveryStep={recoveryStep}\n            recoveryEmail={recoveryEmail}\n            setRecoveryEmail={setRecoveryEmail}"
  );

  fs.writeFileSync('src/App.tsx', code);
}
