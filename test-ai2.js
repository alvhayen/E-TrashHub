import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const WASTE_CATEGORIES_CONTEXT = `
Kategori sampah yang tersedia di sistem e-TrashHub (Regional Kota Balikpapan):
- Botol Plastik (slug: botol-plastik) — estimasi poin: 50/kg
- Gelas Plastik (slug: gelas-plastik) — estimasi poin: 40/kg
`;

const prompt = `
Kamu adalah asisten pengelolaan sampah cerdas untuk aplikasi e-TrashHub wilayah Kota Balikpapan.
Analisis gambar sampah yang diberikan dan berikan respons HANYA dalam format JSON.

${WASTE_CATEGORIES_CONTEXT}

Format respons JSON yang diwajibkan:
{
  "detectedItems": [
    {
      "name": "Nama sampah yang terdeteksi",
      "category": "slug-kategori-dari-sistem",
      "categoryLabel": "Label kategori untuk ditampilkan",
      "confidence": 0.95
    }
  ],
  "estimatedWeight": "Ringan",
  "estimatedPoints": 75,
  "sortingTips": "Tips singkat tentang cara menyortir sampah ini.",
  "environmentalMessage": "Pesan motivasi singkat.",
  "isRecyclable": true,
  "warningNote": null
}
`.trim();

// 1x1 transparent png
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageBase64 } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2, 
      maxOutputTokens: 1024,
    }
  });

  const rawText = response.text;
  console.log("RAW TEXT:\n", rawText);
}

test();
