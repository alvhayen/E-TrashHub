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
    } else if (role === 'CUSTOMER') {
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
    const { name, phone, address, vehicleType, vehiclePlate, domicile } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address, vehicleType, vehiclePlate, domicile },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        phone: true,
        points: true,
        vehicleType: true,
        vehiclePlate: true,
        domicile: true
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

// ─── GOOGLE OAUTH ───────────────────────────────────────

// Step 1: Generate Google OAuth URL
export const getGoogleAuthUrl = (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ success: true, url: authUrl });
};

// Step 2: Handle Google OAuth callback
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_cancelled`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();

    // Find existing user by email
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      // Existing user — check status
      if (user.verificationStatus === 'PENDING') {
        return res.redirect(`${FRONTEND_URL}/auth/pending-verification`);
      }
      if (user.verificationStatus === 'REJECTED') {
        return res.redirect(`${FRONTEND_URL}/auth/login?error=rejected`);
      }

      // Generate JWT for existing active user
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, driverType: user.driverType, verificationStatus: user.verificationStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token (frontend will store it)
      return res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&status=existing`);
    } else {
      // New user — create a temporary pre-auth token (no role yet)
      // This token only contains Google profile info, valid 15 minutes
      const preAuthToken = jwt.sign(
        { googleEmail: googleUser.email, googleName: googleUser.name, isPreAuth: true },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Redirect to complete-profile page with pre-auth token
      return res.redirect(`${FRONTEND_URL}/auth/complete-profile?token=${preAuthToken}`);
    }
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.redirect(`${FRONTEND_URL}/auth/login?error=server_error`);
  }
};

// Step 3: Complete profile after Google OAuth (for new users)
export const completeGoogleProfile = async (req, res) => {
  try {
    const { preAuthToken, role, ...profileData } = req.body;

    // Verify pre-auth token
    let decoded;
    try {
      decoded = jwt.verify(preAuthToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang dengan Google.' });
    }

    if (!decoded.isPreAuth) {
      return res.status(401).json({ error: 'Token tidak valid.' });
    }

    if (!role || role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    // Check email not already taken
    const existing = await prisma.user.findUnique({ where: { email: decoded.googleEmail } });
    if (existing) {
      // Race condition: user registered between oauth init and complete
      const token = jwt.sign(
        { id: existing.id, email: existing.email, role: existing.role, name: existing.name, driverType: existing.driverType, verificationStatus: existing.verificationStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token, user: { id: existing.id, email: existing.email, role: existing.role, name: existing.name, verificationStatus: existing.verificationStatus } });
    }

    // Build userData berdasarkan role (sama persis seperti register manual)
    let userData = {
      email: decoded.googleEmail,
      name: profileData.name || decoded.googleName,
      role,
      phone: profileData.phone || null,
      password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 10), // random password (user login via Google)
      verificationStatus: 'ACTIVE',
    };

    let requiresVerification = false;

    if (role === 'RUMAH_TANGGA') {
      userData = { ...userData, houseRole: profileData.houseRole, address: profileData.address, postalCode: profileData.postalCode };
    } else if (role === 'DRIVER') {
      userData = { ...userData, driverType: profileData.driverType, domicile: profileData.domicile };
    } else if (role === 'CUSTOMER') {
      userData = { ...userData, industryType: profileData.industryType, companyAddress: profileData.companyAddress, companyPostalCode: profileData.companyPostalCode };
    } else if (role === 'ADMIN_TPS3R') {
      userData = { ...userData, tpsName: profileData.tpsName, tpsAddress: profileData.tpsAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    } else if (role === 'PEMDA') {
      userData = { ...userData, region: profileData.region, officeAddress: profileData.officeAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      if (requiresVerification) {
        await tx.verificationQueue.create({ data: { userId: user.id, role: user.role, status: 'PENDING' } });
      }
      return user;
    });

    if (requiresVerification) {
      return res.status(201).json({ success: true, requiresVerification: true });
    }

    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role, name: result.name, driverType: result.driverType, verificationStatus: result.verificationStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: result.id, email: result.email, role: result.role, name: result.name, verificationStatus: result.verificationStatus }
    });
  } catch (err) {
    console.error('completeGoogleProfile error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
