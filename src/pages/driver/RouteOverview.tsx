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

// GANTI fungsi getMockCoordinate dengan hook geocoding asli
// Tambahkan state untuk koordinat hasil geocoding (dipindah ke dalam komponen)

// Tambahkan fungsi geocode setelah state declarations
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const encoded = encodeURIComponent(address + ', Kalimantan Timur, Indonesia');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'id' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.warn('Geocode failed for:', address);
  }
  return null;
};

export default function RouteOverview() {
  const { request } = useApi();
  const [tasks, setTasks] = useState<any[]>([]);
  const [coordsMap, setCoordsMap] = useState<Record<number, [number, number]>>({});

  useEffect(() => {
    const loadTasksAndCoords = async () => {
      try {
        const data = await request('GET', '/api/pickup/driver');
        setTasks(data.pickups || []);

        // Geocode semua alamat
        const newCoords: Record<number, [number, number]> = {};
        for (const task of (data.pickups || [])) {
          if (task.status !== 'PENDING' && task.status !== 'ON_THE_WAY') continue;
          const coords = await geocodeAddress(task.address);
          if (coords) newCoords[task.id] = coords;
          // Rate limit Nominatim: tunggu 300ms antar request
          await new Promise(r => setTimeout(r, 300));
        }
        setCoordsMap(newCoords);
      } catch (error) {
        console.error(error);
      }
    };
    loadTasksAndCoords();
  }, [request]);

  const pendingTasks = tasks.filter(t => ['PENDING', 'ON_THE_WAY'].includes(t.status));
  const markers = pendingTasks
    .filter(t => coordsMap[t.id])
    .map(t => ({ ...t, position: coordsMap[t.id] as [number, number] }));
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
        <div className="route-list-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Urutan Titik Lokasi</h2>
            <div style={{ background: 'var(--role-driver)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              {pendingTasks.length} Titik
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
            {pendingTasks.map((task, idx) => (
              <div key={task.id} className="route-card" style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ 
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--role-driver) 0%, #38bdf8 100%)', 
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '1.125rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)'
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.user?.name}
                    </div>
                    <Badge status={task.status} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.address}
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${task.address}`, '_blank')}
                  style={{ 
                    background: '#f0f9ff', border: '1px solid #bae6fd', color: 'var(--role-driver)', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--role-driver)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = 'var(--role-driver)'; }}
                  title="Buka Navigasi Maps"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: '1rem', border: '1px dashed var(--color-border)' }}>
                <MapIcon size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Tidak ada rute penjemputan tersisa.</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Selesaikan tugas untuk mengosongkan rute</div>
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
          height: 300px;
          background-color: #f1f5f9;
          border-radius: 1.5rem;
          border: 4px solid #fff;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }
        .route-list-wrapper {
          display: flex;
          flex-direction: column;
        }
        .route-card {
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }
        .route-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          border-color: rgba(14, 165, 233, 0.3);
        }
        
        @media (min-width: 1024px) {
          .route-layout {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 2.5rem;
            align-items: start;
            height: calc(100vh - 160px);
          }
          .route-map-container {
            height: 100%;
            min-height: 500px;
          }
          .route-list-wrapper {
            height: 100%;
            max-height: calc(100vh - 160px);
            overflow-y: auto;
            padding-right: 0.5rem;
          }
          /* Custom scrollbar for list */
          .route-list-wrapper::-webkit-scrollbar {
            width: 6px;
          }
          .route-list-wrapper::-webkit-scrollbar-track {
            background: transparent;
          }
          .route-list-wrapper::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.1);
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
}
