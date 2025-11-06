import { Router } from 'express';
import { AIController } from '../controllers/AIController';

const router = Router();

router.post('/generate-caption', AIController.generateCaption);
router.post('/enhance-content', AIController.enhanceContent);
router.post('/generate-hashtags', AIController.generateHashtags);

export default router;
