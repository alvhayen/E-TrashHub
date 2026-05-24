import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Package, ArrowRight, Truck, Navigation, Box, AlertCircle } from 'lucide-react';
import './Expedition.css';

export default function ExpeditionList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  useEffect(() => {
    // Security check: only MITRA_TPS3R can access
    if (user?.driverType !== 'MITRA_TPS3R') {
      navigate('/unauthorized');
      return;
    }

    fetchExpeditions();
  }, [user, navigate]);

  const fetchExpeditions = async () => {
    try {
      const res = await axios.get('/api/expedition/driver');
      setExpeditions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpeditions = expeditions.filter(exp => {
    if (filter === 'ACTIVE') return ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED'].includes(exp.status);
    if (filter === 'COMPLETED') return ['CONFIRMED', 'CANCELLED'].includes(exp.status);
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ASSIGNED': return <span className="exp-badge badge-gray">Menunggu Keberangkatan</span>;
      case 'ON_THE_WAY': return <span className="exp-badge badge-blue">Dalam Perjalanan</span>;
      case 'ARRIVED': return <span className="exp-badge badge-amber">Tiba, Menunggu Konfirmasi</span>;
      case 'CONFIRMED': return <span className="exp-badge badge-green">Selesai ✓</span>;
      case 'CANCELLED': return <span className="exp-badge badge-red">Dibatalkan</span>;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  if (loading) return <div className="exp-loading">Memuat ekspedisi...</div>;

  return (
    <div className="exp-page">
      <header className="exp-header">
        <div className="exp-title">
          <Package className="exp-icon" />
          <div>
            <h1>Ekspedisi TPS3R</h1>
            <p>Tugas pengiriman aktif dan riwayatmu</p>
          </div>
        </div>
      </header>

      <div className="exp-tabs">
        <button className={`exp-tab ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Semua</button>
        <button className={`exp-tab ${filter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setFilter('ACTIVE')}>Aktif</button>
        <button className={`exp-tab ${filter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setFilter('COMPLETED')}>Selesai</button>
      </div>

      <div className="exp-list">
        {filteredExpeditions.length === 0 ? (
          <div className="exp-empty">
            <Box size={48} color="#cbd5e1" />
            <p>Tidak ada ekspedisi untuk filter ini</p>
          </div>
        ) : (
          filteredExpeditions.map(exp => (
            <div key={exp.id} className="exp-card">
              <div className="exp-card-header">
                <span className="exp-id">{exp.id.substring(0, 18).toUpperCase()}...</span>
                {getStatusBadge(exp.status)}
              </div>
              
              <div className="exp-card-body">
                <div className="exp-type">
                  <span className="exp-type-label">JENIS EKSPEDISI:</span>
                  <span className="exp-type-value">
                    {exp.type === 'TPS3R_TO_TPS3R' ? '🏭→🏭 Antar TPS3R' : '🏭→🏢 Ke Mitra'}
                  </span>
                </div>

                <div className="exp-route">
                  <div className="exp-route-point">
                    <span className="exp-route-label">DARI:</span>
                    <span className="exp-route-name">{exp.originTps.name}</span>
                  </div>
                  <div className="exp-route-point">
                    <span className="exp-route-label">KE:</span>
                    <span className="exp-route-name">
                      {exp.destinationTps ? exp.destinationTps.name : exp.destinationMitra?.name}
                    </span>
                  </div>
                </div>

                <div className="exp-meta">
                  <span>📦 {exp.items.length} item · ±{exp.items.reduce((acc: number, item: any) => acc + item.weight, 0)} kg</span>
                  <span>📅 Ditugaskan: {formatDate(exp.createdAt)}</span>
                </div>
              </div>

              <button className="exp-btn-detail" onClick={() => navigate(`/driver/expedition/${exp.id}`)}>
                Lihat Detail & Manifest <ArrowRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
