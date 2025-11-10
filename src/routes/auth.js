import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, refreshSchema } from '../validation/auth.js';
import * as authController from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;
