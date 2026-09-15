const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const soundCode = `
  const playReactionSound = (emoji: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if (emoji === '❤️') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
      } else if (emoji === '😂') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(600, now + 0.05);
          osc.frequency.setValueAtTime(800, now + 0.1);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
      } else if (emoji === '😮') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.2);
          gainNode.gain.setValueAtTime(0.4, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
      } else if (emoji === '😢') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.3);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
      } else if (emoji === '😡') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.2);
          gainNode.gain.setValueAtTime(0.4, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
      } else if (emoji === '👍') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(400, now);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      }
    } catch (e) {
      console.error(e);
    }
  };
`;

code = code.replace("const playNotifySound = () => {", soundCode + "\n  const playNotifySound = () => {");
fs.writeFileSync('src/App.tsx', code);
