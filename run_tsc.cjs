const { execSync } = require('child_process');
try {
    execSync('npx tsc src/App.tsx --noEmit --jsx react-jsx', { stdio: 'pipe' });
    console.log("TSC passed!");
} catch (e) {
    console.log("TSC failed!");
    console.log(e.stdout.toString());
}
