import { Router } from 'express';
import { PostController } from '../controllers/PostController';

const router = Router();

router.get('/', PostController.getAll);
router.get('/stats', PostController.getStats);
router.get('/date-range', PostController.getByDateRange);
router.get('/:id', PostController.getById);
router.post('/', PostController.create);
router.put('/:id', PostController.update);
router.delete('/:id', PostController.delete);
router.post('/:id/publish', PostController.publish);

export default router;
