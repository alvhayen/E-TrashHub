import express from 'express';
import { verifyToken, authorizeRole, checkActiveStatus } from '../middleware/auth.js';
import * as expeditionController from '../controllers/expedition.controller.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkActiveStatus);

// Drivers
router.get('/driver', authorizeRole('DRIVER'), expeditionController.getExpeditionsForDriver);
router.patch('/:id/depart', authorizeRole('DRIVER'), expeditionController.departExpedition);
router.patch('/:id/arrive', authorizeRole('DRIVER'), expeditionController.arriveExpedition);

// Admins
router.get('/admin', authorizeRole('ADMIN_TPS3R'), expeditionController.getExpeditionsForAdmin);
router.post('/', authorizeRole('ADMIN_TPS3R'), expeditionController.createExpedition);

// Cross-role (Admin or Mitra)
router.patch('/:id/confirm', authorizeRole('ADMIN_TPS3R', 'MITRA_B2B'), expeditionController.confirmExpedition);

// Tracking (Driver, Admin, Mitra)
router.get('/tracking/:waybillNumber', authorizeRole('DRIVER', 'ADMIN_TPS3R', 'MITRA_B2B'), expeditionController.trackExpedition);

// General ID lookup (Driver, Admin, or Mitra)
router.get('/:id', authorizeRole('DRIVER', 'ADMIN_TPS3R', 'MITRA_B2B'), expeditionController.getExpeditionById);

export default router;
