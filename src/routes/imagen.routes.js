import { Router } from 'express';
import multer from 'multer';
import { uploadBookImage } from '../controllers/imagen.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, etc.)'), false);
    }
  }
});

router.post('/upload',
  authenticateJWT,
  isAdmin,
  upload.single('imagen'),
  uploadBookImage
);

export default router;