// TODO: RESTORE AUTH — Original file backed up. All middleware bypassed for debug.
// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-etrashhub';

export const verifyToken = (req, res, next) => {
  // TODO: RESTORE AUTH — skip JWT verification sementara
  // Inject mock user berdasarkan header X-Mock-Role (untuk testing manual)
  const mockRole = req.headers['x-mock-role'] || 'RUMAH_TANGGA';

  const mockUsers = {
    RUMAH_TANGGA: { id: 1, email: 'sari@email.com',          name: 'Sari',           role: 'RUMAH_TANGGA', driverType: null,          verificationStatus: 'ACTIVE' },
    DRIVER:       { id: 2, email: 'budi.driver@email.com',   name: 'Budi',           role: 'DRIVER',       driverType: 'FREELANCE',   verificationStatus: 'ACTIVE' },
    ADMIN_TPS3R:  { id: 3, email: 'admin.tps3r@email.com',   name: 'Admin TPS3R',    role: 'ADMIN_TPS3R',  driverType: null,          verificationStatus: 'ACTIVE' },
    MITRA_B2B:    { id: 4, email: 'mitra@industri.com',      name: 'Mitra Industri', role: 'MITRA_B2B',    driverType: null,          verificationStatus: 'ACTIVE' },
    PEMDA:        { id: 5, email: 'dinas@surabaya.go.id',    name: 'Dinas Pemda',    role: 'PEMDA',        driverType: null,          verificationStatus: 'ACTIVE' },
    SUPER_ADMIN:  { id: 6, email: 'superadmin@etrashhub.id', name: 'Super Admin',    role: 'SUPER_ADMIN',  driverType: null,          verificationStatus: 'ACTIVE' },
  };

  req.user = mockUsers[mockRole] ?? mockUsers['RUMAH_TANGGA'];
  next();
};

export const authorizeRole = (...roles) => (req, res, next) => {
  // TODO: RESTORE AUTH — skip role check sementara
  next();
};

export const checkActiveStatus = (req, res, next) => {
  // TODO: RESTORE AUTH — skip status check sementara
  next();
};
