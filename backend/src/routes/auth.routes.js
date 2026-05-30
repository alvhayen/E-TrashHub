import express from 'express';
import { register, login, getMe, getLeaderboard, updateProfile, claimBonus, getGoogleAuthUrl, handleGoogleCallback, completeGoogleProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ─── EMAIL/PASSWORD AUTH ───────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/claim-bonus', verifyToken, claimBonus);
router.get('/leaderboard', getLeaderboard);

// ─── GOOGLE OAUTH ──────────────────────────────────────
router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/complete', completeGoogleProfile);

export default router;
