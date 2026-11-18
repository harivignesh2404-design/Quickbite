import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { optionalAuth, requireAuth, requireAdmin, requireDatabase } from '../middleware/auth.js';

const router = Router();

router.get('/', requireDatabase, optionalAuth, listCategories);
router.post('/', requireAuth, requireAdmin, createCategory);
router.put('/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);

export default router;
