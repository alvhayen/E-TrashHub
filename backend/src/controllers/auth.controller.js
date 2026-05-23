import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-etrashhub';

export const register = async (req, res) => {
  try {
    const { email, password, name, role, address, phone, zone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role,
        address,
        phone,
        zone
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        name: user.name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad Request' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        name: user.name
      }
    });
  } catch (error) {
    console.error(error);
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
        zone: true,
        points: true
      }
    });
    updatedUser.role = updatedUser.role.toLowerCase();
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
        zone: true,
        points: true
      }
    });
    updatedUser.role = updatedUser.role.toLowerCase();
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
        address: true,
        phone: true,
        zone: true,
        points: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = user.role.toLowerCase();

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
