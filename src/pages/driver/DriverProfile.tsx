import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Truck, MapPin, LogOut } from 'lucide-react';

export default function DriverProfile() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--role-driver)', color: '#fff', textAlign: 'center' }}>
        <div style={{ 
          width: '5rem', height: '5rem', borderRadius: '50%', 
          backgroundColor: '#fff', color: 'var(--role-driver)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 800, border: '4px solid rgba(255,255,255,0.2)',
          margin: '0 auto 1rem'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</div>
        <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Pengemudi Armada (Driver)</div>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, marginTop: '-1.5rem' }}>
        <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: 'var(--role-driver)', borderRadius: 'var(--radius-full)' }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Kendaraan Armada</div>
              <div style={{ fontWeight: 700 }}>Pickup Bak L300 (L 1234 AB)</div>
            </div>
          </div>
          
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: 'var(--role-driver)', borderRadius: 'var(--radius-full)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Zona Operasional</div>
              <div style={{ fontWeight: 700 }}>Surabaya Barat</div>
            </div>
          </div>
        </Card>

        <section style={{ marginTop: 'auto' }}>
          <Button variant="danger" ghost fullWidth icon={LogOut} onClick={logout} size="lg">
            Keluar / Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
