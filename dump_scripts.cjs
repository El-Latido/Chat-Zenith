const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

http.get('http://127.0.0.1:9229/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const targets = JSON.parse(data);
    const target = targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Debugger.enable' }));
    });
    
    ws.on('message', (msg) => {
      const resp = JSON.parse(msg);
      if (resp.method === 'Debugger.scriptParsed') {
        const scriptId = resp.params.scriptId;
        const url = resp.params.url;
        if (url.includes('server.ts')) {
          ws.send(JSON.stringify({ id: parseInt(scriptId) + 1000, method: 'Debugger.getScriptSource', params: { scriptId } }));
        }
      } else if (resp.id > 1000) {
        fs.writeFileSync('/tmp/recovered_server.ts', resp.result.scriptSource);
        console.log("RECOVERED!");
        process.exit(0);
      }
    });
  });
});
