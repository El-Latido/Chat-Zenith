const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', {stdio: 'pipe'});
} catch (e) {
  console.log(e.stdout.toString());
}
