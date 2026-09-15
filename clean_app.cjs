const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
content = content.replace(/import \{ CloudAdminPanel \} from '.\/components\/CloudAdminPanel';\n?/g, '');

// Remove if (activeChat === 'cloud_admin') block
content = content.replace(/[ \t]*if \(activeChat === 'cloud_admin'\) \{[\s\S]*?return <CloudAdminPanel[^>]*>;[\s\S]*?\}[ \t]*\n?/g, '');

// Remove AXISS button block in header
content = content.replace(/[ \t]*\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \([\s\S]*?<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>[\s\S]*?<\/button>[\s\S]*?<\/>\s*\)\}\s*/g, '');

// Remove AXISS button block in sidebar
content = content.replace(/[ \t]*\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \([\s\S]*?<button[^>]*setActiveChat\('cloud_admin'\)[^>]*>[\s\S]*?<\/button>\s*\)\}\s*/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx cleaned');
