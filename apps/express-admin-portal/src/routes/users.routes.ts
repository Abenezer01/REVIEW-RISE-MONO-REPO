import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { validateRequest } from '@platform/middleware';
import { z } from 'zod';

const router = Router();

const UserIdParamSchema = z.object({ userId: z.string().uuid() });

router.get('/:userId/businesses', validateRequest(UserIdParamSchema, 'params'), usersController.getUserBusinesses);

export default router;
