import { Router } from 'express';
import { HistoryController } from '../controllers/HistoryController';

const router = Router();

router.get('/', HistoryController.getAll);
router.get('/post/:postId', HistoryController.getByPostId);

export default router;
