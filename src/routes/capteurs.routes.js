import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createCapteur, listCapteurs, getCapteur, updateCapteur, deleteCapteur } from '../controllers/capteurs.controller.js';

const router = Router();

router.post('/', asyncHandler(createCapteur));
router.get('/', asyncHandler(listCapteurs));
router.get('/:id', asyncHandler(getCapteur));
router.put('/:id', asyncHandler(updateCapteur));
router.delete('/:id', asyncHandler(deleteCapteur));

export default router;