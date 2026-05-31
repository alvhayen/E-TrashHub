import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Pengecekan API Key saat startup (ketika modul di-load)
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY tidak ditemukan di environment variables. Fitur AI akan gagal jika tidak diatur.');
}

// Daftar kategori yang PERSIS sama dengan yang dipakai di form RequestPickup.tsx
// Ini adalah sumber kebenaran tunggal (single source of truth)
const VALID_CATEGORY_MAP = {
  'botol-plastik': 'Botol Plastik',
  'gelas-plastik': 'Gelas Plastik',
  'kertas-kardus': 'Kertas/Kardus',
  'logam-kaleng': 'Logam/Kaleng',
  'tutup-botol': 'Tutup Botol',
  'kain-tekstil': 'Kain/Tekstil',
  'lainnya': 'Lainnya'
};

const WASTE_CATEGORIES_PROMPT = `
Kategori sampah yang tersedia (WAJIB gunakan PERSIS salah satu dari daftar ini):

| slug           | categoryLabel   | estimasi poin/kg | berat per pcs |
|----------------|-----------------|------------------|---------------|
| botol-plastik  | Botol Plastik   | 50               | 0.05 kg       |
| gelas-plastik  | Gelas Plastik   | 40               | 0.02 kg       |
| kertas-kardus  | Kertas/Kardus   | 30               | 0.10 kg       |
| logam-kaleng   | Logam/Kaleng    | 60               | 0.05 kg       |
| tutup-botol    | Tutup Botol     | 35               | 0.005 kg      |
| kain-tekstil   | Kain/Tekstil    | 25               | 0.20 kg       |
| lainnya        | Lainnya         | 20               | 0.10 kg       |

Aturan estimasi berat total (WAJIB isi PERSIS salah satu):
- "Ringan" jika total < 2 kg
- "Sedang" jika total 2–5 kg
- "Berat" jika total > 5 kg
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

    const prompt = `
Kamu adalah asisten AI untuk aplikasi e-TrashHub di Kota Balikpapan.
SEMUA respons WAJIB dalam Bahasa Indonesia.
Analisis gambar sampah ini dan kembalikan HANYA JSON valid.

${WASTE_CATEGORIES_PROMPT}

TUGAS:
1. Identifikasi SETIAP item sampah yang terlihat di gambar. Hitung jumlahnya.
2. Untuk setiap item, isi field "category" dengan slug dari tabel di atas, dan "categoryLabel" dengan nama kategorinya PERSIS dari tabel.
3. Jika item tidak cocok dengan kategori manapun, gunakan slug "lainnya" dan categoryLabel "Lainnya".
4. Hitung estimasi berat total: jumlah item × berat per pcs, lalu tentukan "estimatedWeight" (HANYA boleh "Ringan", "Sedang", atau "Berat").
5. Hitung "estimatedPoints": total berat tiap kategori × poin/kg, bulatkan ke integer.
6. Isi "sortingTips" dengan tips singkat memilah sampah (dalam Bahasa Indonesia).
7. Isi "environmentalMessage" dengan pesan motivasi lingkungan singkat (dalam Bahasa Indonesia).
8. Isi "isRecyclable" true jika mayoritas sampah bisa didaur ulang.
9. Jika gambar bukan sampah atau tidak jelas, isi "warningNote" dengan peringatan. Jika jelas, isi string kosong "".

