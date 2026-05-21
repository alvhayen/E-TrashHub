import express from 'express';
import { 
  getInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  getAdminInventory 
} from '../controllers/inventory.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// public for mitra_b2b
router.get('/', authorizeRole('mitra_b2b', 'pemda', 'admin_tps3r'), getInventory);

// specific to admin_tps3r
router.get('/admin', authorizeRole('admin_tps3r'), getAdminInventory);
router.post('/', authorizeRole('admin_tps3r'), createInventoryItem);
router.patch('/:id', authorizeRole('admin_tps3r'), updateInventoryItem);
router.delete('/:id', authorizeRole('admin_tps3r'), deleteInventoryItem);

export default router;
