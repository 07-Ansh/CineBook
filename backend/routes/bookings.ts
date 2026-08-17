import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth';
import { getBookingById, getBookingsByCustomer, getAllBookings, deleteBooking } from '../controllers/bookingController';

const router = Router();

router.get('/', verifyAdmin, getAllBookings);
router.get('/customer/:email', getBookingsByCustomer);
router.get('/:id', getBookingById);
router.post('/', (_req, res) => res.status(403).json({ error: 'Bookings must be created through payment verification' }));
router.delete('/:id', verifyAdmin, deleteBooking);

export default router;

