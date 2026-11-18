import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getMyProfile);
router.put('/', updateMyProfile);

router.get('/addresses', listMyAddresses);
router.post('/addresses', createMyAddress);
router.put('/addresses/:id', updateMyAddress);
router.delete('/addresses/:id', deleteMyAddress);

export default router;
