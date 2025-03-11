import Joi from 'joi';
import { prestamoService } from '../services/prestamo.service.js'; // Ajusta la ruta a tu prestamoService

// Esquema de validación
const prestamoSchema = Joi.object({
  libroId: Joi.string().guid({ version: 'uuidv4' }).required(),
  fechaDevolucion: Joi.date().iso().greater('now').optional(),
});

// Controladores
export const createPrestamo = async (req, res) => {
  const { error, value } = prestamoSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const prestamo = await prestamoService.create({
      ...value,
      usuarioId: req.user.id,
    });
    res.status(201).json(prestamo);
  } catch (error) {
    console.error("Error en createPrestamo:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getPrestamos = async (req, res) => {
  try {
    const prestamos = await prestamoService.getAll(req.user);
    res.json(prestamos);
  } catch (error) {
    console.error("Error en getPrestamos:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};