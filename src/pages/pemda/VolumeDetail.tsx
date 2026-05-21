import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VolumeDetail() {
  const [dateRange, setDateRange] = useState('30d');

  const tps3rs = [
    { name: 'TPS3R Surabaya Barat', volume: 4500, percent: 36 },
    { name: 'TPS3R Mulyorejo', volume: 3800, percent: 30 },
    { name: 'TPS3R Rungkut', volume: 2100, percent: 17 },
    { name: 'TPS3R Jambangan', volume: 2100, percent: 17 }
  ];

  const trendData = [
    { name: 'Minggu 1', 'TPS3R Barat': 1000, 'TPS3R Mulyorejo': 900, 'TPS3R Rungkut': 500 },
    { name: 'Minggu 2', 'TPS3R Barat': 1100, 'TPS3R Mulyorejo': 950, 'TPS3R Rungkut': 520 },
    { name: 'Minggu 3', 'TPS3R Barat': 1200, 'TPS3R Mulyorejo': 920, 'TPS3R Rungkut': 540 },
    { name: 'Minggu 4', 'TPS3R Barat': 1200, 'TPS3R Mulyorejo': 1030, 'TPS3R Rungkut': 540 },
  ];

  const handleExport = () => {
    // Generate mock CSV
    const csvContent = "data:text/csv;charset=utf-8,TPS3R,Volume(kg),Persentase\n" 
      + tps3rs.map(t => `${t.name},${t.volume},${t.percent}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "detail_volume_sampah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Detail Timbulan</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Analisis volume sampah berdasarkan titik TPS3R</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button onClick={() => setDateRange('7d')} style={{ padding: '0.5rem 1rem', border: 'none', background: dateRange === '7d' ? '#f1f5f9' : '#fff', fontWeight: dateRange === '7d' ? 600 : 500, cursor: 'pointer' }}>7 Hari</button>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
            <button onClick={() => setDateRange('30d')} style={{ padding: '0.5rem 1rem', border: 'none', background: dateRange === '30d' ? '#f1f5f9' : '#fff', fontWeight: dateRange === '30d' ? 600 : 500, cursor: 'pointer' }}>30 Hari</button>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
            <button onClick={() => setDateRange('90d')} style={{ padding: '0.5rem 1rem', border: 'none', background: dateRange === '90d' ? '#f1f5f9' : '#fff', fontWeight: dateRange === '90d' ? 600 : 500, cursor: 'pointer' }}>90 Hari</button>
          </div>
          <Button variant="outline" icon={Calendar}>Kustom</Button>
          <Button onClick={handleExport} icon={Download} style={{ backgroundColor: '#059669' }}>Export CSV</Button>
        </div>
      </div>

      <Card variant="default">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Breakdown Volume per Fasilitas (kg)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Fasilitas TPS3R</th>
                <th style={{ padding: '1rem' }}>Total Volume (kg)</th>
                <th style={{ padding: '1rem' }}>Kontribusi</th>
                <th style={{ padding: '1rem', width: '40%' }}>Progres Aktual</th>
              </tr>
            </thead>
            <tbody>
              {tps3rs.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{t.name}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{t.volume.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}><span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{t.percent}%</span></td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.percent}%`, backgroundColor: '#059669', height: '100%', borderRadius: '4px' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card variant="bordered" padding="xl">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Trend Volume Multi-Fasilitas</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Line type="monotone" dataKey="TPS3R Barat" stroke="#059669" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="TPS3R Mulyorejo" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="TPS3R Rungkut" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
