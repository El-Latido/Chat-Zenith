const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The meta robots tag is causing issues for Lighthouse parser (maybe because of syntax)?
// Wait, Lighthouse reported:
// Syntax not understood for DOCTYPE, html, head, etc. 
// Oh! It's complaining about robots.txt being invalid.
// Wait, the PageSpeed Insights error says:
// robots.txt no es válido 33 errores encontrados
// And the content it shows is the HTML of the index page!
// This means the server is serving index.html for /robots.txt!

