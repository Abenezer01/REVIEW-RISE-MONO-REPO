import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

const router = Router();

// GET /users/:userId/businesses
router.get('/:userId/businesses', usersController.getUserBusinesses);

export default router;
