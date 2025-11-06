import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createHistoriqueAction, listHistoriqueActions, listHistoriqueByActionneur, getLastActionPerActionneur } from '../controllers/historiqueActions.controller.js';

const router = Router();

router.post('/', asyncHandler(createHistoriqueAction));
router.get('/', asyncHandler(listHistoriqueActions));
router.get('/actionneur/:actionneurId', asyncHandler(listHistoriqueByActionneur));
router.get('/last-per-actionneur', asyncHandler(getLastActionPerActionneur));

export default router;