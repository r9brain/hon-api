import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { createPrestamo, getPrestamos } from '../controllers/prestamo.controller.js';
import { generarReportePrestamosUsuario } from '../controllers/reporte.controller.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', createPrestamo);
router.get('/', getPrestamos);
router.get('/mis-prestamos/pdf', authenticateJWT, generarReportePrestamosUsuario);

export default router;