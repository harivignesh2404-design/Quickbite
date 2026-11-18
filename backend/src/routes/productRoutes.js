import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAuth, requireAdmin, requireDatabase } from '../middleware/auth.js';

const router = Router();

router.get('/', requireDatabase, listProducts);
router.get('/:id', requireDatabase, getProductById);

router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.patch('/:id/availability', requireAuth, requireAdmin, toggleProductAvailability);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;
