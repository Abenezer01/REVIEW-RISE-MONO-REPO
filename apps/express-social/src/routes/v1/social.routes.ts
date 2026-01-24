import { Router } from 'express';
import { facebookController } from '../../controllers/facebook.controller';
import { linkedInController } from '../../controllers/linkedin.controller';
import { socialController } from '../../controllers/social.controller';
import { socialConnectionController } from '../../controllers/social-connection.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Unified Publishing (Internal)
router.post('/publish', socialController.publish);

// Public routes (Auth flow starts here, usually public or guarded by minimal token)
router.use(authenticate);

// Facebook Routes
router.get('/facebook/auth-url', facebookController.getAuthUrl);
router.post('/facebook/callback', facebookController.handleCallback); // Called by frontend with code
router.get('/facebook/pages', facebookController.listPages);
router.post('/facebook/connect', facebookController.connectPage);
router.get('/facebook/pages/:pageId/instagram-accounts', facebookController.getInstagramAccounts);
router.post('/instagram/connect', facebookController.connectInstagram);

// LinkedIn Routes
router.get('/linkedin/auth-url', linkedInController.getAuthUrl);
router.post('/linkedin/callback', linkedInController.handleCallback);
router.get('/linkedin/organizations', linkedInController.listOrganizations);
router.post('/linkedin/connect', linkedInController.connectOrganization);

// Connection Management Routes
router.get('/connections', socialConnectionController.listConnections);
router.get('/connections/:id', socialConnectionController.getConnection);
router.delete('/connections/:id', socialConnectionController.disconnect);
router.post('/connections/:id/refresh', socialConnectionController.refreshConnection);

export default router;
