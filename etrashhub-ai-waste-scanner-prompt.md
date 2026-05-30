# 📷 Prompt Fitur AI: "Scan Sampah" — e-TrashHub
## Powered by Gemini 3.5 Flash Vision API
## Untuk AI Agent Antigravity

> **Kirim prompt ini ke AI Agent di Antigravity sebagai satu kesatuan.**
> Agent wajib membaca file existing terlebih dahulu sebelum menulis kode baru.
> Implementasi bersifat additive — JANGAN ubah struktur yang sudah ada.

---

## 🎯 TUJUAN FITUR

Tambahkan tombol **"📷 Scan Sampah"** di halaman Request Pickup milik role Rumah Tangga.
User memotret sampah mereka → Gemini 3.5 Flash menganalisis gambar → form pickup **terisi otomatis** dengan jenis sampah, estimasi berat, tips sorting, dan estimasi poin yang akan didapat.

**Demo flow untuk juri kompetisi:**
```
User buka halaman Request Pickup
  → Klik tombol "📷 Scan Sampah"
  → Ambil foto / upload gambar sampah
  → Loading 1-2 detik (Gemini memproses)
  → ✨ Form auto-fill: jenis sampah, berat estimasi
  → Muncul card "Insight AI": tips sorting + estimasi poin
  → User tinggal isi alamat dan submit
```

---

## 📁 FILE YANG WAJIB DIBACA SEBELUM MENGERJAKAN

```
src/pages/rumah_tangga/RequestPickup.tsx   ← halaman utama yang dimodifikasi
src/context/AuthContext.tsx                ← untuk ambil user.points
backend/src/controllers/pickup.controller.js  ← referensi struktur data
backend/prisma/schema.prisma               ← lihat field WasteCategory
backend/src/server.js                      ← untuk tahu cara setup route
backend/.env.example                       ← untuk tahu env variable yang sudah ada
```

---

## BAGIAN 1 — ENVIRONMENT VARIABLE

### FILE: `backend/.env.example` dan `backend/.env`

**Aksi: TAMBAHKAN baris berikut ke kedua file.**

```env
# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Catatan untuk user:** Dapatkan API key gratis di https://aistudio.google.com/apikey

---

## BAGIAN 2 — BACKEND: Install Dependency

**Aksi: Jalankan perintah berikut di folder `backend/`:**

```bash
cd backend
npm install @google/genai
```

---

## BAGIAN 3 — BACKEND: AI Controller

### FILE BARU: `backend/src/controllers/ai.controller.js`

**Aksi: BUAT file baru dengan isi berikut.**

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Daftar kategori sampah yang ada di sistem e-TrashHub
// Sesuaikan dengan data WasteCategory di database kamu
const WASTE_CATEGORIES_CONTEXT = `
Kategori sampah yang tersedia di sistem e-TrashHub:
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

