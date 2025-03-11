// services/prestamo.service.js
import { pool } from '../config/db.js';

export const prestamoService = {
  async create({ libroId, usuarioId, fechaDevolucion }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Verificar existencia del libro y stock
      const libroQuery = await client.query(
        'SELECT id, stock FROM Libro WHERE id = $1 FOR UPDATE',
        [libroId]
      );
      
      if (libroQuery.rows.length === 0) {
        throw new Error('Libro no encontrado');
      }
      
      const libro = libroQuery.rows[0];
      if (libro.stock < 1) {
        throw new Error('No hay ejemplares disponibles para prestar');
      }

      // 2. Crear el préstamo
      const prestamoQuery = await client.query(
        `INSERT INTO Prestamo 
         (usuarioId, libroId, fechaDevolucion) 
         VALUES ($1, $2, $3)
         RETURNING *`,
        [usuarioId, libroId, fechaDevolucion]
      );
      const nuevoPrestamo = prestamoQuery.rows[0];

      // 3. Actualizar stock del libro
      await client.query(
        'UPDATE Libro SET stock = stock - 1 WHERE id = $1',
        [libroId]
      );

      // 4. Registrar en el historial
      await client.query(
        `INSERT INTO HistorialPrestamo 
         (prestamoId, usuarioId, libroId, fechaPrestamo, fechaDevolucion)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          nuevoPrestamo.id,
          usuarioId,
          libroId,
          nuevoPrestamo.fechaPrestamo,
          fechaDevolucion
        ]
      );

      await client.query('COMMIT');
      return nuevoPrestamo;

    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error al crear préstamo: ${error.message}`);
    } finally {
      client.release();
    }
  },

  async getAll(user) {
    try {
      const query = user.rol === 'ADMINISTRADOR'
        ? `SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo 
           FROM Prestamo p
           JOIN Usuario u ON p.usuarioId = u.id
           JOIN Libro l ON p.libroId = l.id`
        : `SELECT p.*, l.titulo as libro_titulo 
           FROM Prestamo p
           JOIN Libro l ON p.libroId = l.id
           WHERE p.usuarioId = $1`;
      
      const values = user.rol === 'ADMINISTRADOR' ? [] : [user.id];
      
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener préstamos: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo 
         FROM Prestamo p
         JOIN Usuario u ON p.usuarioId = u.id
         JOIN Libro l ON p.libroId = l.id
         WHERE p.id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al obtener préstamo: ${error.message}`);
    }
  },

   async getAllForReport() {
    try {
      const { rows } = await pool.query(
        `SELECT 
          p.id,
          p.fechaPrestamo,
          p.fechaDevolucion,
          u.nombre as usuario_nombre,
          l.titulo as libro_titulo,
          l.autor as libro_autor,
          l.categoria as libro_categoria
         FROM Prestamo p
         JOIN Usuario u ON p.usuarioId = u.id
         JOIN Libro l ON p.libroId = l.id
         ORDER BY p.fechaPrestamo DESC`
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener préstamos para reporte: ${error.message}`);
    }
  },

  async getByUser(userId) {
    const query = `
      SELECT p.*, l.titulo, l.autor 
      FROM Prestamo p
      JOIN Libro l ON p.libroId = l.id
      WHERE p.usuarioId = $1
      ORDER BY p.fechaPrestamo DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
  
};

