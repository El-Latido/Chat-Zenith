const { execSync } = require('child_process');
try {
    execSync('npx tsc src/components/MainIsland.tsx --noEmit --jsx react-jsx --esModuleInterop', { stdio: 'pipe' });
    console.log("TSC passed!");
} catch (e) {
    console.log("TSC failed!");
    console.log(e.stdout.toString());
}
