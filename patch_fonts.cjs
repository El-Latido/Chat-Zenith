const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');",
    "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&display=swap');"
);

css = css.replace(
    /--font-sans: "Inter".*/,
    '--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;'
);
css = css.replace(
    /--font-display: "Space Grotesk".*/,
    '--font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;'
);

css = css.replace(/background-color: #000;/, 'background-color: #0B0B0C;'); // Very dark gray

fs.writeFileSync('src/index.css', css);
