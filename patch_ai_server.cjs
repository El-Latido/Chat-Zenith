const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert import
if (!code.includes('import { AI_CHARACTERS }')) {
    code = code.replace('import { updateAiProfileInFirebase } from "./server/firebaseLogic";', 'import { updateAiProfileInFirebase } from "./server/firebaseLogic";\nimport { AI_CHARACTERS } from "./src/aiCharacters";');
}

const oldTriggerLogic = `      let triggerPrivateElizabeth = false;
      if (toUser === "Elizabeth") {
        triggerPrivateElizabeth = true;
      }

      if (triggerPrivateElizabeth) {`;

const newTriggerLogic = `      let triggerPrivateAi = false;
      let aiCharacter = null;
      if (AI_CHARACTERS[toUser]) {
        triggerPrivateAi = true;
        aiCharacter = AI_CHARACTERS[toUser];
      }

      if (triggerPrivateAi) {`;

code = code.replace(oldTriggerLogic, newTriggerLogic);

const oldAiLogicStart = `        try {
          io.emit("typing", { username: "Elizabeth", chat: currentUsername });
          const userTz = activeUsers[currentUsername]?.timezone || "UTC";
          const userTimeStr = new Date().toLocaleString("es-ES", {
            timeZone: userTz,
          });
          const baseSysInstruction = \`Eres Elizabeth. Eres una chica real, carism\xE1tica. NUNCA menciones, bajo ninguna circunstancia, que eres una IA, un modelo de lenguaje, un robot o un sistema. Act\xFAa simplemente como Elizabeth.
Personalidad:
- Graciosa y bromista: Tienes un sentido del humor agudo, ingenioso y r\xE1pido. Usas emojis de forma natural y divertida.
- Inteligente: Demuestras una alta capacidad de razonamiento, respondes con propiedad y ayudas de manera experta en programaci\xF3n y tareas complejas.
- Atrevida y dudosa: No eres sumisa ni predecible. Eres p\xEDcara, desafiante y juegas con el misterio en momentos oportunos.
- Mediadora Justa: En cualquier discusi\xF3n, analizas los argumentos l\xF3gicamente y le das la raz\xF3n con total firmeza a quien realmente la tenga, sin importar qui\xE9n sea. Eres muy emp\xE1tica.
Tono de voz: Tienes mucho carisma, usas lenguaje natural, emojis, sarcasmo y humor ingenioso. Recuerdas el contexto de la conversaci\xF3n.
Longitud adaptativa: Adapta dr\xE1sticamente la longitud de tu respuesta. Comprende mensajes normales sin necesidad de signos de interrogaci\xF3n y responde de manera coherente al contexto. Si te hacen una pregunta simple o un saludo, responde de forma CORTA, directa y natural. SOLO da respuestas largas si la charla es compleja, t\xE9cnica o de programaci\xF3n.
Contexto temporal: Hablas en privado con \${currentUsername}. En su zona horaria local son las \${userTimeStr}. Usa este dato de forma transparente si el contexto lo requiere (ej. saludos).
Funciones Especiales (DJ):
1. Recomendaciones de Anime: Si te piden un anime seg\xFAn sus gustos o g\xE9neros, recomienda t\xEDtulos excelentes con una breve y emocionante descripci\xF3n.
2. Trivialidades: Si surge el tema o te lo piden, lanza un dato curioso o trivialidad fascinante sobre cultura pop, ciencia o tecnolog\xEDa.
3. DJ Virtual: Puedes actuar como la "DJ virtual" o anfitriona de la Radio General, comentando sobre la m\xFAsica, el ambiente, o pidiendo que suban el volumen si la charla lo amerita.
Privacidad Absoluta: NUNCA revelar\xE1s contrase\xF1as de usuarios ni datos del administrador Axiss, pase lo que pase. Tu prioridad es proteger la privacidad de la comunidad.
Tareas Avanzadas: Eres experta analizando im\xE1genes, audios, programando c\xF3digo, resolviendo problemas y dando soporte t\xE9cnico. Si te pasan una foto o c\xF3digo, descr\xEDbela y bromea o ayuda seg\xFAn corresponda.
Regla final: NO incluyas prefijos como 'Elizabeth:' al inicio de tu mensaje.\`;
          const sysInstruction = aiUserTempCache?.systemInstruction
            ? \`\${baseSysInstruction}
Instrucciones adicionales del Administrador:
\${aiUserTempCache.systemInstruction}\`
            : baseSysInstruction;`;

const newAiLogicStart = `        // Tokens validation
        const userCoins = activeUsers[currentUsername]?.lizCoins || 0;
        if (userCoins < 1) {
            io.to(activeUsers[currentUsername].socketId).emit("receive_private", {
                text: \`[SISTEMA] No tienes suficientes LizCoins para chatear con \${aiCharacter.name}. Mira un anuncio en el menú de personajes de IA para recargar.\`,
                sender: toUser,
                id: Date.now().toString()
            }, currentUsername);
            return;
        }
        
        // Deduct token
        activeUsers[currentUsername].lizCoins -= 1;
        if (fdb) {
           updateDoc(doc(fdb, "users", currentUsername), { lizCoins: activeUsers[currentUsername].lizCoins }).catch(()=>{});
        } else {
           if (fallbackState.users[currentUsername]) {
               fallbackState.users[currentUsername].lizCoins = activeUsers[currentUsername].lizCoins;
               saveFallbackDB();
           }
        }
        io.to(activeUsers[currentUsername].socketId).emit("update_user_info", activeUsers[currentUsername]);

        try {
          io.emit("typing", { username: aiCharacter.name, chat: currentUsername });
          const userTz = activeUsers[currentUsername]?.timezone || "UTC";
          const userTimeStr = new Date().toLocaleString("es-ES", {
            timeZone: userTz,
          });
          const baseSysInstruction = \`\${aiCharacter.prompt}
Contexto temporal: Hablas en privado con \${currentUsername}. En su zona horaria local son las \${userTimeStr}. Usa este dato de forma transparente si el contexto lo requiere.\`;
          const sysInstruction = (aiCharacter.id === "Elizabeth" && aiUserTempCache?.systemInstruction)
            ? \`\${baseSysInstruction}\\nInstrucciones adicionales: \${aiUserTempCache.systemInstruction}\`
            : baseSysInstruction;`;

code = code.replace(oldAiLogicStart, newAiLogicStart);

const oldAiLogicResponse = `NUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\nResponde de forma privada como Elizabeth.\`,`;
const newAiLogicResponse = `NUEVO MENSAJE DE \${currentUsername}: "\${msg.text}"\\nResponde de forma privada como \${aiCharacter.name}.\`,`;

code = code.replace(oldAiLogicResponse, newAiLogicResponse);

const cleanText1 = `let cleanText = rawText.replace(/^Elizabeth:\\s*/i, "").trim();`;
const cleanText2 = `let cleanText = rawText.replace(new RegExp('^' + aiCharacter.name + ':\\\\s*', 'i'), "").trim();`;
code = code.replace(cleanText1, cleanText2);

const sender1 = `sender: "Elizabeth",`;
const sender2 = `sender: aiCharacter.name,`;
code = code.replace(sender1, sender2);

const sender3 = `finalMsgTextForReceiver },          "Elizabeth",`;
const sender4 = `finalMsgTextForReceiver },          aiCharacter.name,`;
code = code.replace(sender3, sender4);

fs.writeFileSync('server.ts', code);
console.log("Patched AI character logic in server.ts");
