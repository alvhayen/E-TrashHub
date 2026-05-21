import express from 'express';
import { register, login, getMe, getLeaderboard } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/leaderboard', getLeaderboard);

export default router;
