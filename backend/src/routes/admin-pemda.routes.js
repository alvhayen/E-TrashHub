import express from 'express';
import { getPemdaStats, getPemdaList } from '../controllers/admin-pemda.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('ADMIN_PEMDA'));

// We would normally also have a role check middleware like `authorize(['ADMIN_PEMDA'])` here
router.get('/stats', getPemdaStats);
router.get('/list', getPemdaList);

export default router;
