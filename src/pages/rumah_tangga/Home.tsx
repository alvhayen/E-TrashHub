import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Gift, Ticket, Award, Droplets, Cloud, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { pointsToRupiah } from '../../utils/points';

export default function Home() {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // Track previous pickup statuses for notifications
  const prevStatusesRef = React.useRef<Record<number, string>>({});

  useEffect(() => {
    // Polling function
    const fetchPickups = () => {
      request('GET', '/api/pickup/household').then(data => {
        const newPickups = data.pickups || [];
        setPickups(newPickups);
        
        // Check for updates
        let hasChanges = false;
        newPickups.forEach((p: any) => {
          if (prevStatusesRef.current[p.id] && prevStatusesRef.current[p.id] !== p.status) {
            hasChanges = true;
            addNotification('Status Jemputan Diperbarui!', `Jemputan #${p.id} Anda sekarang berstatus: ${p.status}`);
          }
          prevStatusesRef.current[p.id] = p.status;
        });
      }).catch(console.error);
    };
    
    fetchPickups();
    const interval = setInterval(fetchPickups, 15000); // 15s polling
    
    // Fetch leaderboard
    request('GET', '/api/leaderboard', undefined, 1).then(data => {
      if (data && data.leaderboard) setLeaderboard(data.leaderboard);
    }).catch(console.error);
    
    return () => clearInterval(interval);
  }, [request, addNotification]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const activePickup = pickups.find(p => ['PENDING', 'ON_THE_WAY', 'COLLECTED'].includes(p.status));
  const completedPickups = pickups.filter(p => p.status === 'COMPLETED');
  const totalKg = completedPickups.reduce((sum, p) => sum + (p.actualWeight || 0), 0);
  
  // Impact Formulas
  const treesSaved = (totalKg / 10).toFixed(1);
  const co2Offset = (totalKg * 2.5).toFixed(1);
  const waterSaved = (totalKg * 15).toFixed(0);

  const nextThreshold = Math.ceil(((user?.points || 0) + 1) / 500) * 500;
  const progress = Math.min(((user?.points || 0) / nextThreshold) * 100, 100);

  const getMedalColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'transparent';
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Hero Greeting */}
      <div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{getTimeGreeting()},</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{user?.name} 👋</h1>
      </div>

      {/* Point Balance Card */}
      <Card variant="default" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--role-pemda) 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Poin Saat Ini</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{user?.points?.toLocaleString()}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.25rem' }}>≈ Rp {pointsToRupiah(user?.points || 0).toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
            <Gift size={24} color="#fff" />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.9 }}>
            <span>{nextThreshold - (user?.points || 0)} poin lagi untuk level selanjutnya</span>
            <span>{nextThreshold}</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#fff', borderRadius: '3px' }} />
          </div>
        </div>
      </Card>

      {/* Impact Calculator Widget */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.5rem' }}>Dampak Sosial Lingkungan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <Card variant="bordered" padding="sm" style={{ textAlign: 'center', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ color: '#16a34a', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Leaf size={24} /></div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#166534' }}>{treesSaved}</div>
          <div style={{ fontSize: '0.65rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Pohon Diselamatkan</div>
        </Card>
        <Card variant="bordered" padding="sm" style={{ textAlign: 'center', backgroundColor: '#fdf4ff', borderColor: '#fbcfe8' }}>
          <div style={{ color: '#c026d3', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Cloud size={24} /></div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#86198f' }}>{co2Offset}</div>
          <div style={{ fontSize: '0.65rem', color: '#a21caf', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Kg CO₂ Berkurang</div>
        </Card>
        <Card variant="bordered" padding="sm" style={{ textAlign: 'center', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ color: '#2563eb', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Droplets size={24} /></div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e40af' }}>{waterSaved}</div>
          <div style={{ fontSize: '0.65rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Liter Air Hemat</div>
        </Card>
      </div>

      {/* Active Pickup */}
      {activePickup && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Jemputan Aktif</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
               <div style={{ width: '6px', height: '6px', backgroundColor: '#059669', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
               Live
            </div>
          </div>
          <Card variant="bordered" onClick={() => navigate(`/rumah_tangga/pickup/${activePickup.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Badge status={activePickup.status} pulse />
                <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{activePickup.wasteTypes.join(', ')}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Est. {activePickup.estimatedWeight} kg</div>
              </div>
              <ArrowRight size={20} color="var(--color-text-secondary)" />
            </div>
          </Card>
        </div>
      )}

      {/* Gamification Leaderboard */}
      {leaderboard.length > 0 && (
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Trophy size={20} color="#fbbf24" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Top Pahlawan Lingkungan</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaderboard.slice(0, 5).map((lUser, idx) => (
              <div 
                key={lUser.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: user?.id === lUser.id ? '#ecfdf5' : '#f8fafc',
                  border: user?.id === lUser.id ? '1px solid #10b981' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    backgroundColor: idx < 3 ? getMedalColor(idx) : '#cbd5e1', 
                    color: idx < 3 ? '#fff' : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem',
                    boxShadow: idx < 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontWeight: user?.id === lUser.id ? 700 : 500, color: '#0f172a' }}>
                    {user?.id === lUser.id ? 'Anda' : lUser.name}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.875rem' }}>
                  {lUser.points} Pts
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Action */}
      <div style={{ marginTop: '0.5rem' }}>
        <Button fullWidth size="lg" onClick={() => navigate('/rumah_tangga/request')} style={{ fontSize: '1.125rem' }}>
          Pesan Jemput Sekarang <ArrowRight size={20} />
        </Button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }
      `}</style>
    </div>
  );
}
