import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth';
import { createCustomer, getCustomerById } from '../controllers/customerController';

const router = Router();

router.post('/', verifyAdmin, createCustomer);
router.get('/:id', verifyAdmin, getCustomerById);

export default router;