CONTOH OUTPUT YANG BENAR:
{
  "detectedItems": [
    {"name": "Botol air mineral bekas", "category": "botol-plastik", "categoryLabel": "Botol Plastik", "confidence": 0.95},
    {"name": "Kaleng minuman", "category": "logam-kaleng", "categoryLabel": "Logam/Kaleng", "confidence": 0.88}
  ],
  "estimatedWeight": "Ringan",
  "estimatedPoints": 8,
  "sortingTips": "Bilas botol dan kaleng sebelum dibuang. Pisahkan tutup botol dari botolnya.",
  "environmentalMessage": "Dengan mendaur ulang, kamu membantu mengurangi sampah di TPA Balikpapan!",
  "isRecyclable": true,
  "warningNote": ""
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
            },
            required: ["name", "category", "categoryLabel", "confidence"]
          }
        },
        estimatedWeight: { type: "STRING" },
        estimatedPoints: { type: "INTEGER" },
        sortingTips: { type: "STRING" },
        environmentalMessage: { type: "STRING" },
        isRecyclable: { type: "BOOLEAN" },
        warningNote: { type: "STRING" }
      },
      required: ["detectedItems", "estimatedWeight", "estimatedPoints", "sortingTips", "environmentalMessage", "isRecyclable", "warningNote"]
    };

    let response;
    let usedModel = 'gemini-2.5-flash';

    const callGemini = async (modelName) => {
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
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      return Promise.race([apiPromise, timeoutPromise]);
    };

    try {
      response = await callGemini(usedModel);
    } catch (modelError) {
      const errMsg = modelError.message || '';
      
      if (errMsg.includes('429') || modelError.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.error(`[AI API] Error 429 Quota Exceeded/Rate Limit pada model ${usedModel}`);
        return res.status(429).json({ error: 'Layanan AI sedang penuh atau kuota harian telah habis. Silakan coba lagi beberapa saat lagi.' });
      }

      if (errMsg === 'TIMEOUT') {
        console.error(`[AI API] Timeout saat memanggil model ${usedModel}`);
        return res.status(504).json({ error: 'Waktu tunggu layanan AI habis. Silakan coba lagi.' });
      }

      // Fallback ke gemini-2.0-flash-lite jika unavailable
      if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || modelError.status === 503) {
        console.warn(`[AI API] ${usedModel} unavailable, mencoba fallback ke gemini-2.0-flash-lite...`);
        usedModel = 'gemini-2.0-flash-lite';
        try {
          response = await callGemini(usedModel);
        } catch (fallbackError) {
          const fallbackErrMsg = fallbackError.message || '';
          if (fallbackErrMsg.includes('429') || fallbackError.status === 429 || fallbackErrMsg.includes('RESOURCE_EXHAUSTED')) {
            return res.status(429).json({ error: 'Layanan AI sedang penuh atau kuota harian telah habis. Silakan coba lagi beberapa saat lagi.' });
          }
          throw fallbackError;
        }
      } else {
        throw modelError;
      }
    }

    // Parsing Response
    let rawText = response.text?.trim() || '';
    const tokenUsage = response.usageMetadata;
    console.log(`[AI API] Model ${usedModel} berhasil. Tokens → Prompt: ${tokenUsage?.promptTokenCount || 0}, Output: ${tokenUsage?.candidatesTokenCount || 0}, Total: ${tokenUsage?.totalTokenCount || 0}`);

    if (!rawText) {
      return res.status(500).json({ error: 'Gemini tidak memberikan respons. Coba lagi.' });
    }

    // Bersihkan markdown wrapper jika ada
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[AI API] Gagal memparsing JSON. Raw text:', rawText);
      fs.promises.appendFile('ai-parse-error.log', `[${new Date().toISOString()}] Parse Error:\n${rawText}\n\n`).catch(() => {});
      return res.status(500).json({ error: 'Gagal memproses respons AI karena format yang diberikan tidak valid.' });
    }

    // ====== POST-PROCESSING: Normalisasi output AI ======
    // Ini PENTING karena AI bisa saja mengembalikan categoryLabel yang sedikit berbeda

    if (analysisResult.detectedItems && Array.isArray(analysisResult.detectedItems)) {
      analysisResult.detectedItems = analysisResult.detectedItems.map(item => {
        // Normalisasi category slug
        let normalizedSlug = (item.category || '').toLowerCase().trim();
        let normalizedLabel = VALID_CATEGORY_MAP[normalizedSlug];

        // Jika slug tidak cocok, coba fuzzy match dari categoryLabel
        if (!normalizedLabel) {
          const labelLower = (item.categoryLabel || '').toLowerCase();
          for (const [slug, label] of Object.entries(VALID_CATEGORY_MAP)) {
            if (labelLower.includes(slug.replace('-', ' ')) || 
                labelLower.includes(label.toLowerCase()) ||
                label.toLowerCase().includes(labelLower)) {
              normalizedSlug = slug;
              normalizedLabel = label;
              break;
            }
          }
        }

        // Jika masih tidak cocok, klasifikasikan sebagai "Lainnya"
        if (!normalizedLabel) {
          normalizedSlug = 'lainnya';
          normalizedLabel = 'Lainnya';
        }

        return {
          ...item,
          category: normalizedSlug,
          categoryLabel: normalizedLabel,
          confidence: typeof item.confidence === 'number' ? Math.min(1, Math.max(0, item.confidence)) : 0.5
        };
      });
    }

    // Normalisasi estimatedWeight
    const weightLower = (analysisResult.estimatedWeight || '').toLowerCase();
    if (weightLower.includes('ringan') || weightLower.includes('light')) {
      analysisResult.estimatedWeight = 'Ringan';
    } else if (weightLower.includes('berat') || weightLower.includes('heavy')) {
      analysisResult.estimatedWeight = 'Berat';
    } else {
      // Default: Sedang (jika AI mengirimkan nilai aneh seperti "90g")
      analysisResult.estimatedWeight = 'Sedang';
    }

    // Pastikan estimatedPoints adalah angka
    if (typeof analysisResult.estimatedPoints !== 'number' || isNaN(analysisResult.estimatedPoints)) {
      analysisResult.estimatedPoints = 0;
    }

    // Pastikan field lain ada
    analysisResult.sortingTips = analysisResult.sortingTips || 'Pisahkan sampah berdasarkan jenisnya sebelum dibuang.';
    analysisResult.environmentalMessage = analysisResult.environmentalMessage || 'Setiap langkah kecil membantu menjaga lingkungan!';
    analysisResult.isRecyclable = typeof analysisResult.isRecyclable === 'boolean' ? analysisResult.isRecyclable : true;
    analysisResult.warningNote = analysisResult.warningNote || '';

    console.log('[AI API] Hasil akhir setelah normalisasi:', JSON.stringify(analysisResult, null, 2));

    res.json({ success: true, analysis: analysisResult });

  } catch (error) {
    console.error('[AI API] Kesalahan Sistem analyzeWaste:', error);
    fs.promises.appendFile('error.log', `[${new Date().toISOString()}] ${error.stack}\n`).catch(() => {});
    
    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({ error: 'Gambar tidak dapat diproses karena alasan kebijakan keamanan.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menganalisis gambar dengan AI. Detail: ' + error.message });
  }
};
