import { Router } from 'express';
import { MediaController } from '../controllers/MediaController';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', upload.single('file'), MediaController.upload);
router.get('/', MediaController.getAll);
router.delete('/:id', MediaController.delete);

export default router;
