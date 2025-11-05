// backend/functions/getTextToSpeech.js
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo model với API Key từ biến môi trường của Netlify
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Lấy văn bản cần đọc từ frontend
    const { textToSpeak } = JSON.parse(event.body);

    if (!textToSpeak) {
      return { statusCode: 400, body: "Missing 'textToSpeak' in body" };
    }

    // 2. Gọi Gemini API (giống hệt code của bạn)
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("API không trả về dữ liệu âm thanh.");
    }

    // 3. Trả dữ liệu âm thanh về cho frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ base64Audio: base64Audio }),
    };

  } catch (error) {
    console.error("Lỗi TTS function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};