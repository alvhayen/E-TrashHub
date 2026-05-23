import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { Map as MapIcon, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BALIKPAPAN_CENTER: [number, number] = [-1.2379, 116.8529];

const getMockCoordinate = (idx: number): [number, number] => {
  const offset = 0.005 * (idx + 1);
  return [
    BALIKPAPAN_CENTER[0] + (idx % 2 === 0 ? offset : -offset), 
    BALIKPAPAN_CENTER[1] + (idx % 3 === 0 ? offset : -offset)
  ];
};

export default function RouteOverview() {
  const { request } = useApi();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/pickup/driver').then(data => {
      setTasks(data.pickups || []);
    }).catch(console.error);
  }, [request]);

  const pendingTasks = tasks.filter(t => ['PENDING', 'ON_THE_WAY'].includes(t.status));
  const markers = pendingTasks.map((t, idx) => ({ ...t, position: getMockCoordinate(idx) }));
  const polylinePositions = markers.map(m => m.position);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header className="page-header">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Rute Penjemputan</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Estimasi Jarak: ±12.5 km</div>
      </header>

      {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
      <div className="page-content route-layout" style={{ flex: 1 }}>
        {/* Map */}
        <div className="route-map-container">
          <MapContainer 
            center={BALIKPAPAN_CENTER} 
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, idx) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <strong>Urutan {idx + 1}: {marker.user?.name}</strong><br />
                  {marker.address}
                </Popup>
              </Marker>
            ))}
            {polylinePositions.length > 1 && (
              <Polyline positions={polylinePositions} color="var(--role-driver)" weight={4} opacity={0.7} />
            )}
          </MapContainer>
        </div>

        {/* Route list */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Urutan Titik Lokasi ({pendingTasks.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingTasks.map((task, idx) => (
              <Card key={task.id} variant="bordered" padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--role-driver)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.user?.name}</div>
                    <Badge status={task.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.address}
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${task.address}`, '_blank')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--role-driver)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                >
                  <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: 'var(--radius-full)' }}>
                    <ExternalLink size={16} />
                  </div>
                </button>
              </Card>
            ))}
            {pendingTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Tidak ada rute penjemputan tersisa.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .route-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .route-map-container {
          width: 100%;
          height: 260px;
          background-color: #f1f5f9;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          overflow: hidden;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) {
          .route-layout {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 2rem;
            align-items: start;
          }
          .route-map-container {
            height: 480px;
            position: sticky;
            top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
