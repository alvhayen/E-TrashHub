import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Pengecekan API Key saat startup (ketika modul di-load)
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY tidak ditemukan di environment variables. Fitur AI akan gagal jika tidak diatur.');
}

// Daftar kategori sampah yang ada di sistem e-TrashHub
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
`;

export const analyzeWaste = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Konfigurasi API AI bermasalah. Admin belum memasukkan GEMINI_API_KEY di .env backend.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Gambar diperlukan' });
    }

    if (imageBase64.length > 5_500_000) {
      return res.status(400).json({ error: 'Ukuran gambar terlalu besar. Maksimal 4MB.' });
    }

    // Prompt yang lebih tegas agar AI hanya mengeluarkan JSON dan jika ragu beri confidence rendah.
    const prompt = `
Anda adalah asisten AI e-TrashHub wilayah Kota Balikpapan. Analisis gambar sampah ini dan KEMBALIKAN HANYA JSON VALID. DILARANG menggunakan markdown, DILARANG memberikan penjelasan tambahan.
Jika gambar tidak jelas atau Anda tidak yakin itu sampah, KEMBALIKAN JSON VALID dengan nilai confidence rendah (<0.5).

${WASTE_CATEGORIES_CONTEXT}

Tugas:
1. Identifikasi sampah di gambar.
2. Cocokkan dengan kategori sistem yang tersedia.
3. Estimasi berat dalam satuan Kg (angka desimal).
4. Tentukan apakah bisa didaur ulang.
`.trim();

    // Schema dipangkas sesuai permintaan agar tidak memakan token dan rentan kepotong (truncation)
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
              estimatedWeightKg: { type: "NUMBER" },
              recyclable: { type: "BOOLEAN" },
              confidence: { type: "NUMBER" }
            }
          }
        },
        overallConfidence: { type: "NUMBER" }
      }
    };

    let response;
    let usedModel = 'gemini-2.5-flash';

    // Fungsi wrapper untuk memanggil API Gemini beserta Timeout
    const callGemini = async (modelName) => {
      // Timeout 30 detik untuk menghindari request menggantung lama
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 30000)
      );

      const apiPromise = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: mimeType, data: imageBase64 } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json', // Paksa response format JSON langsung dari API
          responseSchema: responseSchema,
          temperature: 0.1 // Diperkecil agar hasil JSON lebih deterministik & konsisten
        }
      });

      return Promise.race([apiPromise, timeoutPromise]);
    };

    try {
      response = await callGemini(usedModel);
    } catch (modelError) {
      const errMsg = modelError.message || '';
      
      // Penanganan 429 (Quota Exceeded / Rate Limit) yang benar, jangan fallback karena pasti gagal juga
      if (errMsg.includes('429') || modelError.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.error(`[AI API] Error 429 Quota Exceeded/Rate Limit pada model ${usedModel}`);
        return res.status(429).json({ error: 'Layanan AI sedang penuh atau kuota harian telah habis. Silakan coba lagi beberapa saat lagi.' });
      }

      // Penanganan Timeout
      if (errMsg === 'TIMEOUT') {
        console.error(`[AI API] Timeout saat memanggil model ${usedModel}`);
        return res.status(504).json({ error: 'Waktu tunggu layanan AI habis. Silakan coba lagi.' });
      }

      // Hanya fallback ke model 2.0-flash JIKA terjadi error 503/UNAVAILABLE
      if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || modelError.status === 503) {
        console.warn(`[AI API] ${usedModel} unavailable, mencoba fallback ke gemini-2.0-flash...`);
        usedModel = 'gemini-2.0-flash';
        try {
          response = await callGemini(usedModel);
        } catch (fallbackError) {
          const fallbackErrMsg = fallbackError.message || '';
          if (fallbackErrMsg.includes('429') || fallbackError.status === 429 || fallbackErrMsg.includes('RESOURCE_EXHAUSTED')) {
            console.error(`[AI API Fallback] Error 429 Quota Exceeded pada model ${usedModel}`);
            return res.status(429).json({ error: 'Layanan AI sedang penuh atau kuota harian telah habis. Silakan coba lagi beberapa saat lagi.' });
          }
          throw fallbackError; // Jika bukan 429, lempar error untuk ditangkap di luar
        }
      } else {
        throw modelError; // Jika error bukan 429 dan bukan 503, langsung lempar
      }
    }

    // Parsing Response dan Usage Logging
    let rawText = response.text?.trim() || '';
    const tokenUsage = response.usageMetadata;
    console.log(`[AI API] Berhasil menggunakan model ${usedModel}. Tokens -> Prompt: ${tokenUsage?.promptTokenCount || 0}, Output: ${tokenUsage?.candidatesTokenCount || 0}, Total: ${tokenUsage?.totalTokenCount || 0}`);

    if (!rawText) {
      return res.status(500).json({ error: 'Gemini tidak memberikan respons. Coba lagi.' });
    }

    // Mencegah error parsing karena markdown (fallback jika API masih bandel)
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[AI API] Gagal memparsing JSON. Raw text:', rawText);
      // Simpan log secara asinkron agar tidak memblokir thread
      fs.promises.appendFile('ai-parse-error.log', `[${new Date().toISOString()}] Parse Error:\n${rawText}\n\n`).catch(() => {});
      return res.status(500).json({ error: 'Gagal memproses respons AI karena format yang diberikan tidak valid.' });
    }

    res.json({ success: true, analysis: analysisResult });

  } catch (error) {
    console.error('[AI API] Kesalahan Sistem analyzeWaste:', error);
    // Simpan error log secara asinkron
    fs.promises.appendFile('error.log', `[${new Date().toISOString()}] ${error.stack}\n`).catch(() => {});
    
    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({ error: 'Gambar tidak dapat diproses karena alasan kebijakan keamanan.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menganalisis gambar dengan AI. Detail: ' + error.message });
  }
};