// POST /api/ai/analyze-waste
// Menerima gambar base64, mengembalikan analisis sampah
export const analyzeWaste = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Gambar diperlukan' });
    }

    // Validasi ukuran base64 (max ~4MB = ~5.3MB base64)
    if (imageBase64.length > 5_500_000) {
      return res.status(400).json({ error: 'Ukuran gambar terlalu besar. Maksimal 4MB.' });
    }

    const prompt = `
Kamu adalah asisten pengelolaan sampah cerdas untuk aplikasi e-TrashHub Indonesia.
Analisis gambar sampah yang diberikan dan berikan respons dalam format JSON yang tepat.

${WASTE_CATEGORIES_CONTEXT}

Tugas:
1. Identifikasi jenis-jenis sampah yang terlihat di gambar
2. Cocokkan dengan kategori yang tersedia di sistem
3. Estimasi berat total berdasarkan volume yang terlihat
4. Berikan tips sorting yang relevan
5. Hitung estimasi poin yang akan didapat

PENTING: Respons HANYA berupa JSON valid tanpa markdown, tanpa backtick, tanpa penjelasan tambahan.

Format respons JSON:
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
  "sortingTips": "Tips singkat 1-2 kalimat tentang cara menyortir sampah ini dengan benar.",
  "environmentalMessage": "Pesan motivasi singkat tentang dampak positif mendaur ulang sampah ini (1 kalimat).",
  "isRecyclable": true,
  "warningNote": null
}

Jika gambar tidak mengandung sampah sama sekali, isi detectedItems dengan array kosong dan set warningNote dengan pesan yang sesuai.
Jika ada sampah yang tidak termasuk kategori sistem, tetap cantumkan di detectedItems tapi set category ke "lainnya".
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        // Matikan thinking untuk respons lebih cepat (demo butuh speed)
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.2, // rendah = konsisten untuk data terstruktur
        maxOutputTokens: 1024,
      }
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return res.status(500).json({ error: 'Gemini tidak memberikan respons. Coba lagi.' });
    }

    // Parse JSON dari respons Gemini
    let analysisResult;
    try {
      // Bersihkan kemungkinan markdown code fence yang masih muncul
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      analysisResult = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('Gemini JSON parse error. Raw response:', rawText);
      return res.status(500).json({
        error: 'Gagal memproses respons AI. Coba foto ulang dengan pencahayaan lebih baik.',
        debug: process.env.NODE_ENV === 'development' ? rawText : undefined
      });
    }

    // Validasi struktur respons minimum
    if (!analysisResult.detectedItems || !Array.isArray(analysisResult.detectedItems)) {
      return res.status(500).json({ error: 'Respons AI tidak valid. Coba lagi.' });
    }

    res.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('analyzeWaste error:', error);

    // Handle Gemini API errors secara spesifik
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ error: 'Konfigurasi API AI bermasalah. Hubungi admin.' });
    }
    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({ error: 'Gambar tidak dapat diproses karena alasan keamanan.' });
    }

    res.status(500).json({ error: 'Terjadi kesalahan saat menganalisis gambar.' });
  }
};
```

---

## BAGIAN 4 — BACKEND: AI Route

### FILE BARU: `backend/src/routes/ai.routes.js`

**Aksi: BUAT file baru dengan isi berikut.**

```javascript
import express from 'express';
import { analyzeWaste } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Semua route AI butuh autentikasi
router.use(verifyToken);

// POST /api/ai/analyze-waste — analisis gambar sampah
// Accessible by: RUMAH_TANGGA (dan role lain yang sudah login)
router.post('/analyze-waste', analyzeWaste);

export default router;
```

---

## BAGIAN 5 — BACKEND: Register Route di Server

### FILE: `backend/src/server.js`

**Aksi: TAMBAHKAN import dan penggunaan route AI. Jangan ubah route yang lain.**

Di bagian import routes (cari baris import routes lain), tambahkan:
```javascript
import aiRoutes from './routes/ai.routes.js';
```

Di bagian registrasi routes (cari `app.use('/api/...`), tambahkan:
```javascript
app.use('/api/ai', aiRoutes);
```

---

## BAGIAN 6 — FRONTEND: Komponen WasteScanner

### FILE BARU: `src/components/ai/WasteScanner.tsx`

**Aksi: BUAT folder `src/components/ai/` lalu buat file baru dengan isi berikut.**

