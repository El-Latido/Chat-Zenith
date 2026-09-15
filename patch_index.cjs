const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let snippet = `
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-XXXXXXXXXX');
    </script>
`;
html = html.replace('</head>', snippet + '  </head>');
fs.writeFileSync('index.html', html);
