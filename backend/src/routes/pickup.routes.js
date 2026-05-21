import express from 'express';
import { 
  createPickup, 
  getHouseholdPickups, 
  getDriverPickups, 
  updateStatus, 
  getAdminPickups, 
  verifyPickup, 
  getPickupAnalytics 
} from '../controllers/pickup.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', authorizeRole('rumah_tangga'), createPickup);
router.get('/household', authorizeRole('rumah_tangga'), getHouseholdPickups);

router.get('/driver', authorizeRole('driver'), getDriverPickups);
router.patch('/:id/status', authorizeRole('driver'), updateStatus);

router.get('/admin', authorizeRole('admin_tps3r'), getAdminPickups);
router.post('/:id/verify', authorizeRole('admin_tps3r'), verifyPickup);

router.get('/analytics', authorizeRole('pemda'), getPickupAnalytics);

export default router;
