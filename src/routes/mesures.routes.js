import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { createMesure, listMesures, getMesure, listMesuresByCapteur, getLastMesure, getLastMesuresPerCapteur, getLastMesuresAllCapteurs, getLastCapteursAndActionneurs } from '../controllers/mesures.controller.js';

const router = Router();

router.post('/', asyncHandler(createMesure));
router.get('/', asyncHandler(listMesures));
router.get('/last', asyncHandler(getLastMesure));
router.get('/last-per-capteur', asyncHandler(getLastMesuresPerCapteur));
router.get('/last-all-capteurs', asyncHandler(getLastMesuresAllCapteurs));
router.get('/last-capteurs-actionneurs', asyncHandler(getLastCapteursAndActionneurs));
router.get('/:id', asyncHandler(getMesure));
router.get('/capteur/:capteurId', asyncHandler(listMesuresByCapteur));
router.get('/last', asyncHandler(getLastMesure));

export default router;