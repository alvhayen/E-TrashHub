import express from 'express';
const router = express.Router();

// TODO: RESTORE AUTH — semua auth route di-stub sementara
// Original imports:
// import { register, login, getMe, getLeaderboard, updateProfile, claimBonus } from '../controllers/auth.controller.js';
// import { verifyToken } from '../middleware/auth.js';

router.post('/register', (req, res) => {
  res.json({ success: true, message: 'AUTH_BYPASSED — register dinonaktifkan sementara' });
});

router.post('/login', (req, res) => {
  res.json({ success: true, message: 'AUTH_BYPASSED — login dinonaktifkan sementara' });
});

router.get('/me', (req, res) => {
  // TODO: RESTORE AUTH — return dynamic user from JWT
  const mockRole = req.headers['x-mock-role'] || 'RUMAH_TANGGA';
  const mockUsers = {
    RUMAH_TANGGA: { id: 'mock-rt-001',  name: 'Sari Dewi',      email: 'sari@email.com',          role: 'RUMAH_TANGGA', status: 'active', points: 1250 },
    DRIVER:       { id: 'mock-drv-001', name: 'Budi Santoso',   email: 'budi.driver@email.com',   role: 'DRIVER',       status: 'active', points: 0 },
    ADMIN_TPS3R:  { id: 'mock-tps-001', name: 'Admin TPS3R',    email: 'admin.tps3r@email.com',   role: 'ADMIN_TPS3R',  status: 'active', points: 0 },
    MITRA_B2B:    { id: 'mock-mtr-001', name: 'Mitra Industri', email: 'mitra@industri.com',      role: 'MITRA_B2B',    status: 'active', points: 0 },
    PEMDA:        { id: 'mock-pmd-001', name: 'Dinas Surabaya', email: 'dinas@surabaya.go.id',    role: 'PEMDA',        status: 'active', points: 0 },
    SUPER_ADMIN:  { id: 'mock-sa-001',  name: 'Super Admin',    email: 'superadmin@etrashhub.id', role: 'SUPER_ADMIN',  status: 'active', points: 0 },
  };
  res.json({ success: true, user: mockUsers[mockRole] ?? mockUsers['RUMAH_TANGGA'] });
});

router.put('/profile', (req, res) => {
  res.json({ success: true, message: 'AUTH_BYPASSED — profile update dinonaktifkan sementara' });
});

router.post('/claim-bonus', (req, res) => {
  res.json({ success: true, message: 'AUTH_BYPASSED — claim bonus dinonaktifkan sementara' });
});

router.get('/leaderboard', (req, res) => {
  res.json({ success: true, leaderboard: [] });
});

export default router;
