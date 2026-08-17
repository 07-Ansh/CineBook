import { Router } from 'express';
import { getSeatsByShow } from '../controllers/seatController';

const router = Router();

router.get('/show/:showId', getSeatsByShow);

export default router;
