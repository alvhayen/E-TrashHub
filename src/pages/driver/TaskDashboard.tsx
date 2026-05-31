import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { MapPin, Navigation, Phone, ChevronDown, ChevronUp, X, Truck, CheckCircle2 } from 'lucide-react';

// Status label mapping
const STATUS_STEPS: Record<string, { label: string; next: string | null; nextLabel: string | null; color: string }> = {
  PENDING:              { label: 'Tersedia',          next: 'ACCEPT',   nextLabel: '✋ Terima Tugas',       color: '#64748b' },
  ACCEPTED:             { label: 'Diterima',          next: 'ON_THE_WAY', nextLabel: '🚛 Mulai Jemput',    color: '#0ea5e9' },
  ON_THE_WAY:           { label: 'Dalam Perjalanan',  next: 'COLLECTED', nextLabel: '✅ Sampah Diambil',  color: '#8b5cf6' },
  COLLECTED:            { label: 'Dikumpulkan',       next: 'DELIVER',  nextLabel: '🏭 Setor ke TPS3R',    color: '#f59e0b' },
  DELIVERED_TO_TPS3R:   { label: 'Disetor ke TPS3R',  next: null,       nextLabel: null,                   color: '#10b981' },
};

type PickupTask = {
  id: number;
  status: string;
  address: string;
  estimatedWeight: string;
  wasteTypes: string[];
  note?: string;
  user?: { name: string; phone?: string };
  acceptedAt?: string;
};

type TPS3R = {
  id: number;
  tpsName: string;
  tpsAddress: string;
  name?: string;
};

