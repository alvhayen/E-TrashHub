import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-etrashhub';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, code: 'NO_TOKEN', error: 'Token tidak ditemukan. Silakan login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', error: 'Sesi telah berakhir. Silakan login kembali.' });
    }
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', error: 'Token tidak valid.' });
  }
};

export const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Tidak terautentikasi.' });
  }
  const userRole = req.user.role?.toUpperCase();
  const allowedRoles = roles.map(r => r.toUpperCase());
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, code: 'FORBIDDEN', error: `Akses ditolak. Role ${userRole} tidak diizinkan.` });
  }
  next();
};

export const checkActiveStatus = async (req, res, next) => {
  if (!req.user) return next();
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { verificationStatus: true }
    });
    if (!user) return res.status(401).json({ success: false, error: 'User tidak ditemukan.' });
    if (user.verificationStatus === 'PENDING') {
      return res.status(403).json({ success: false, code: 'PENDING_VERIFICATION', error: 'Akun sedang dalam proses verifikasi.' });
    }
    if (user.verificationStatus === 'REJECTED') {
      return res.status(403).json({ success: false, code: 'REJECTED', error: 'Akun ditolak.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