```tsx
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Sparkles, Loader2, AlertCircle, Leaf, Coins, Info } from 'lucide-react';

interface DetectedItem {
  name: string;
  category: string;
  categoryLabel: string;
  confidence: number;
}

interface WasteAnalysis {
  detectedItems: DetectedItem[];
  estimatedWeight: 'Ringan' | 'Sedang' | 'Berat';
  estimatedPoints: number;
  sortingTips: string;
  environmentalMessage: string;
  isRecyclable: boolean;
  warningNote: string | null;
}

interface WasteScannerProps {
  onAnalysisComplete: (analysis: WasteAnalysis) => void;
  onClose: () => void;
}

type ScanState = 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

export default function WasteScanner({ onAnalysisComplete, onClose }: WasteScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Kompres gambar ke max 800px dan konversi ke base64
  const processImage = (file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let { width, height } = img;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mimeType: 'image/jpeg', previewUrl: dataUrl });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, WEBP).');
      setScanState('error');
      return;
    }

    try {
      const processed = await processImage(file);
      setPreviewUrl(processed.previewUrl);
      setImageBase64(processed.base64);
      setImageMimeType(processed.mimeType);
      setScanState('preview');
    } catch {
      setErrorMsg('Gagal memproses gambar. Coba gambar lain.');
      setScanState('error');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setScanState('analyzing');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ imageBase64, mimeType: imageMimeType })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analisis gagal');
      }

      setAnalysis(data.analysis);
      setScanState('result');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan. Coba lagi.');
      setScanState('error');
    }
  };

  const handleApply = () => {
    if (analysis) {
      onAnalysisComplete(analysis);
      onClose();
    }
  };

  const handleRetry = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setAnalysis(null);
    setErrorMsg('');
    setScanState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confidenceLabel = (c: number) =>
    c >= 0.9 ? '✅ Yakin' : c >= 0.7 ? '🟡 Cukup yakin' : '⚠️ Kurang yakin';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 200,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1.25rem 1.25rem 0 0',
        width: '100%', maxWidth: '520px',
        maxHeight: '92vh', overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ padding: '0.375rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <Sparkles size={18} color="#16a34a" />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Scan Sampah AI</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Powered by Gemini 3.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#94a3b8' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>

          {/* STATE: idle */}
          {scanState === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                Foto sampah Anda, dan AI akan secara otomatis mengisi jenis sampah, estimasi berat, dan memberikan tips daur ulang.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="waste-camera-input"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="waste-gallery-input"
              />

              {/* Tombol Kamera */}
              <label htmlFor="waste-camera-input" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '1rem', borderRadius: '0.875rem',
                backgroundColor: '#16a34a', color: '#fff',
                cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
              }}>
                <Camera size={22} />
                Ambil Foto Sekarang
              </label>

              {/* Tombol Upload */}
              <label htmlFor="waste-gallery-input" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '0.875rem', borderRadius: '0.875rem',
                border: '2px dashed #cbd5e1', color: '#64748b',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                backgroundColor: '#f8fafc'
              }}>
                <Upload size={18} />
                Pilih dari Galeri
              </label>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.625rem' }}>
                <Info size={14} color="#3b82f6" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
                  Tips: Pastikan sampah terlihat jelas dengan pencahayaan yang cukup untuk hasil analisis terbaik.
                </p>
              </div>
            </div>
          )}

          {/* STATE: preview */}
          {scanState === 'preview' && previewUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img
                src={previewUrl}
                alt="Preview sampah"
                style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '0.875rem', border: '1px solid #e2e8f0' }}
              />
              <button
                onClick={handleAnalyze}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  padding: '1rem', borderRadius: '0.875rem', border: 'none',
                  backgroundColor: '#16a34a', color: '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
                }}
              >
                <Sparkles size={20} />
                Analisis dengan AI
              </button>
              <button onClick={handleRetry} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.875rem', padding: '0.5rem' }}>
                Foto ulang
              </button>
            </div>
          )}

          {/* STATE: analyzing */}
          {scanState === 'analyzing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '2rem 0' }}>
              {previewUrl && (
                <img src={previewUrl} alt="Sedang dianalisis" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.875rem', opacity: 0.7, filter: 'blur(1px)' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Loader2 size={32} color="#16a34a" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 700, color: '#16a34a', margin: 0 }}>AI sedang menganalisis...</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Gemini membaca gambar sampah Anda</p>
              </div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* STATE: result */}
          {scanState === 'result' && analysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {previewUrl && (
                <img src={previewUrl} alt="Sampah teranalisis" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.875rem' }} />
              )}

              {/* Warning jika tidak ada sampah terdeteksi */}
              {analysis.warningNote && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.875rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', border: '1px solid #fcd34d' }}>
                  <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>{analysis.warningNote}</p>
                </div>
              )}

              {/* Jenis sampah terdeteksi */}
              {analysis.detectedItems.length > 0 && (
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.875rem', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', margin: '0 0 0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ✅ Terdeteksi ({analysis.detectedItems.length} jenis)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {analysis.detectedItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.375rem 0.75rem', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #d1fae5' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{item.categoryLabel}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{confidenceLabel(item.confidence)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimasi berat + poin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.875rem', backgroundColor: '#eff6ff', borderRadius: '0.875rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Estimasi Berat</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af', margin: 0 }}>{analysis.estimatedWeight}</p>
                </div>
                <div style={{ padding: '0.875rem', backgroundColor: '#fef9c3', borderRadius: '0.875rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#854d0e', fontWeight: 700, margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Est. Poin</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Coins size={18} color="#d97706" />
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', margin: 0 }}>~{analysis.estimatedPoints} Pds</p>
                  </div>
                </div>
              </div>

              {/* Tips sorting */}
              <div style={{ padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', margin: '0 0 0.375rem', textTransform: 'uppercase' }}>💡 Tips Sorting</p>
                <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.6 }}>{analysis.sortingTips}</p>
              </div>

              {/* Pesan lingkungan */}
              {analysis.environmentalMessage && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem' }}>
                  <Leaf size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d', fontStyle: 'italic' }}>{analysis.environmentalMessage}</p>
                </div>
              )}

              {/* CTA buttons */}
              <button
                onClick={handleApply}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '1rem', borderRadius: '0.875rem', border: 'none',
                  backgroundColor: '#16a34a', color: '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.25)'
                }}
              >
                <Sparkles size={18} />
                Gunakan Hasil Ini → Isi Form Otomatis
              </button>
              <button onClick={handleRetry} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.875rem', padding: '0.25rem' }}>
                Scan ulang dengan foto berbeda
              </button>
            </div>
          )}

          {/* STATE: error */}
          {scanState === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', textAlign: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%' }}>
                <AlertCircle size={32} color="#ef4444" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#991b1b', margin: '0 0 0.5rem' }}>Analisis Gagal</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{errorMsg}</p>
              </div>
              <button
                onClick={handleRetry}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', backgroundColor: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
              >
                Coba Lagi
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
```

