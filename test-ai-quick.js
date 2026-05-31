import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  console.log('=== Test AI Scanner (gemini-2.5-flash) ===\n');

  const prompt = `
Kamu adalah asisten AI untuk aplikasi e-TrashHub di Kota Balikpapan.
SEMUA respons WAJIB dalam Bahasa Indonesia.
Analisis gambar sampah ini dan kembalikan HANYA JSON valid.

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
- "Sedang" jika total 2-5 kg
- "Berat" jika total > 5 kg

TUGAS:
1. Identifikasi SETIAP item sampah yang terlihat di gambar. Hitung jumlahnya.
2. Untuk setiap item, isi field "category" dengan slug dari tabel di atas, dan "categoryLabel" dengan nama kategorinya PERSIS dari tabel.
3. Jika item tidak cocok dengan kategori manapun, gunakan slug "lainnya" dan categoryLabel "Lainnya".
4. Hitung estimasi berat total: jumlah item x berat per pcs, lalu tentukan "estimatedWeight" (HANYA boleh "Ringan", "Sedang", atau "Berat").
5. Hitung "estimatedPoints": total berat tiap kategori x poin/kg, bulatkan ke integer.
6. Isi "sortingTips" dengan tips singkat memilah sampah (dalam Bahasa Indonesia).
7. Isi "environmentalMessage" dengan pesan motivasi lingkungan singkat (dalam Bahasa Indonesia).
8. Isi "isRecyclable" true jika mayoritas sampah bisa didaur ulang.
9. Jika gambar bukan sampah atau tidak jelas, isi "warningNote" dengan peringatan. Jika jelas, isi string kosong "".

Bayangkan kamu melihat gambar yang berisi: 3 botol plastik bekas dan 2 gelas plastik bekas. Analisis sekarang.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
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
        },
        temperature: 0.2
      }
    });

    const result = JSON.parse(response.text);
    console.log('✅ RAW RESULT:\n', JSON.stringify(result, null, 2));

    // Validasi
    const VALID_LABELS = ['Botol Plastik', 'Gelas Plastik', 'Kertas/Kardus', 'Logam/Kaleng', 'Tutup Botol', 'Kain/Tekstil', 'Lainnya'];
    const VALID_WEIGHTS = ['Ringan', 'Sedang', 'Berat'];
    
    console.log('\n--- VALIDASI ---');
    
    let allGood = true;
    result.detectedItems.forEach((item, i) => {
      const labelOk = VALID_LABELS.includes(item.categoryLabel);
      console.log(`  Item ${i}: category="${item.category}", categoryLabel="${item.categoryLabel}" → ${labelOk ? '✅' : '❌'}`);
      if (!labelOk) allGood = false;
    });

    const weightOk = VALID_WEIGHTS.includes(result.estimatedWeight);
    console.log(`  estimatedWeight: "${result.estimatedWeight}" → ${weightOk ? '✅' : '❌'}`);
    if (!weightOk) allGood = false;

    console.log(`  estimatedPoints: ${result.estimatedPoints} (type: ${typeof result.estimatedPoints})`);
    console.log(`  sortingTips: "${result.sortingTips.substring(0, 60)}..."`);
    console.log(`  environmentalMessage: "${result.environmentalMessage.substring(0, 60)}..."`);
    console.log(`  isRecyclable: ${result.isRecyclable}`);
    console.log(`  warningNote: "${result.warningNote}"`);

    console.log(`\n${allGood ? '🎉 SEMUA VALIDASI LULUS!' : '⚠️ ADA MASALAH — tapi post-processing backend akan menangani ini.'}`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

test();
