import express from 'express';
import { createOrder, getCustomerOrders, getAdminOrders, updateOrderStatus, getDriverOrders, getOrderById } from '../controllers/order.controller.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// Customer routes
router.post('/', authorizeRole('CUSTOMER'), createOrder);
router.get('/customer', authorizeRole('CUSTOMER'), getCustomerOrders);
router.patch('/:id/complete', authorizeRole('CUSTOMER'), async (req, res, next) => {
  req.body.status = 'COMPLETED';
  next();
}, updateOrderStatus);

// Admin TPS3R routes
router.get('/admin', authorizeRole('ADMIN_TPS3R'), getAdminOrders);
router.patch('/:id/status', authorizeRole('ADMIN_TPS3R'), updateOrderStatus);

// Driver Mitra TPS3R routes
router.get('/driver', authorizeRole('DRIVER'), getDriverOrders);
router.patch('/:id/driver-status', authorizeRole('DRIVER'), updateOrderStatus);
router.get('/:id', authorizeRole('DRIVER'), getOrderById);

export default router;
