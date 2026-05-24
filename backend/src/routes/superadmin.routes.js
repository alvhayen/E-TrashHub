import express from 'express';
import { verifyToken, authorizeRole, checkActiveStatus } from '../middleware/auth.js';
import * as superAdminController from '../controllers/superadmin.controller.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkActiveStatus);
router.use(authorizeRole('SUPER_ADMIN'));

router.get('/queue', superAdminController.getQueue);
router.patch('/queue/:id/approve', superAdminController.approveQueue);
router.patch('/queue/:id/reject', superAdminController.rejectQueue);
router.get('/users', superAdminController.getUsers);
router.get('/stats', superAdminController.getStats);

export default router;
