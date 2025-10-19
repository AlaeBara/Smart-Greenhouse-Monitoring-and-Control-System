import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createActionneur, listActionneurs, getActionneur, updateActionneur, deleteActionneur } from '../controllers/actionneurs.controller.js';

const router = Router();

router.post('/', asyncHandler(createActionneur));
router.get('/', asyncHandler(listActionneurs));
router.get('/:id', asyncHandler(getActionneur));
router.put('/:id', asyncHandler(updateActionneur));
router.delete('/:id', asyncHandler(deleteActionneur));

export default router;