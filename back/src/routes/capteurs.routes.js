import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createCapteur, listCapteurs} from '../controllers/capteurs.controller.js';

const router = Router();

router.post('/', asyncHandler(createCapteur));
router.get('/', asyncHandler(listCapteurs));

export default router;