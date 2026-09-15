const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add request_translation handler
const socketOnRegex = /socket\.on\("disconnect", \(\) => \{/;
code = code.replace(socketOnRegex, `socket.on("request_translation", async ({ text, targetLang }, callback) => {
    if (!text || !targetLang) return callback({ translatedText: text });
    const cacheKey = \`trans_\${targetLang}_\${text}\`;
    if (translationCache.has(cacheKey)) {
        return callback({ translatedText: translationCache.get(cacheKey) });
    }
    try {
        const resp = await safeGenerateContent(ai, {
            model: "gemini-3.6-flash",
            contents: \`Traduce esto al idioma/país: \${targetLang}. Solo devuelve la traducción directa, sin comillas, sin explicaciones.\\nTexto: \${text}\`
        });
        let translatedText = resp.text ? resp.text.trim() : text;
        translationCache.set(cacheKey, translatedText);
        callback({ translatedText });
    } catch (e) {
        callback({ translatedText: text });
    }
});

    socket.on("disconnect", () => {`);

// Also save senderLanguage in global_chat addDoc
code = code.replace(/msg\.senderId = currentUsername;/g, `msg.senderId = currentUsername;
      msg.senderLanguage = activeUsers[currentUsername]?.pais_idioma || "es";`);

fs.writeFileSync('server.ts', code);
console.log("Updated server with request_translation");
