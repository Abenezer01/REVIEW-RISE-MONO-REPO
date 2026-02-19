import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/user-business-roles', authenticate, rolesController.getUserBusinessRoles);

export default router;
