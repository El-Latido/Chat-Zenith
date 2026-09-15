const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We will replace ensureAutoRadio to do nothing, or we just remove its calls.
// Actually, let's keep AutoDJ but it won't auto-fill. Let's just comment out its internals.
code = code.replace(/function ensureAutoRadio\(\) \{[\s\S]*?__name\(ensureAutoRadio, "ensureAutoRadio"\);/,
`function ensureAutoRadio() {
    // Restablecido: la radio vuelve a su estado normal (stream por defecto) esperando nuevos pedidos.
}
__name(ensureAutoRadio, "ensureAutoRadio");`);

// Add isBatchPlaying state
code = code.replace(/let songQueue = \[\];/, 'let songQueue = [];\n  let isBatchPlaying = false;');

// In confirm_song_request:
// We need to find where songQueue.push is for user requests.
// It's in the else block of if (currentLiveDJ === "Elizabeth") and else if (currentLiveDJ).
// Actually, wait, Elizabeth DJ can also process songs. Let's update the generic block.

const oldRequestLogic = `      } else {
        if (!currentRequestedSong) {
          currentRequestedSong = song;
          io.emit("queue_update", {
            queue: songQueue,
            current: currentRequestedSong,
          });
        } else {
          songQueue.push(song);
          io.emit("queue_update", {
            queue: songQueue,
            current: currentRequestedSong,
          });
        }
        socket.emit("dj_request_status", {
          id: song.id,
          status: "accepted",
          title: song.title,
        });
      }`;

const newRequestLogic = `      } else {
        if (!isBatchPlaying) {
            songQueue.push(song);
            if (songQueue.length === 20) {
                isBatchPlaying = true;
                currentRequestedSong = songQueue.shift();
                io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
                io.emit("receive_global", {
                    id: Date.now().toString(),
                    text: "¡Se han alcanzado los 20 pedidos! Comenzando la reproducción del bloque de canciones. 🎶",
                    sender: 'Elizabeth',
                    isAi: true
                });
            } else {
                io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
            }
        } else {
            if (songQueue.length >= 20) {
                return socket.emit("dj_request_status", {
                  id: song.id,
                  status: "rejected",
                  title: "La cola está llena (límite de 20 canciones).",
                });
            }
            songQueue.push(song);
            io.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
        }
        socket.emit("dj_request_status", {
          id: song.id,
          status: "accepted",
          title: song.title,
        });
      }`;
code = code.replace(oldRequestLogic, newRequestLogic);

// Also update the song_ended logic
const oldSongEnded = `      if (currentRequestedSong.id === data.id) {
        songHistory.unshift(currentRequestedSong);
        if (songHistory.length > 30) songHistory.pop();
        io.emit("radio_history_update", songHistory);
        if (songQueue.length > 0) {
          currentRequestedSong = songQueue.shift();
        } else {
          if (!currentLiveDJ) {
            songQueue.push(generateAutoSong());
            currentRequestedSong = songQueue.shift();
          } else {
            currentRequestedSong = null;
          }
        }
        io.emit("queue_update", {
          queue: songQueue,
          current: currentRequestedSong,
        });
      }`;

const newSongEnded = `      if (currentRequestedSong.id === data.id) {
        songHistory.unshift(currentRequestedSong);
        if (songHistory.length > 30) songHistory.pop();
        io.emit("radio_history_update", songHistory);
        if (songQueue.length > 0) {
          currentRequestedSong = songQueue.shift();
        } else {
          currentRequestedSong = null;
          isBatchPlaying = false;
          ensureAutoRadio(); // Se restablece al stream normal
        }
        io.emit("queue_update", {
          queue: songQueue,
          current: currentRequestedSong,
        });
      }`;
code = code.replace(oldSongEnded, newSongEnded);

// Elizabeth DJ mode
const oldEliLogic = `          if (resJson.accepted) {
            song.status = "accepted";
            song.announcementUrl = "";
            if (!currentRequestedSong) {
              currentRequestedSong = song;
              io.emit("queue_update", {
                queue: songQueue,
                current: currentRequestedSong,
              });
            } else {
              songQueue.push(song);
              io.emit("queue_update", {
                queue: songQueue,
                current: currentRequestedSong,
              });
            }`;

const newEliLogic = `          if (resJson.accepted) {
            song.status = "accepted";
            song.announcementUrl = "";
            if (!isBatchPlaying) {
                songQueue.push(song);
                if (songQueue.length === 20) {
                    isBatchPlaying = true;
                    currentRequestedSong = songQueue.shift();
                    io.emit("receive_global", {
                        id: Date.now().toString(),
                        text: "¡Se han alcanzado los 20 pedidos! Comenzando la reproducción del bloque. 🎶",
                        sender: 'Elizabeth',
                        isAi: true
                    });
                }
            } else {
                if (songQueue.length < 20) {
                    songQueue.push(song);
                }
            }
            io.emit("queue_update", {
                queue: songQueue,
                current: currentRequestedSong,
            });`;
code = code.replace(oldEliLogic, newEliLogic);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
