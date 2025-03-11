import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { SECRET } from '../config/env.js';


export const login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = value;

  try {
    const result = await pool.query('SELECT * FROM Usuario WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
      SECRET,
      { expiresIn: '2d' }
    );

    let rol = user.rol;
    res.json({ token,rol });
  } catch (dbError) {
    console.error("Error en la base de datos:", dbError);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const register = async (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    direccion: Joi.string().required(),
    numeroTelefono: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { nombre, email, password, direccion, numeroTelefono } = value;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO Usuario (nombre, email, password, direccion, numeroTelefono, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, email, hashedPassword, direccion, numeroTelefono, 'ADMINISTRADOR']
    );

    res.status(201).json(result.rows[0]);
  } catch (dbError) {
    //Manejo de errores de base de datos
    if (dbError.code === '23505') {
        return res.status(409).json({message: "El email ya se encuentra registrado."})
    }
    res.status(500).json({ message: dbError.message });
  }
};