import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth';
import {
  getTotalBookings,
  getRevenueByMovie,
  getRevenueByShow,
  getAvailableSeats,
  getBookedSeats,
} from '../controllers/reportController';

const router = Router();

// Protect all reports
router.use(verifyAdmin);

router.get('/total-bookings', getTotalBookings);
router.get('/revenue-by-movie', getRevenueByMovie);
router.get('/revenue-by-show', getRevenueByShow);
router.get('/available-seats', getAvailableSeats);
router.get('/booked-seats', getBookedSeats);

export default router;
