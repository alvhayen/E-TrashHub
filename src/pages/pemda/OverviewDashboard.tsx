import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { ArrowUp, ArrowDown, Activity, Trash2, CheckCircle2, Users, Leaf, Cloud, Droplets } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function OverviewDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('id-ID'));

  // Mock data as specified
  const volumeData = [
    { day: 'Sen', vol: 11.2 }, { day: 'Sel', vol: 12.0 }, { day: 'Rab', vol: 11.8 },
    { day: 'Kam', vol: 13.5 }, { day: 'Jum', vol: 14.2 }, { day: 'Sab', vol: 15.0 }, { day: 'Min', vol: 12.5 }
  ];

  const trendData = [
    { week: 'Minggu 1', managed: 70, unmanaged: 30 },
    { week: 'Minggu 2', managed: 72, unmanaged: 28 },
    { week: 'Minggu 3', managed: 75, unmanaged: 25 },
    { week: 'Minggu 4', managed: 78, unmanaged: 22 }
  ];

  const managedRatioData = [
    { name: 'Terkelola', value: 78, color: '#059669' },
    { name: 'Tidak Terkelola', value: 22, color: '#ef4444' }
  ];

  const wasteCompositionData = [
    { name: 'Plastik', value: 60, color: '#3b82f6' },
    { name: 'Kertas', value: 20, color: '#f59e0b' },
    { name: 'Logam', value: 15, color: '#6366f1' },
    { name: 'Lainnya', value: 5, color: '#94a3b8' }
  ];

  const zones = [
    { rank: 1, name: 'Barat-A', compliance: 92, volume: 4500, users: 480 },
    { rank: 2, name: 'Timur-B', compliance: 87, volume: 3800, users: 350 },
    { rank: 3, name: 'Selatan-C', compliance: 75, volume: 2100, users: 220 },
    { rank: 4, name: 'Utara-D', compliance: 71, volume: 1800, users: 110 },
    { rank: 5, name: 'Pusat-E', compliance: 68, volume: 1600, users: 80 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Executive Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Analitik Pengelolaan Sampah Kota Surabaya</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#059669', backgroundColor: '#d1fae5', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', animation: 'pulse 2s infinite' }} />
          Live Update: {lastUpdated}
        </div>
      </div>

      {/* Impact Calculator Widget (City-scale extrapolation mapping) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <Card variant="bordered" padding="lg" style={{ textAlign: 'center', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ color: '#16a34a', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><Leaf size={32} /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>1,250</div>
          <div style={{ fontSize: '0.875rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Pohon Diselamatkan</div>
        </Card>
        <Card variant="bordered" padding="lg" style={{ textAlign: 'center', backgroundColor: '#fdf4ff', borderColor: '#fbcfe8' }}>
          <div style={{ color: '#c026d3', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><Cloud size={32} /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#86198f' }}>31,250</div>
          <div style={{ fontSize: '0.875rem', color: '#a21caf', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Kg CO₂ Berkurang</div>
        </Card>
        <Card variant="bordered" padding="lg" style={{ textAlign: 'center', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ color: '#2563eb', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><Droplets size={32} /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af' }}>187,500</div>
          <div style={{ fontSize: '0.875rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.2 }}>Liter Air Dihemat</div>
        </Card>
      </div>

      {/* Row 1: KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Volume Anorganik Hari Ini</h3>
            <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px' }}><Trash2 size={20} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>12.5 <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Ton</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUp size={16} /> 5% dari kemarin
          </div>
        </Card>
        
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tingkat Pengelolaan</h3>
            <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px' }}><Activity size={20} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>78<span style={{ fontSize: '1.5rem' }}>%</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUp size={16} /> 3% bulan ini
          </div>
        </Card>

        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Kepatuhan Pemilahan</h3>
            <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px' }}><CheckCircle2 size={20} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>85<span style={{ fontSize: '1.5rem' }}>%</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUp size={16} /> 2% dari kemarin
          </div>
        </Card>

        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Rumah Tangga Aktif</h3>
            <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px' }}><Users size={20} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>1,240</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Terdaftar di platform
          </div>
        </Card>
      </div>

      {/* Row 2: Daily Volume Chart */}
      <Card variant="bordered" padding="xl">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Volume Anorganik Harian (7 Hari Terakhir)</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14}} dx={-10} />
              <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="vol" radius={[4, 4, 0, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === volumeData.length - 1 ? '#f59e0b' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 3: Donuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card variant="bordered" padding="xl">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Terkelola vs Tidak Terkelola</h3>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={managedRatioData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {managedRatioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '0.875rem', fontWeight: 600}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card variant="bordered" padding="xl">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Komposisi Jenis Anorganik</h3>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wasteCompositionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {wasteCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '0.875rem', fontWeight: 600}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 4: Weekly Trend Line */}
      <Card variant="bordered" padding="xl">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Trend Bulanan Pengelolaan</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorManaged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUnmanaged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontWeight: 600}} />
              <Area type="monotone" dataKey="managed" name="Terkelola (%)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorManaged)" />
              <Area type="monotone" dataKey="unmanaged" name="Tidak Terkelola (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorUnmanaged)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 5: Zone Compliance Table */}
      <Card variant="default">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', padding: '0 0.5rem' }}>Peringkat Kepatuhan per Zona</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Peringkat</th>
                <th style={{ padding: '1rem 0.5rem' }}>Zona / Kecamatan</th>
                <th style={{ padding: '1rem 0.5rem' }}>Kepatuhan Pemilahan</th>
                <th style={{ padding: '1rem 0.5rem' }}>Volume (kg)</th>
                <th style={{ padding: '1rem 0.5rem' }}>Nasabah Aktif</th>
                <th style={{ padding: '1rem 0.5rem' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.rank} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }} className="hover:bg-slate-50">
                  <td style={{ padding: '1.25rem 0.5rem', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>#{z.rank}</td>
                  <td style={{ padding: '1.25rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>{z.name}</td>
                  <td style={{ padding: '1.25rem 0.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 700,
                      backgroundColor: z.compliance > 80 ? '#d1fae5' : z.compliance > 60 ? '#fef3c7' : '#fee2e2',
                      color: z.compliance > 80 ? '#059669' : z.compliance > 60 ? '#d97706' : '#dc2626'
                    }}>
                      {z.compliance}%
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 0.5rem', fontWeight: 600 }}>{z.volume.toLocaleString()}</td>
                  <td style={{ padding: '1.25rem 0.5rem', color: 'var(--color-text-secondary)' }}>{z.users}</td>
                  <td style={{ padding: '1.25rem 0.5rem' }}>
                    {z.compliance > 75 ? <ArrowUp color="#059669" size={20} /> : <ArrowDown color="#dc2626" size={20} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
          100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }
      `}</style>
    </div>
  );
}
