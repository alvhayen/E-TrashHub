import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Clock, Navigation, Map } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function ExpeditionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [expedition, setExpedition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.driverType !== 'MITRA_TPS3R') {
      navigate('/unauthorized');
      return;
    }
    fetchDetail();
  }, [id, user, navigate]);

  const isOrder = id?.startsWith('ORD-');
  const realId = isOrder ? id?.replace('ORD-', '') : id;

  const fetchDetail = async () => {
    try {
      if (isOrder) {
        const res = await axios.get(`/api/orders/${realId}`);
        const o = res.data.order;
        setExpedition({
          id: `ORD-${o.id}`,
          type: 'TPS3R_TO_MITRA',
          status: o.status === 'DRIVER_ASSIGNED' ? 'ASSIGNED' : o.status === 'DELIVERED' ? 'ARRIVED' : o.status === 'COMPLETED' ? 'CONFIRMED' : o.status,
          originTps: { name: o.tps3r?.tpsName || o.tps3r?.name, address: o.tps3r?.tpsAddress || '-' },
          destinationMitra: { name: o.mitra?.name, companyAddress: o.deliveryAddress || '-' },
          items: [{ id: 1, weight: o.quantityKg, category: { name: o.inventory.commodity }, notes: o.notes }],
          createdAt: o.createdAt,
          departedAt: !['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED'].includes(o.status) ? o.updatedAt : null,
          arrivedAt: ['DELIVERED', 'COMPLETED'].includes(o.status) ? o.updatedAt : null,
          confirmedAt: o.status === 'COMPLETED' ? o.updatedAt : null,
          isOrder: true,
          originalOrderId: o.id
        });
      } else {
        const res = await axios.get(`/api/expedition/${id}`);
        setExpedition(res.data.data);
      }
    } catch (err) {
      error('Gagal memuat detail ekspedisi');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'depart' | 'arrive') => {
    setActionLoading(true);
    try {
      if (isOrder) {
        const newStatus = action === 'depart' ? 'ON_THE_WAY' : 'DELIVERED';
        await axios.patch(`/api/orders/${realId}/driver-status`, { status: newStatus });
      } else {
        await axios.patch(`/api/expedition/${id}/${action}`);
      }
      success(`Status berhasil diperbarui`);
      fetchDetail();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal mengubah status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !expedition) return <div className="exp-loading">Memuat detail...</div>;

  const getStatusInfo = () => {
    const s = expedition.status;
    if (s === 'ASSIGNED') return { color: '#64748b', bg: '#f1f5f9', text: 'Menunggu Keberangkatan', isPulse: false };
    if (s === 'ON_THE_WAY') return { color: '#0ea5e9', bg: '#e0f2fe', text: 'Dalam Perjalanan', isPulse: true };
    if (s === 'ARRIVED') return { color: '#f59e0b', bg: '#fef3c7', text: 'Tiba, Menunggu Konfirmasi', isPulse: true };
    if (s === 'CONFIRMED') return { color: '#10b981', bg: '#d1fae5', text: 'Selesai ✓', isPulse: false };
    return { color: '#ef4444', bg: '#fee2e2', text: 'Dibatalkan', isPulse: false };
  };

  const statusInfo = getStatusInfo();
  const destName = expedition.type === 'TPS3R_TO_TPS3R' ? expedition.destinationTps?.name : expedition.destinationMitra?.name;
  const destAddress = expedition.type === 'TPS3R_TO_TPS3R' ? expedition.destinationTps?.address : expedition.destinationMitra?.companyAddress;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  const totalWeight = expedition.items.reduce((acc: number, item: any) => acc + item.weight, 0);

  return (
    <div className="exp-detail-page">
      <header className="exp-detail-header">
        <button className="exp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="exp-detail-title">
          <h1>{expedition.id.split('-')[1]}-{expedition.id.split('-')[2]}</h1>
          <p>{expedition.type === 'TPS3R_TO_TPS3R' ? 'Antar TPS3R' : 'Pengiriman ke Mitra Industri'}</p>
        </div>
      </header>

      {/* 1. HEADER STATUS */}
      <div className="exp-status-banner" style={{ backgroundColor: statusInfo.bg, borderColor: statusInfo.color }}>
        <div className={`status-indicator ${statusInfo.isPulse ? 'pulse' : ''}`} style={{ backgroundColor: statusInfo.color }}></div>
        <span style={{ color: statusInfo.color, fontWeight: 700 }}>{statusInfo.text}</span>
      </div>

      {/* 5. CONTEXTUAL ACTION BANNER */}
      <div className="exp-action-container">
        {expedition.status === 'ASSIGNED' && (
          <button className="exp-action-btn primary" onClick={() => handleAction('depart')} disabled={actionLoading}>
            <Truck size={20} /> {actionLoading ? 'Memproses...' : 'Mulai Perjalanan'}
          </button>
        )}
        
        {expedition.status === 'ON_THE_WAY' && (
          <div className="exp-action-group">
            <button className="exp-action-btn success" onClick={() => handleAction('arrive')} disabled={actionLoading}>
              <MapPin size={20} /> {actionLoading ? 'Memproses...' : 'Saya Sudah Tiba'}
            </button>
            <button className="exp-action-btn outline" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(destAddress)}`, '_blank')}>
              <Navigation size={20} /> Navigasi ke Tujuan
            </button>
          </div>
        )}

        {expedition.status === 'ARRIVED' && (
          <div className="exp-info-banner amber">
            <Clock size={20} /> ⏳ Menunggu konfirmasi dari penerima...
          </div>
        )}

        {expedition.status === 'CONFIRMED' && (
          <div className="exp-info-banner green">
            <CheckCircle2 size={20} /> ✅ Ekspedisi selesai! Terima kasih.
          </div>
        )}
      </div>

      {/* 2. TIMELINE */}
      <div className="exp-section">
        <h3>Status Perjalanan</h3>
        <div className="exp-timeline">
          <div className="timeline-step active">
            <div className="step-icon">✅</div>
            <div className="step-content">
              <h4>Ditugaskan</h4>
              <p>{formatDate(expedition.createdAt)}</p>
            </div>
          </div>
          
          <div className={`timeline-step ${expedition.departedAt ? 'active' : ''}`}>
            <div className="step-icon">{expedition.departedAt ? '✅' : '🔵'}</div>
            <div className="step-content">
              <h4>Berangkat dari asal</h4>
              <p>{formatDate(expedition.departedAt)}</p>
            </div>
          </div>
          
          <div className={`timeline-step ${expedition.arrivedAt ? 'active' : ''}`}>
            <div className="step-icon">{expedition.arrivedAt ? '✅' : '🔒'}</div>
            <div className="step-content">
              <h4 style={{ color: expedition.arrivedAt ? '#111827' : '#9ca3af' }}>Tiba di tujuan</h4>
              <p>{formatDate(expedition.arrivedAt)}</p>
            </div>
          </div>

          <div className={`timeline-step ${expedition.confirmedAt ? 'active' : ''}`}>
            <div className="step-icon">{expedition.confirmedAt ? '✅' : '🔒'}</div>
            <div className="step-content">
              <h4 style={{ color: expedition.confirmedAt ? '#111827' : '#9ca3af' }}>Dikonfirmasi penerima</h4>
              <p>{formatDate(expedition.confirmedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROUTE INFO */}
      <div className="exp-section">
        <h3>Informasi Rute</h3>
        <div className="exp-route-card">
          <div className="route-point origin">
            <div className="point-marker"></div>
            <div className="point-details">
              <div className="point-label">DARI</div>
              <div className="point-name">{expedition.originTps.name}</div>
              <div className="point-address">{expedition.originTps.address}</div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(expedition.originTps.address)}`} target="_blank" rel="noreferrer" className="map-link">
                <Map size={14} /> Buka Maps →
              </a>
            </div>
          </div>
          <div className="route-line"></div>
          <div className="route-point dest">
            <div className="point-marker dest"></div>
            <div className="point-details">
              <div className="point-label">KE</div>
              <div className="point-name">{destName}</div>
              <div className="point-address">{destAddress}</div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(destAddress)}`} target="_blank" rel="noreferrer" className="map-link">
                <Map size={14} /> Buka Maps →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MANIFEST MUATAN */}
      <div className="exp-section">
        <div className="section-header-flex">
          <h3>Manifest Muatan</h3>
          <span className="total-weight">Total: {totalWeight} kg</span>
        </div>
        <div className="exp-table-wrapper">
          <table className="exp-table">
            <thead>
              <tr>
                <th>Nama Komoditas</th>
                <th className="align-right">Berat (kg)</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {expedition.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.category.name}</td>
                  <td className="align-right">{item.weight}</td>
                  <td className="text-muted">{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
