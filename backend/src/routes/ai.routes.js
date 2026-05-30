import express from 'express';
import { analyzeWaste } from '../controllers/ai.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.post('/analyze-waste', analyzeWaste);

export default router;
