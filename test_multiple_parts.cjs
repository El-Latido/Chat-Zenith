const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
(async () => {
  try {
     const res = await ai.models.generateContent({
         model: "gemini-3.6-flash",
         contents: [{ text: "Hola" }, { text: "amigo" }],
     });
     console.log(res.text);
  } catch (e) {
     console.error(e);
  }
})();
