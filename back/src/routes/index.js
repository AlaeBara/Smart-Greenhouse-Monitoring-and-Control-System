import { Router } from 'express';
import utilisateursRoutes from './utilisateurs.routes.js';
import capteursRoutes from './capteurs.routes.js';
import mesuresRoutes from './mesures.routes.js';
import actionneursRoutes from './actionneurs.routes.js';
import historiqueActionsRoutes from './historiqueActions.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/utilisateurs', utilisateursRoutes);
router.use('/capteurs', capteursRoutes);
router.use('/mesures', mesuresRoutes);
router.use('/actionneurs', actionneursRoutes);
router.use('/historique-actions', historiqueActionsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;