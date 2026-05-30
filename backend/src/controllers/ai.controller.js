import { GoogleGenAI } from '@google/genai';

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

Sistem poin: 50 poin per kg + bonus 50 poin setiap kelipatan 5 kg.
`;

export const analyzeWaste = async (req, res) => {
  // Pengecekan API Key agar tidak terjadi error API_KEY di tengah jalan
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
        temperature: 0.2, 
        maxOutputTokens: 1024,
      }
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return res.status(500).json({ error: 'Gemini tidak memberikan respons. Coba lagi.' });
    }

    let analysisResult;
    try {
      let cleanText = rawText;
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      analysisResult = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('Failed to parse JSON. Raw text was:', rawText);
      return res.status(500).json({ error: 'Gagal memproses respons AI. Format tidak sesuai JSON.' });
    }

    res.json({ success: true, analysis: analysisResult });

  } catch (error) {
    console.error('analyzeWaste error:', error);
    // Log error to a file so we can inspect it
    import('fs').then(fs => fs.appendFileSync('error.log', new Date().toISOString() + ' ' + error.stack + '\n'));
    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({ error: 'Gambar tidak dapat diproses karena alasan keamanan.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menganalisis gambar dengan AI. Detail: ' + error.message });
  }
};
