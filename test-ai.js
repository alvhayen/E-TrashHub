import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const WASTE_CATEGORIES_CONTEXT = `
Kategori sampah yang tersedia di sistem e-TrashHub (Regional Kota Balikpapan):
- Botol Plastik (slug: botol-plastik) — estimasi poin: 50/kg
- Gelas Plastik (slug: gelas-plastik) — estimasi poin: 40/kg
- Kertas & Kardus (slug: kertas-kardus) — estimasi poin: 30/kg
- Logam & Kaleng (slug: logam-kaleng) — estimasi poin: 60/kg
- Tutup Botol (slug: tutup-botol) — estimasi poin: 35/kg
- Kain & Tekstil (slug: kain-tekstil) — estimasi poin: 25/kg

Panduan estimasi berat:
- "Ringan": < 2 kg
- "Sedang": 2–5 kg
- "Berat": > 5 kg

Sistem poin: 50 poin per kg + bonus 50 poin setiap kelipatan 5 kg.
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

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2, 
      maxOutputTokens: 1024,
    }
  });

  const rawText = response.text;
  console.log("RAW TEXT:\n", rawText);
  try {
    let cleanText = rawText.trim();
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (match) {
      cleanText = match[1].trim();
    } else {
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
    }
    console.log("CLEAN TEXT:\n", cleanText);
    JSON.parse(cleanText);
    console.log("JSON Parse: SUCCESS");
  } catch (e) {
    console.error("JSON Parse: FAILED ->", e.message);
  }
}

test();
