import { Router } from 'express';
import multer from 'multer';
import {
  getAdminDashboardStats,
  listAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import { uploadProductImage } from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminDashboardStats);
router.get('/orders', listAllOrdersAdmin);
router.patch('/orders/:id/status', updateOrderStatusAdmin);
router.post('/upload-image', upload.single('image'), uploadProductImage);

export default router;
