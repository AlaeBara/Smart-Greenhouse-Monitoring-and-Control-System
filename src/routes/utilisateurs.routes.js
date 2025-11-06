import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../utils/index.js';
import { register, login, getProfile, logout } from '../controllers/utilisateurs.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/register', [
  body('nom').isString().notEmpty(),
  body('email').isEmail(),
  body('mot_de_passe').isLength({ min: 6 }),
], validate, asyncHandler(register));

router.post('/login', [
  body('email').isEmail(),
  body('mot_de_passe').isString().notEmpty(),
], validate, asyncHandler(login));

router.get('/me', authMiddleware, asyncHandler(getProfile));

router.post('/logout', asyncHandler(logout));

export default router;