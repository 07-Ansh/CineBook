import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth';
import { getAllShows, getShowById, getShowsByMovie, createShow, updateShow, deleteShow } from '../controllers/showController';

const router = Router();

router.get('/', getAllShows);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);
router.post('/', verifyAdmin, createShow);
router.put('/:id', verifyAdmin, updateShow);
router.delete('/:id', verifyAdmin, deleteShow);

export default router;
