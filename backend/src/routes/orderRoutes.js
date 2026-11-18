import { Router } from 'express';
import { createOrder, listMyOrders, getOrderById } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/my', listMyOrders);
router.get('/:id', getOrderById);

export default router;
