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

// public for customer
router.get('/', authorizeRole('CUSTOMER', 'PEMDA', 'ADMIN_TPS3R'), getInventory);

// specific to admin_tps3r
router.get('/admin', authorizeRole('ADMIN_TPS3R'), getAdminInventory);
router.post('/', authorizeRole('ADMIN_TPS3R'), createInventoryItem);
router.patch('/:id', authorizeRole('ADMIN_TPS3R'), updateInventoryItem);
router.delete('/:id', authorizeRole('ADMIN_TPS3R'), deleteInventoryItem);

export default router;
