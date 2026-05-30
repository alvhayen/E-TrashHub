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

Tugas:
1. Identifikasi jenis-jenis sampah yang terlihat di gambar
2. Cocokkan dengan kategori yang tersedia di sistem
3. Estimasi berat total berdasarkan volume yang terlihat
4. Berikan tips sorting yang relevan
5. Hitung estimasi poin yang akan didapat

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

const responseSchema = {
  type: "OBJECT",
  properties: {
    detectedItems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: { type: "STRING" },
          categoryLabel: { type: "STRING" },
          confidence: { type: "NUMBER" }
        }
      }
    },
    estimatedWeight: { type: "STRING" },
    estimatedPoints: { type: "NUMBER" },
    sortingTips: { type: "STRING" },
    environmentalMessage: { type: "STRING" },
    isRecyclable: { type: "BOOLEAN" },
    warningNote: { type: "STRING", nullable: true }
  }
};

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  });

  console.log("RAW TEXT:\n", response.text);
}

test();
