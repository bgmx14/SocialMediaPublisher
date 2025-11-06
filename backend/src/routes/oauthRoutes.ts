import { Router } from 'express';
import { OAuthController } from '../controllers/OAuthController';

const router = Router();

// Initiate OAuth flow for any platform
router.get('/:platform/authorize', OAuthController.initiateOAuth);

// OAuth callbacks
router.get('/facebook/callback', OAuthController.handleFacebookCallback);
router.get('/instagram/callback', OAuthController.handleFacebookCallback); // Instagram uses Facebook OAuth
router.get('/twitter/callback', OAuthController.handleTwitterCallback);
router.get('/linkedin/callback', OAuthController.handleLinkedInCallback);

// Refresh token
router.post('/refresh/:accountId', OAuthController.refreshToken);

export default router;