---

## BAGIAN 7 — FRONTEND: Integrasi ke RequestPickup.tsx

### FILE: `src/pages/rumah_tangga/RequestPickup.tsx`

**Aksi: MODIFIKASI file ini. Baca seluruh isi file terlebih dahulu, lalu tambahkan integrasi berikut.**

**Langkah 7.1 — Tambahkan import di bagian atas file:**
```tsx
import { lazy, Suspense, useState as useWasteScanState } from 'react';
import { Sparkles } from 'lucide-react';

// Lazy load scanner agar tidak memperlambat halaman utama
const WasteScanner = lazy(() => import('../../components/ai/WasteScanner'));
```

**Langkah 7.2 — Tambahkan state untuk scanner di dalam komponen RequestPickup:**
```tsx
const [showScanner, setShowScanner] = useState(false);
```

**Langkah 7.3 — Tambahkan handler untuk menerima hasil analisis AI:**

Fungsi ini menerima hasil dari WasteScanner dan mengisi form secara otomatis.
Sesuaikan nama state/setter dengan yang sudah ada di RequestPickup.tsx.

```tsx
const handleScanComplete = (analysis: any) => {
  // Auto-fill jenis sampah
  // SESUAIKAN: ganti 'setWasteTypes' dengan nama setter state waste types yang ada
  if (analysis.detectedItems && analysis.detectedItems.length > 0) {
    const detectedCategories = analysis.detectedItems
      .map((item: any) => item.categoryLabel)
      .filter(Boolean);
    // Cek nama setter yang dipakai di form untuk waste types, lalu gunakan:
    // setWasteTypes(detectedCategories);
    // atau setSelectedWasteTypes(detectedCategories);
    // SESUAIKAN dengan nama state yang ada di file ini
  }

  // Auto-fill estimasi berat
  // SESUAIKAN: ganti 'setEstimatedWeight' dengan nama setter yang ada
  if (analysis.estimatedWeight) {
    // setEstimatedWeight(analysis.estimatedWeight);
    // SESUAIKAN dengan nama state yang ada di file ini
  }

  // Tampilkan notifikasi sukses
  // Gunakan toast/notification yang sudah ada di file ini
  console.log('AI Scan complete:', analysis);
};
```

