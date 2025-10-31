import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createActionneur, listActionneurs } from '../controllers/actionneurs.controller.js';

const router = Router();

router.post('/', asyncHandler(createActionneur));
router.get('/', asyncHandler(listActionneurs));

export default router;