export default function TaskDashboard() {
  const { user, updateUser } = useAuth();
  const { request, loading } = useApi();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [showTPS3RModal, setShowTPS3RModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tps3rList, setTps3rList] = useState<TPS3R[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPickups = useCallback(async () => {
    try {
      const data = await request('GET', '/api/pickup/driver');
      setTasks(data.pickups || []);
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  const fetchTPS3RList = useCallback(async () => {
    try {
      const data = await request('GET', '/api/pickup/driver/tps3r-list');
      setTps3rList(data.tps3rList || []);
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  useEffect(() => {
    fetchPickups();
    fetchTPS3RList();
  }, [fetchPickups, fetchTPS3RList]);

  // Accept task (atomic claim)
  const handleAccept = async (id: number) => {
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/accept`);
      success('Tugas berhasil diterima! Segera berangkat.');
      fetchPickups();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Gagal menerima tugas';
      if (err.response?.data?.code === 'ALREADY_CLAIMED') {
        error('Tugas ini sudah diambil driver lain. Memuat ulang daftar...');
        fetchPickups();
      } else {
        error(msg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Cancel accepted task (return to pool)
  const handleCancelAccept = async (id: number) => {
    if (!window.confirm('Batalkan penerimaan tugas ini? Task akan kembali ke daftar tersedia.')) return;
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/cancel-accept`, { reason: 'Driver membatalkan' });
      success('Penerimaan tugas dibatalkan.');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal membatalkan');
    } finally {
      setProcessingId(null);
    }
  };

  // Update status to ON_THE_WAY or COLLECTED
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setProcessingId(id);
    try {
      await request('PATCH', `/api/pickup/${id}/status`, { status: newStatus });
      success('Status berhasil diperbarui!');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui status');
      fetchPickups();
    } finally {
      setProcessingId(null);
    }
  };

  // Open TPS3R selector modal for DELIVER step
  const handleDeliverIntent = (id: number) => {
    setSelectedTaskId(id);
    setShowTPS3RModal(true);
  };

  // Confirm delivery to selected TPS3R
  const handleConfirmDeliver = async (tps3rId: number) => {
    if (!selectedTaskId) return;
    setProcessingId(selectedTaskId);
    setShowTPS3RModal(false);
    try {
      await request('PATCH', `/api/pickup/${selectedTaskId}/deliver`, { tps3rTargetId: tps3rId });
      success('Setoran ke TPS3R berhasil dicatat! Tunggu verifikasi dari admin TPS3R.');
      fetchPickups();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal mencatat setoran');
    } finally {
      setProcessingId(null);
      setSelectedTaskId(null);
    }
  };

  const handleClaimBonus = async () => {
    try {
      const res = await request('POST', '/api/auth/claim-bonus');
      if (res?.user) {
        updateUser(res.user);
        success(res.message || 'Bonus 100 Poin berhasil diklaim!');
        setBonusClaimed(true);
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal mengklaim bonus');
    }
  };

  // Separate active tasks from available tasks
  const myActiveTasks = tasks.filter(t => t.status !== 'PENDING');
  const availableTasks = tasks.filter(t => t.status === 'PENDING');
  const completedCount = tasks.filter(t => t.status === 'DELIVERED_TO_TPS3R').length;
  const totalCount = tasks.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* HEADER */}
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--role-driver)', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}
        className="driver-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tugas Hari Ini</h1>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Zona: {user?.domicile || user?.zone || 'Belum diset'} &bull; {totalCount} titik tersedia
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Total Poin</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.points || 0} Pds</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', textAlign: 'right', marginBottom: '0.25rem', fontWeight: 600, color: '#fef08a' }}>
            ✨ Selesaikan semua untuk +100 Poin bonus
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <span>Progres Selesai</span>
            <span>{completedCount}/{totalCount} selesai</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`, height: '100%', backgroundColor: '#fff', borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </header>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

        {/* Bonus claim banner */}
        {completedCount === totalCount && totalCount > 0 && !bonusClaimed && (
          <Card variant="elevated" padding="md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>Target Tercapai!</h3>
              <p style={{ color: '#15803d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Anda telah menyelesaikan semua {totalCount} titik penjemputan. Klaim bonus Anda sekarang!
              </p>
              <Button fullWidth onClick={handleClaimBonus} disabled={loading} style={{ backgroundColor: '#16a34a' }}>
                {loading ? 'Mengklaim...' : 'Klaim 100 Poin Bonus'}
              </Button>
            </div>
          </Card>
        )}

        {/* MY ACTIVE TASKS — tasks yang sudah di-accept driver ini */}
        {myActiveTasks.length > 0 && (
          <section>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📋 Tugas Aktif Saya ({myActiveTasks.length})
            </h2>
            <div className="task-grid">
              {myActiveTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedId === task.id}
                  onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  onAction={(action) => {
                    if (action === 'ON_THE_WAY') handleUpdateStatus(task.id, 'ON_THE_WAY');
                    if (action === 'COLLECTED') handleUpdateStatus(task.id, 'COLLECTED');
                    if (action === 'DELIVER') handleDeliverIntent(task.id);
                    if (action === 'CANCEL_ACCEPT') handleCancelAccept(task.id);
                  }}
                  isProcessing={processingId === task.id}
                  accentColor="var(--role-driver)"
                />
              ))}
            </div>
          </section>
        )}

        {/* AVAILABLE TASKS — task PENDING yang bisa diambil */}
        <section>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🟢 Tersedia untuk Diambil ({availableTasks.length})
          </h2>
          {loading && tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Memuat tugas...</div>
          ) : availableTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tidak ada task tersedia saat ini</h3>
              <p style={{ fontSize: '0.875rem' }}>Semua task sudah diambil atau belum ada permintaan baru.</p>
            </div>
          ) : (
            <div className="task-grid">
              {availableTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedId === task.id}
                  onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  onAction={(action) => {
                    if (action === 'ACCEPT') handleAccept(task.id);
                  }}
                  isProcessing={processingId === task.id}
                  accentColor="#64748b"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* TPS3R SELECTOR MODAL */}
      {showTPS3RModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '1rem 1rem 0 0',
            width: '100%', maxWidth: '480px', padding: '1.5rem',
            maxHeight: '70vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pilih TPS3R Tujuan</h3>
              <button onClick={() => setShowTPS3RModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Pilih TPS3R tempat Anda akan menyetorkan sampah yang sudah terkumpul.
            </p>
            {tps3rList.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '1rem' }}>
                Tidak ada TPS3R aktif yang tersedia.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tps3rList.map((tps) => (
                  <button
                    key={tps.id}
                    onClick={() => handleConfirmDeliver(tps.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '1rem', border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      backgroundColor: '#fff', textAlign: 'left',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--role-driver)')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>🏭 {tps.tpsName || tps.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{tps.tpsAddress}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .task-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .task-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
          .driver-header { padding: 1.5rem 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}

// ─── SUB-COMPONENT: TaskCard ────────────────────────────────────────────
interface TaskCardProps {
  task: PickupTask;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
  isProcessing: boolean;
  accentColor: string;
}

function TaskCard({ task, isExpanded, onToggle, onAction, isProcessing, accentColor }: TaskCardProps) {
  const statusInfo = STATUS_STEPS[task.status] || STATUS_STEPS.PENDING;

  return (
    <Card variant="elevated" padding="md" style={{ borderLeft: `6px solid ${accentColor}` }}>
      {/* Card header — always visible */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            {task.user?.name || 'Rumah Tangga'}
          </h3>
          <span style={{
            display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
            padding: '0.125rem 0.5rem', borderRadius: '999px',
            backgroundColor: `${accentColor}18`, color: accentColor,
          }}>
            ● {statusInfo.label}
          </span>
        </div>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0.25rem' }}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Address — clickable to maps */}
      <div
        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`, '_blank')}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}
      >
        <MapPin size={15} color="var(--color-text-secondary)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textDecoration: 'underline', lineHeight: 1.4 }}>
          {task.address}
        </span>
      </div>

      {/* Waste tags + weight */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {task.wasteTypes?.map((type) => {
          const types: Record<string, string> = {
            '1': 'Botol Plastik', '2': 'Gelas Plastik', '3': 'Kertas/Kardus', 
            '4': 'Logam/Kaleng', '5': 'Tutup Botol', '6': 'Kain/Tekstil'
          };
          const typeName = types[type.toString()] || type;
          return (
            <span key={type} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 'var(--radius-sm)' }}>
              {typeName}
            </span>
          );
        })}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)' }}>
          Est: {task.estimatedWeight}
        </span>
      </div>

      {/* Expandable detail */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
          {task.user?.phone && (
            <a href={`tel:${task.user.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem' }}>
              <Phone size={15} /> Hubungi: {task.user.phone}
            </a>
          )}
          {task.note && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Catatan: "{task.note}"
            </p>
          )}
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(task.address)}`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--role-driver)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', fontWeight: 600 }}
          >
            <Navigation size={15} /> Buka Navigasi Google Maps
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {task.status === 'PENDING' && (
          <Button fullWidth size="lg" onClick={() => onAction('ACCEPT')} disabled={isProcessing}
            style={{ backgroundColor: 'var(--role-driver)', fontSize: '0.9375rem' }}>
            {isProcessing ? 'Memproses...' : '✋ Terima Tugas'}
          </Button>
        )}
        {task.status === 'ACCEPTED' && (
          <>
            <Button fullWidth size="lg" onClick={() => onAction('ON_THE_WAY')} disabled={isProcessing}
              style={{ backgroundColor: '#8b5cf6', fontSize: '0.9375rem' }}>
              {isProcessing ? 'Memproses...' : '🚛 Mulai Berangkat'}
            </Button>
            <Button fullWidth size="sm" variant="ghost" onClick={() => onAction('CANCEL_ACCEPT')} disabled={isProcessing}
              style={{ color: '#ef4444', fontSize: '0.8125rem' }}>
              Batalkan Penerimaan
            </Button>
          </>
        )}
        {task.status === 'ON_THE_WAY' && (
          <Button fullWidth size="lg" onClick={() => onAction('COLLECTED')} disabled={isProcessing}
            style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            {isProcessing ? 'Memproses...' : '✅ Sampah Sudah Diambil'}
          </Button>
        )}
        {task.status === 'COLLECTED' && (
          <Button fullWidth size="lg" onClick={() => onAction('DELIVER')} disabled={isProcessing}
            style={{ backgroundColor: '#f59e0b', fontSize: '0.9375rem', color: '#fff' }}>
            {isProcessing ? 'Memproses...' : '🏭 Setor ke TPS3R'}
          </Button>
        )}
        {task.status === 'DELIVERED_TO_TPS3R' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', color: '#15803d', fontSize: '0.875rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} /> Disetor ke TPS3R — Menunggu verifikasi admin
          </div>
        )}
      </div>
    </Card>
  );
}