> ⚠️ **PENTING untuk Agent:** Setelah membaca isi RequestPickup.tsx, sesuaikan nama-nama setter di `handleScanComplete` dengan nama state yang aktual digunakan di file tersebut untuk waste types dan estimated weight. Jangan gunakan nama placeholder di atas secara langsung.

**Langkah 7.4 — Tambahkan tombol scan dan modal scanner di JSX:**

Cari bagian header atau area atas form di RequestPickup.tsx, lalu tambahkan tombol ini sebelum form fields:

```tsx
{/* Tombol AI Scan — letakkan di atas form fields */}
<div style={{ marginBottom: '1.5rem' }}>
  <button
    type="button"
    onClick={() => setShowScanner(true)}
    style={{
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
      padding: '0.875rem 1rem',
      borderRadius: '0.875rem',
      border: '2px solid #16a34a',
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '0.9375rem',
      transition: 'all 0.15s',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = '#dcfce7';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = '#f0fdf4';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <Sparkles size={20} />
    📷 Scan Sampah dengan AI
    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.125rem 0.375rem', backgroundColor: '#16a34a', color: '#fff', borderRadius: '999px', marginLeft: '0.25rem' }}>
      BARU
    </span>
  </button>
  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0' }}>
    Foto sampahmu → AI isi form otomatis ✨
  </p>
</div>

{/* WasteScanner Modal */}
{showScanner && (
  <Suspense fallback={null}>
    <WasteScanner
      onAnalysisComplete={handleScanComplete}
      onClose={() => setShowScanner(false)}
    />
  </Suspense>
)}
```

---

## BAGIAN 8 — VERIFIKASI AKHIR

Setelah implementasi selesai, Agent wajib memverifikasi:

### Backend
- [ ] `npm install @google/genai` berhasil di folder `backend/`
- [ ] File `backend/src/controllers/ai.controller.js` ada
- [ ] File `backend/src/routes/ai.routes.js` ada
- [ ] Route `/api/ai/analyze-waste` terdaftar di `server.js`
- [ ] `GEMINI_API_KEY` ada di `.env.example`

### Frontend
- [ ] Folder `src/components/ai/` ada
- [ ] File `src/components/ai/WasteScanner.tsx` ada
- [ ] Import WasteScanner di `RequestPickup.tsx` menggunakan `lazy()`
- [ ] Tombol "📷 Scan Sampah dengan AI" terlihat di halaman Request Pickup
- [ ] Handler `handleScanComplete` menggunakan nama state yang benar sesuai file asli

### Test manual (jika environment tersedia)
- [ ] Klik tombol → modal scanner muncul
- [ ] Upload foto → loading state tampil
- [ ] Hasil analisis tampil dengan jenis sampah, berat, poin
- [ ] Klik "Gunakan Hasil Ini" → form terisi otomatis
- [ ] Error state tampil dengan pesan jelas jika API key tidak ada

---

## 🚫 LARANGAN

1. **JANGAN** hapus atau ubah form fields yang sudah ada di RequestPickup.tsx
2. **JANGAN** ubah logic submit/create pickup yang sudah berjalan
3. **JANGAN** menggunakan `localStorage` untuk menyimpan API key
4. **JANGAN** ekspos `GEMINI_API_KEY` ke frontend — harus tetap di backend
5. **JANGAN** skip lazy loading WasteScanner (komponen besar, harus lazy)

---

## 📌 KONTEKS TEKNIS

- **Model Gemini:** `gemini-3.5-flash` (stable GA, multimodal vision, paling cepat)
- **SDK:** `@google/genai` (official Google GenAI SDK untuk Node.js)
- **Image processing:** Canvas API di browser untuk kompres ke max 800px sebelum kirim
- **Auth:** Token diambil dari localStorage/sessionStorage (sesuaikan dengan cara AuthContext menyimpan token)
- **Thinking:** Dimatikan (`thinkingBudget: 0`) untuk respons lebih cepat — cocok untuk demo
- **Temperature:** 0.2 — konsisten untuk output JSON terstruktur

---

*Fitur ini dirancang untuk maksimal impact di demo kompetisi: satu tombol, satu foto, satu momen "wow" yang langsung dipahami juri tanpa penjelasan panjang.*
