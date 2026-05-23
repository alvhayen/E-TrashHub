import express from 'express';
import { register, login, getMe, getLeaderboard, updateProfile, claimBonus } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/claim-bonus', verifyToken, claimBonus);
router.get('/leaderboard', getLeaderboard);

export default router;
