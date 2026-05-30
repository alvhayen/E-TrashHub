import express from 'express';
import { getDriverStats, getDriverList } from '../controllers/admin-driver.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('ADMIN_DRIVER'));

// We would normally also have a role check middleware like `authorize(['ADMIN_DRIVER'])` here
router.get('/stats', getDriverStats);
router.get('/list', getDriverList);

export default router;
