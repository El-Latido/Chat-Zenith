const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
(async () => {
  try {
     let parts = [{ text: "Hello from parts" }];
     const res = await ai.models.generateContent({
         model: "gemini-3.6-flash",
         contents: parts,
     });
     console.log("Success:", res.text);
  } catch (e) {
     console.error("Failed:", e);
  }
})();
