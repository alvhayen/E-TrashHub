import express from 'express';
import { 
  createPickup, 
  getHouseholdPickups, 
  getDriverPickups, 
  updateStatus,
  acceptPickup,
  cancelAcceptPickup,
  deliverToTPS3R,
  getDriverActiveTask,
  getActiveTPS3RList,
  getAdminPickups, 
  verifyPickup, 
  getPickupAnalytics 
} from '../controllers/pickup.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', authorizeRole('RUMAH_TANGGA'), createPickup);
router.get('/household', authorizeRole('RUMAH_TANGGA'), getHouseholdPickups);

router.get('/driver', authorizeRole('DRIVER'), getDriverPickups);
router.patch('/:id/status', authorizeRole('DRIVER'), updateStatus);

router.get('/driver/active', authorizeRole('DRIVER'), getDriverActiveTask);
router.get('/driver/tps3r-list', authorizeRole('DRIVER'), getActiveTPS3RList);
router.patch('/:id/accept', authorizeRole('DRIVER'), acceptPickup);
router.patch('/:id/cancel-accept', authorizeRole('DRIVER'), cancelAcceptPickup);
router.patch('/:id/deliver', authorizeRole('DRIVER'), deliverToTPS3R);

router.get('/admin', authorizeRole('ADMIN_TPS3R'), getAdminPickups);
router.post('/:id/verify', authorizeRole('ADMIN_TPS3R'), verifyPickup);

router.get('/analytics', authorizeRole('PEMDA'), getPickupAnalytics);

export default router;
