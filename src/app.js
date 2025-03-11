import express from 'express';
import dotenv from 'dotenv';
import libroRoutes from './routes/libro.routes.js';
import authRoutes from './routes/auth.routes.js';
import prestamoRoutes from './routes/prestamo.routes.js';
import imagenRoutes from './routes/imagen.routes.js';
import cors from 'cors'

dotenv.config();
const app = express();

app.use(cors());

// Middlewares
app.use(express.json());

// Routes
app.use('/api/libros', libroRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api', imagenRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});