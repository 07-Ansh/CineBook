import { Router } from 'express';
import { createOrder, verifyPayment, releaseHold } from '../controllers/paymentController';

const router = Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/release-hold', releaseHold);

export default router;

