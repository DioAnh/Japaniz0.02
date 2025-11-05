// backend/functions/getElevenLabsTTS.js

// ID giọng nói tiếng Nhật (Ví dụ: "Mizuki")
// Bạn có thể thay đổi ID này nếu muốn
const VOICE_ID = "WQz3clzUdMqvBf0jswZQ";
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { textToSpeak } = JSON.parse(event.body);
    if (!textToSpeak) {
      return { statusCode: 400, body: "Missing 'textToSpeak'" };
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: textToSpeak,
        model_id: "eleven_multilingual_v2", // Model hỗ trợ tiếng Nhật
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.65,
          speed: 0.75,  // 0.75 đến 1.2
          style: 0.15
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi API ElevenLabs: ${response.statusText}`);
    }

    // 1. API ElevenLabs trả về file audio/mpeg (MP3)
    // 2. Chuyển nó sang ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // 3. Chuyển ArrayBuffer sang Base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const mimeType = "audio/mpeg";

    // 4. Trả về Base64 cho frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        base64Audio: base64Audio,
        mimeType: mimeType 
      }),
    };

  } catch (error) {
    console.error("Lỗi ElevenLabs function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};