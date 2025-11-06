import { Router } from 'express';
import { asyncHandler } from '../utils/index.js';
import { getDashboardOverview, getSystemHealth } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/overview', asyncHandler(getDashboardOverview));
router.get('/health', asyncHandler(getSystemHealth));

export default router;