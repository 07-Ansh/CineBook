import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth';
import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/movieController';

const router = Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', verifyAdmin, createMovie);
router.put('/:id', verifyAdmin, updateMovie);
router.delete('/:id', verifyAdmin, deleteMovie);

export default router;
