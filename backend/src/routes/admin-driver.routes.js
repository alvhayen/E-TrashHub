import express from 'express';
import { getDriverStats, getDriverList, updateDriverStatus, getDriverActivity } from '../controllers/admin-driver.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('ADMIN_DRIVER'));

router.get('/stats', getDriverStats);
router.get('/list', getDriverList);
router.get('/activity', getDriverActivity);
router.patch('/:id/status', updateDriverStatus);

export default router;
