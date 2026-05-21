import express from 'express';
import { 
  getPemdaOverview, 
  getPemdaZones, 
  getPemdaTrends 
} from '../controllers/analytics.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('pemda'));

router.get('/overview', getPemdaOverview);
router.get('/zones', getPemdaZones);
router.get('/trends', getPemdaTrends);

export default router;
