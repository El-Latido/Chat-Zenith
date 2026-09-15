const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importTarget = `import express from "express";`;
const importRep = `import express from "express";
import ytdl from "ytdl-core";`;

const apiTarget = `  app.use(express.static(distPath));`;
const apiRep = `  app.get('/api/download', async (req, res) => {
    try {
      const url = req.query.url;
      const format = req.query.format || 'mp3';
      const quality = req.query.quality || 'high';
      
      if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid URL');
      
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\\w\\s-]/gi, '');
      
      if (format === 'mp3') {
         res.header('Content-Disposition', \`attachment; filename="\${title}.mp3"\`);
         res.header('Content-Type', 'audio/mpeg');
         ytdl(url, { filter: 'audioonly', quality: quality === 'high' ? 'highestaudio' : 'lowestaudio' }).pipe(res);
      } else {
         res.header('Content-Disposition', \`attachment; filename="\${title}.mp4"\`);
         res.header('Content-Type', 'video/mp4');
         ytdl(url, { quality: quality === 'high' ? 'highest' : 'lowest' }).pipe(res);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error downloading');
    }
  });

  app.use(express.static(distPath));`;

if (code.includes(importTarget) && !code.includes('ytdl-core')) {
  code = code.replace(importTarget, importRep);
}
if (code.includes(apiTarget) && !code.includes('/api/download')) {
  code = code.replace(apiTarget, apiRep);
}

fs.writeFileSync('server.ts', code);
console.log("Patched server API");
