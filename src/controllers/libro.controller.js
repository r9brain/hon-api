import Joi from 'joi';
import { libroService } from '../services/libro.service.js';

const libroSchema = Joi.object({
  titulo: Joi.string().required().min(3).max(100),
  autor: Joi.string().required().min(3).max(50),
  categoria: Joi.string().required().min(3).max(50),
  stock: Joi.number().integer().min(0).required(),
  imagen_url: Joi.string().uri().required()
});

export const getLibros = async (req, res) => {
  try {
    const libros = await libroService.getAll();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener libros' });
  }
};

export const createLibro = async (req, res) => {
  const { error, value } = libroSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: error.details[0].message.replace(/"/g, '') 
    });
  }

  try {
    const newLibro = await libroService.create(value);
    res.status(201).json(newLibro);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLibro = async (req, res) => {
  const { error, value } = libroSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: error.details[0].message.replace(/"/g, '') 
    });
  }

  try {
    const updated = await libroService.update(req.params.id, value);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLibro = async (req, res) => {
  try {
    await libroService.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchLibros = async (req, res) => {
  const searchSchema = Joi.object({
    titulo: Joi.string().optional(),
    autor: Joi.string().optional(),
    categoria: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0)
  });

  const { error, value } = searchSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const resultados = await libroService.search(value);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
