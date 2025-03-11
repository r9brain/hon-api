import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';
import { 
  getLibros, 
  createLibro, 
  updateLibro, 
  deleteLibro,
  searchLibros
} from '../controllers/libro.controller.js';

const router = Router();



router.get('/', getLibros);
router.post('/', authenticateJWT, isAdmin, createLibro);
router.put('/:id', authenticateJWT, isAdmin, updateLibro);
router.delete('/:id', authenticateJWT, isAdmin, deleteLibro);
router.get('/search', authenticateJWT, searchLibros);

export default router;