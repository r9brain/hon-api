import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';
import { generarReportePrestamos } from '../controllers/reporte.controller.js';

const router = Router();

router.get('/prestamos', authenticateJWT, isAdmin, generarReportePrestamos);

export default router;