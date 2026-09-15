const fs = require('fs');
let checkCount = 0;
const interval = setInterval(() => {
    checkCount++;
    console.log("Waiting for build...");
    if (checkCount > 10) {
        clearInterval(interval);
        console.log("Build might be taking too long.");
    }
}, 2000);
