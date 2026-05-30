import express from 'express';
import { getPemdaStats, getPemdaList, updatePemdaStatus, getPemdaRegions } from '../controllers/admin-pemda.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('ADMIN_PEMDA'));

router.get('/stats', getPemdaStats);
router.get('/list', getPemdaList);
router.get('/regions', getPemdaRegions);
router.patch('/:id/status', updatePemdaStatus);

export default router;
