import { Router } from 'express';
import { facebookController } from '../../controllers/facebook.controller';
import { linkedInController } from '../../controllers/linkedin.controller';
import { socialController } from '../../controllers/social.controller';
import { socialConnectionController } from '../../controllers/social-connection.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '@platform/middleware';
import {
    ListConnectionsQuerySchema,
    ConnectionIdParamSchema,
    FacebookAuthUrlQuerySchema,
    FacebookCallbackBodySchema,
    FacebookConnectPageBodySchema,
    FacebookPageIdParamSchema,
    FacebookInstagramConnectBodySchema,
    LinkedInAuthUrlQuerySchema,
    LinkedInCallbackBodySchema,
    LinkedInConnectOrgBodySchema
} from '@platform/contracts';

const router = Router();

// Unified Publishing (Internal)
router.post('/publish', socialController.publish);

// Public routes (Auth flow starts here, usually public or guarded by minimal token)
router.use(authenticate);

// Facebook Routes
router.get('/facebook/auth-url', validateRequest(FacebookAuthUrlQuerySchema, 'query'), (req, res) => facebookController.getAuthUrl(req, res));
router.post('/facebook/callback', validateRequest(FacebookCallbackBodySchema), (req, res) => facebookController.handleCallback(req, res)); // Called by frontend with code
router.get('/facebook/pages', (req, res) => facebookController.listPages(req, res));
router.post('/facebook/connect', validateRequest(FacebookConnectPageBodySchema), (req, res) => facebookController.connectPage(req, res));
router.get('/facebook/pages/:pageId/instagram-accounts', validateRequest(FacebookPageIdParamSchema, 'params'), (req, res) => facebookController.getInstagramAccounts(req, res));
router.post('/instagram/connect', validateRequest(FacebookInstagramConnectBodySchema), (req, res) => facebookController.connectInstagram(req, res));

// LinkedIn Routes
router.get('/linkedin/auth-url', validateRequest(LinkedInAuthUrlQuerySchema, 'query'), (req, res) => linkedInController.getAuthUrl(req, res));
router.post('/linkedin/callback', validateRequest(LinkedInCallbackBodySchema), (req, res) => linkedInController.handleCallback(req, res));
router.get('/linkedin/organizations', (req, res) => linkedInController.listOrganizations(req, res));
router.post('/linkedin/connect', validateRequest(LinkedInConnectOrgBodySchema), (req, res) => linkedInController.connectOrganization(req, res));

// Connection Management Routes
router.get('/connections', validateRequest(ListConnectionsQuerySchema, 'query'), (req, res) => socialConnectionController.listConnections(req, res));
router.get('/connections/:id', validateRequest(ConnectionIdParamSchema, 'params'), (req, res) => socialConnectionController.getConnection(req, res));
router.delete('/connections/:id', validateRequest(ConnectionIdParamSchema, 'params'), (req, res) => socialConnectionController.disconnect(req, res));
router.post('/connections/:id/refresh', validateRequest(ConnectionIdParamSchema, 'params'), (req, res) => socialConnectionController.refreshConnection(req, res));

export default router;
