import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import {
  getMesuresHistory,
  getActionsHistory,
  getStatistics,
  getTimeline,
  getHourlyTrends
} from '../controllers/historique.controller.js';

const router = Router();

router.get('/mesures', asyncHandler(getMesuresHistory));
router.get('/actions', asyncHandler(getActionsHistory));
router.get('/statistics', asyncHandler(getStatistics));
router.get('/timeline', asyncHandler(getTimeline));
router.get('/trends', asyncHandler(getHourlyTrends));

export default router;