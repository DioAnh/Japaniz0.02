// backend/functions/evaluatePronunciation.js
const { GoogleGenAI, Type } = require("@google/genai");

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Định nghĩa JSON Schema (giống hệt code của bạn)
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { 
      type: Type.BOOLEAN,
      description: 'Là true nếu phát âm đúng, false nếu sai.'
    },
    feedback: { 
      type: Type.STRING,
      description: 'Một câu nhận xét ngắn gọn bằng tiếng Việt cho người học. Luôn phải có nội dung, không được để trống. Nếu sai, hãy giải thích lỗi sai.'
    }
  },
  required: ['isCorrect', 'feedback']
};

const systemInstruction = "Bạn là một người bạn hỗ trợ dạy phát âm tiếng Nhật chuyên nghiệp cho người Việt. Nhiệm vụ của bạn là đánh giá cách phát âm của người học trực tiếp từ file âm thanh họ cung cấp.";

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Lấy dữ liệu từ frontend
    const { audioBase64, japaneseWord, hiraganaWord, romajiWord } = JSON.parse(event.body);

    if (!audioBase64 || !japaneseWord || !romajiWord || !hiraganaWord) {
      return { statusCode: 400, body: "Missing required data" };
    }

    // 2. Tạo prompt (chuyển từ frontend ra backend)
    const prompt = `
      Người học đang tập phát âm từ sau:
      - Cách viết (Kanji): "${japaneseWord}"
      - Cách đọc (Hiragana): "${hiraganaWord}"
      - Romaji: "${romajiWord}"

      Yêu cầu:
      1.  **Đánh giá:** Xác định xem phát âm có đúng hay không.
      2.  **Nhận xét:**
          * Nếu đúng: Viết một lời khen ngắn gọn, động viên bằng tiếng Việt. Ví dụ: "Chính xác!", "Phát âm rất chuẩn!".
          * Nếu sai: Chỉ ra lỗi sai cụ thể và hướng dẫn cách sửa. Lời nhận xét phải mang tính xây dựng và ngắn gọn.
      3.  **Quan trọng:** Lời nhận xét không bao giờ được để trống.

      Trả lời bằng tiếng Việt và tuân thủ định dạng JSON sau đây, không thêm bất kỳ định dạng markdown nào:
    `;

    // 3. Tạo các 'part' cho API
    const audioPart = {
      inlineData: {
        mimeType: 'audio/webm', // Giữ nguyên mimeType từ frontend
        data: audioBase64
      }
    };
    const textPart = { text: prompt };

    // 4. Gọi Gemini API (giống hệt code của bạn)
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, audioPart] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });
    
    // 5. Trả kết quả JSON về cho frontend
    // response.text đã là một chuỗi JSON hợp lệ do responseSchema
    return {
      statusCode: 200,
      body: response.text, 
    };

  } catch (error) {
    console.error("Lỗi evaluate function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};