import { pool } from "../config/db.js";

export const libroService = {
  async getAll() {
    const { rows } = await pool.query("SELECT * FROM Libro");
    return rows;
  },

  async create(libroData) {
    const { rows } = await pool.query(
      `INSERT INTO Libro 
       (titulo, autor, categoria, stock, imagen_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        libroData.titulo,
        libroData.autor,
        libroData.categoria,
        libroData.stock,
        libroData.imagen_url,
      ]
    );
    return rows[0];
  },

  async update(id, libroData) {
    const { rows } = await pool.query(
      `UPDATE Libro SET
        titulo = $1,
        autor = $2,
        categoria = $3,
        stock = $4,
        imagen_url = $5
       WHERE id = $6 RETURNING *`,
      [
        libroData.titulo,
        libroData.autor,
        libroData.categoria,
        libroData.stock,
        libroData.imagen_url,
        id,
      ]
    );
    return rows[0];
  },

  async remove(id) {
    await pool.query("DELETE FROM Libro WHERE id = $1", [id]);
  },

  async search(searchParams) {
    const { limit, offset, ...filters } = searchParams;
    const queryParams = [];
    let whereClause = "";

    const validFilters = ["titulo", "autor", "categoria"].filter(
      (field) => filters[field]
    );

    if (validFilters.length > 0) {
      whereClause =
        "WHERE " +
        validFilters
          .map((field, index) => {
            queryParams.push(`%${filters[field]}%`);
            return `${field} ILIKE $${index + 1}`;
          })
          .join(" AND ");
    }

    const query = `
      SELECT * FROM Libro
      ${whereClause}
      ORDER BY titulo ASC
      LIMIT $${validFilters.length + 1}
      OFFSET $${validFilters.length + 2}
    `;

    const { rows } = await pool.query(query, [
      ...validFilters.map((field) => `%${filters[field]}%`),
      limit,
      offset,
    ]);

    return rows;
  },
};
