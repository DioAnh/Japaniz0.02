// backend/functions/generateImage.js
const fetch = require('node-fetch');
const FormData = require('form-data'); 

// --- CẤU HÌNH TỶ LỆ RƠI (DROP RATE) ---
const RARITY_POOL = [
  { name: 'Common', weight: 82 },      
  { name: 'Uncommon', weight: 16 },    
  { name: 'Rare', weight: 1.89 },        
  { name: 'Epic', weight: 0.1 },         
  { name: 'Legendary', weight: 0.01 },    
];

const ELEMENT_POOL = [
  { name: 'Ember', weight: 20 },
  { name: 'Crystal', weight: 20 },
  { name: 'Gold', weight: 20 },
  { name: 'Diamond', weight: 20 },
  { name: 'Cosmic', weight: 20 }, 
];

const RARITY_VISUALS = {
  'Common': 'simple clean background, minimal details',
  'Uncommon': 'geometric pattern background, soft decorative border',
  'Rare': 'sparkles around subject, glowing light effect, silver outlines',
  'Epic': 'magical aura, floating particles, vibrant intense colors, intricate frame',
  'Legendary': 'glorious golden halo, radiant holy light rays, majestic crown, royal background',
};

const ELEMENT_VISUALS = {
  'Ember': 'tiny cute flames, warm orange red tint, smoke puffs',
  'Crystal': 'floating ice crystals, cool blue cyan tint, jagged shapes',
  'Gold': 'shiny gold coins, metallic texture, yellow amber tint',
  'Diamond': 'sparkling diamond gems, bright white blue glowing edges, prismatic refraction',
  'Cosmic': 'deep space background, tiny stars, purple nebula swirls, galaxy texture',
};

// --- Helper: Chọn ngẫu nhiên ---
function pickRandomAttribute(pool) {
  let totalWeight = 0;
  pool.forEach(item => totalWeight += item.weight);
  let randomNum = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    if (randomNum < pool[i].weight) { return pool[i].name; }
    randomNum -= pool[i].weight;
  }
  return pool[0].name; 
}

// --- Helper: Upload Pinata ---
async function uploadToPinata(buffer) {
  const data = new FormData();
  data.append('file', buffer, { filename: 'japaniz-nft.png' });

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      ...data.getHeaders(),
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error('Pinata upload failed');
  }
  const result = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

// --- FALLBACK IMAGE (Dùng khi AI lỗi) ---
const FALLBACK_IMAGE_URL = "https://placehold.co/512x512/E8D5C4/A5907E?text=Japaniz%0AReward%20NFT%0A(Offline)";

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  // 1. Lấy thông tin topic
  let topic = "Japaniz Learning";
  try {
      const body = JSON.parse(event.body);
      topic = body.topic || topic;
  } catch (e) {
      console.error("JSON Parse error", e);
  }

  // 2. Config API Key (Dùng Hugging Face thay vì Google)
  const hfToken = process.env.HUGGINGFACE_API_KEY; // Nhớ thêm vào .env
  const pinataKey = process.env.PINATA_JWT;

  if (!hfToken || !pinataKey) {
    console.error("Missing API Keys");
    return { statusCode: 500, body: JSON.stringify({ error: 'Server config missing' }) };
  }

  // 3. Random thuộc tính
  const rarity = pickRandomAttribute(RARITY_POOL);
  const element = pickRandomAttribute(ELEMENT_POOL);
  const rarityVisual = RARITY_VISUALS[rarity];
  const elementVisual = ELEMENT_VISUALS[element];

  console.log(`Generating (HF): ${topic} | ${rarity} | ${element}`);

  // 4. Tạo Prompt (Tối ưu cho FLUX.1)
  const prompt = `
    (Kawaii sticker style:1.2), vector illustration of ${topic}. 
    ${rarityVisual}, ${elementVisual}.
    Cute, peaceful, pastel colors, white background, thick clean outlines, flat shading.
    Text "${rarity}" written at the bottom in bubbly font.
    Text "Element: ${element}" written small nearby.
    High quality, masterpiece.
  `;

  try {
    // --- GỌI HUGGING FACE API (FLUX.1-dev) ---
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    // Xử lý lỗi Quota hoặc lỗi Server từ HF
    if (!response.ok) {
        const errText = await response.text();
        console.error("Hugging Face Error:", errText);
        throw new Error(`HF API Failed: ${response.statusText}`);
    }

    // HF trả về trực tiếp Blob (Binary), ta chuyển sang Buffer
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // --- Upload Pinata ---
    const finalImageUrl = await uploadToPinata(imageBuffer);

    return {
      statusCode: 200,
      body: JSON.stringify({
        imageUrl: finalImageUrl,
        metadata: { rarity, element, topic }
      }),
    };

  } catch (error) {
    console.error("Generative Error:", error);
    
    // QUAN TRỌNG: Nếu lỗi, trả về ảnh Fallback + Metadata
    // Để Frontend vẫn hiện thông báo chúc mừng (dù ảnh là ảnh mặc định)
    return {
      statusCode: 200,
      body: JSON.stringify({
        imageUrl: FALLBACK_IMAGE_URL,
        metadata: { 
            rarity: rarity, // Vẫn trả về Rarity thật để user vui
            element: element,
            topic: topic,
            note: "AI generation limit reached, showing fallback image."
        }
      }),
    };
  }
};