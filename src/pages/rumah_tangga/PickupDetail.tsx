import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2, Clock, Truck, MapPin, Scale, Gift } from 'lucide-react';

const STATUS_ORDER = ['PENDING', 'ON_THE_WAY', 'COLLECTED', 'VERIFIED', 'COMPLETED'];

export default function PickupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading } = useApi();
  const [pickup, setPickup] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    let isMounted = true;
    
    const fetchPickup = () => {
      request('GET', '/api/pickup/household').then(data => {
        if (!isMounted) return;
        const found = data.pickups?.find((p: any) => p.id === parseInt(id || '0'));
        setPickup(found);
      }).catch(console.error);
    };

    fetchPickup();
    
    // Live polling every 15 seconds
    const intervalId = setInterval(fetchPickup, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id, request]);

  if (loading && !pickup) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</div>;

  const currentStatusIndex = STATUS_ORDER.indexOf(pickup.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={24} /></button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Detail Jemputan #{pickup.id}</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        <Card variant="default">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                {new Date(pickup.createdAt).toLocaleString('id-ID')}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{pickup.wasteTypes.join(', ')}</div>
            </div>
            <Badge status={pickup.status} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {/* Simple Timeline */}
            {[
              { status: 'PENDING', label: 'Menunggu Konfirmasi', icon: Clock },
              { status: 'ON_THE_WAY', label: 'Driver Menuju Lokasi', icon: Truck },
              { status: 'COLLECTED', label: 'Sampah Diambil', icon: PackageIcon }, // Custom MapPin or Package
              { status: 'VERIFIED', label: 'Verifikasi TPS3R', icon: Scale },
              { status: 'COMPLETED', label: 'Selesai & Poin Cair', icon: Gift }
            ].map((step, idx) => {
              const isPast = STATUS_ORDER.indexOf(step.status) <= currentStatusIndex;
              const isActive = STATUS_ORDER.indexOf(step.status) === currentStatusIndex;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                  {idx !== 4 && (
                    <div style={{ position: 'absolute', left: '16px', top: '32px', bottom: '-24px', width: '2px', backgroundColor: isPast ? 'var(--color-primary)' : 'var(--color-border)', zIndex: 0 }} />
                  )}
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', zIndex: 1,
                    backgroundColor: isPast ? 'var(--color-primary)' : '#fff',
                    border: `2px solid ${isPast ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: isPast ? '#fff' : 'var(--color-text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isPast && !isActive ? <CheckCircle2 size={20} /> : <step.icon size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-primary)' : isPast ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                      {step.label}
                    </div>
                  </div>
                  {isActive && ['ON_THE_WAY', 'PENDING'].includes(step.status) && (
                    <Badge status="Active" pulse />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {pickup.status === 'COMPLETED' && (
          <Card variant="bordered" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Poin Diperoleh</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>+{pickup.points} Pts</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Berat Aktual</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{pickup.actualWeight} kg</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

const PackageIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
