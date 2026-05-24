import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-etrashhub';

export const register = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    if (role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Cannot register as SUPER_ADMIN' });

    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    let userData = {
      email,
      password: passwordHash,
      name,
      role,
      phone,
    };

    let requiresVerification = false;

    // Logika register per role
    if (role === 'RUMAH_TANGGA') {
      const { houseRole, address, postalCode } = req.body;
      userData = { ...userData, houseRole, address, postalCode, verificationStatus: 'ACTIVE' };
    } else if (role === 'DRIVER') {
      const { driverType, domicile } = req.body;
      userData = { ...userData, driverType, domicile, verificationStatus: 'ACTIVE' };
    } else if (role === 'MITRA_B2B') {
      const { industryType, companyAddress, companyPostalCode } = req.body;
      userData = { ...userData, industryType, companyAddress, companyPostalCode, verificationStatus: 'ACTIVE' };
    } else if (role === 'ADMIN_TPS3R') {
      const { tpsName, tpsAddress } = req.body;
      userData = { ...userData, tpsName, tpsAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    } else if (role === 'PEMDA') {
      const { region, officeAddress } = req.body;
      userData = { ...userData, region, officeAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Transaction for user and verification queue if needed
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      
      if (requiresVerification) {
        await tx.verificationQueue.create({
          data: {
            userId: user.id,
            role: user.role,
            status: 'PENDING'
          }
        });
      }
      return user;
    });

    if (requiresVerification) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Waiting for admin verification.',
        requiresVerification: true
      });
    }

    // Generate token if active immediately
    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role, name: result.name, driverType: result.driverType, verificationStatus: result.verificationStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        name: result.name,
        verificationStatus: result.verificationStatus
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { verificationQueue: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.verificationStatus === 'PENDING') {
      return res.status(403).json({
        success: false,
        code: 'PENDING_VERIFICATION',
        message: 'Akun Anda sedang dalam proses verifikasi.'
      });
    }

    if (user.verificationStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        code: 'REJECTED',
        message: 'Akun Anda ditolak. Hubungi admin.',
        notes: user.verificationQueue?.notes
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        driverType: user.driverType,
        verificationStatus: user.verificationStatus
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await prisma.user.findMany({
      where: { role: 'RUMAH_TANGGA' },
      orderBy: { points: 'desc' },
      take: 10,
      select: { id: true, name: true, points: true }
    });
    res.json({ leaderboard: topUsers });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        phone: true,
        points: true
      }
    });
    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const claimBonus = async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { points: { increment: 100 } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        phone: true,
        points: true
      }
    });
    res.json({ message: 'Bonus berhasil diklaim', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        verificationStatus: true,
        points: true,
        address: true,
        postalCode: true,
        houseRole: true,
        driverType: true,
        domicile: true,
        tpsName: true,
        tpsAddress: true,
        industryType: true,
        companyAddress: true,
        companyPostalCode: true,
        region: true,
        officeAddress: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
