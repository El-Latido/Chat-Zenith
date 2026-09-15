const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const search = '</head>';
const replace = `
    <!-- Datos Estructurados JSON-LD (SEO) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Chat Liz",
      "description": "Una plataforma global de chat con IA en tiempo real.",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Chat Global, Chat Privado con IA (Elizabeth), Minijuegos"
    }
    </script>
</head>`;

if (!code.includes('application/ld+json')) {
    code = code.replace(search, replace);
    fs.writeFileSync('index.html', code);
}
