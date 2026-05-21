import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/form/Input';
import { Edit2, Trash2, Plus } from 'lucide-react';

export default function InventoryManager() {
  const { request } = useApi();
  const { success, error } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [commodity, setCommodity] = useState('');
  const [stockKg, setStockKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [status, setStatus] = useState('READY');

  const fetchInventory = async () => {
    try {
      const data = await request('GET', '/api/inventory/admin');
      setInventory(data.inventory || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const openForm = (item?: any) => {
    if (item) {
      setEditingId(item.id); setCommodity(item.commodity);
      setStockKg(item.stockKg.toString()); setPricePerKg(item.pricePerKg.toString());
      setStatus(item.status);
    } else {
      setEditingId(null); setCommodity(''); setStockKg(''); setPricePerKg(''); setStatus('READY');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { commodity, stockKg: parseFloat(stockKg), pricePerKg: parseFloat(pricePerKg), status };
      if (editingId) {
        await request('PATCH', `/api/inventory/${editingId}`, payload);
        success('Inventori diperbarui');
      } else {
        await request('POST', '/api/inventory', payload);
        success('Komoditas ditambahkan');
      }
      setIsModalOpen(false); fetchInventory();
    } catch (err: any) { error(err.message || 'Gagal menyimpan data'); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus komoditas ini?')) {
      try {
        await request('DELETE', `/api/inventory/${id}`);
        success('Komoditas dihapus'); fetchInventory();
      } catch (err: any) { error('Gagal menghapus komoditas'); }
    }
  };

  return (
    <PageContainer 
      title="Kelola Inventori" 
      subtitle="Manajemen stok komoditas untuk ditawarkan ke B2B"
      actions={<Button onClick={() => openForm()} icon={Plus} style={{ backgroundColor: 'var(--role-admin)' }}>Tambah Komoditas</Button>}
    >
      <Card variant="default">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '0.75rem' }}>Komoditas</th>
                <th style={{ padding: '0.75rem' }}>Stok Tersedia</th>
                <th style={{ padding: '0.75rem' }}>Harga Penawaran (/kg)</th>
                <th style={{ padding: '0.75rem' }}>Status Penjualan</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{item.commodity}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{item.stockKg} kg</td>
                  <td style={{ padding: '1rem 0.75rem' }}>Rp {item.pricePerKg.toLocaleString()}</td>
                  <td style={{ padding: '1rem 0.75rem' }}><Badge status={item.status} /></td>
                  <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                    <button onClick={() => openForm(item)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#f59e0b', padding: '0.25rem', marginRight: '0.5rem' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#ef4444', padding: '0.25rem' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Inventori kosong</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Komoditas' : 'Tambah Komoditas Baru'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nama Komoditas" value={commodity} onChange={e => setCommodity(e.target.value)} placeholder="Contoh: Botol Plastik PET Bersih" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Total Stok (kg)" type="number" step="0.1" value={stockKg} onChange={e => setStockKg(e.target.value)} />
            <Input label="Harga per kg (Rp)" type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Status Penjualan B2B</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}>
              <option value="READY">READY (Siap Dibeli)</option>
              <option value="PROCESSING">PROCESSING (Pemrosesan Internal)</option>
              <option value="SOLD_OUT">SOLD OUT (Kosong)</option>
            </select>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} style={{ backgroundColor: 'var(--role-admin)' }}>Simpan Data</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
