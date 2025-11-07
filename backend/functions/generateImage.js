// backend/functions/generateImage.js
const fetch = require('node-fetch');
const FormData = require('form-data'); 

// --- Helper: Chuyển Base64 (từ Gemini) sang Buffer (cho Pinata) ---
function base64ToBuffer(base64) {
  const b64string = base64.split(';base64,').pop();
  return Buffer.from(b64string, 'base64');
}

// --- Helper: Tải ảnh lên Pinata (IPFS) ---
async function uploadToPinata(buffer) {
  const data = new FormData();
  data.append('file', buffer, { filename: 'japaniz-nft.png' });

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      // --- SỬA LỖI Ở ĐÂY: Thêm headers của FormData ---
      ...data.getHeaders(),
    },
    body: data,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LỖI THỰC TẾ TỪ PINATA:', errorText);
    throw new Error('Pinata upload failed');
  }

  const result = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

// --- FALLBACK IMAGE (Giữ nguyên) ---
const FALLBACK_IMAGE_URL = "https://placehold.co/512x512/E8D5C4/A5907E?text=Japaniz%0AReward%20NFT%0A(AI%20Offline)";

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { topic } = JSON.parse(event.body);
  if (!topic) {
    return { statusCode: 400, body: 'Missing topic' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const pinataKey = process.env.PINATA_JWT;

  if (!apiKey || !pinataKey) {
    return { statusCode: 500, body: 'API keys not configured' };
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
  const prompt = `Generate a 2D vector illustration, 'kawaii' art style, clean outlines, soft pastel color palette, simple flat shading. Theme: "${topic}". The scene must be cheerful, peaceful, and strictly family-friendly.`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE']
    },
  };

  try {
    // --- BƯỚC 1: Gọi Gemini để tạo ảnh ---
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('LỖI THỰC TẾ TỪ GEMINI:', errorText); 
      throw new Error('Gemini API failed (check log for details)');
    }

    const result = await apiResponse.json();
    const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (!base64Data) {
      throw new Error('No image data from Gemini');
    }

    const fullBase64String = `data:image/png;base64,${base64Data}`;
    
    // --- BƯỚC 2: Tải ảnh lên IPFS qua Pinata ---
    const imageBuffer = base64ToBuffer(fullBase64String);
    const finalImageUrl = await uploadToPinata(imageBuffer); 

    // --- BƯỚC 3: Trả về link IPFS ngắn ---
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: finalImageUrl }), 
    };

  } catch (error) {
    console.error('Error in function:', error);
    return {
      statusCode: 200, 
      body: JSON.stringify({ imageUrl: FALLBACK_IMAGE_URL }),
    };
  }
};