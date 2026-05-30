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
      const token = localStorage.getItem('etrashhub_token');
      const response = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ imageBase64, mimeType: imageMimeType })
      });

      // Cegah error "Unexpected end of JSON input" dengan membaca text-nya terlebih dahulu
      const textResponse = await response.text();
      let data;
      
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
         // Menangkap respon HTML dari middleware/Vite fallback
        throw new Error(`Sistem menolak request. Pastikan Anda sudah Login (Status: ${response.status}).`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analisis gagal dari server.');
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
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1.25rem',
        width: '100%', maxWidth: '520px',
        maxHeight: '92vh', overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Powered by Gemini 1.5 Flash</p>
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
