const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetToRemove = `    app.get('/api/download', async (req, res) => {
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
      console.error('Download error:', err);
      res.status(500).send('Error downloading file');
    }
  });`;

const repToInsert = `  const app = express();
  
  app.get('/api/download', async (req, res) => {
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
      console.error('Download error:', err);
      if (!res.headersSent) res.status(500).send('Error downloading file');
    }
  });
`;

if (code.includes(targetToRemove)) {
    code = code.replace(targetToRemove, '');
    code = code.replace('const app = express();', repToInsert);
    fs.writeFileSync('server.ts', code);
    console.log("Moved /api/download to the top of startServer");
} else {
    console.log("Could not find /api/download to remove");
}
