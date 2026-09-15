const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const scriptTag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3908035132428428" crossorigin="anonymous"></script>';

if (!html.includes('ca-pub-3908035132428428')) {
    html = html.replace('</head>', scriptTag + '\n</head>');
    fs.writeFileSync('index.html', html);
    console.log("AdSense script added.");
} else {
    console.log("AdSense script already exists.");
}
