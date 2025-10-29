// models/Sale.js - Modelo de Venta para PostgreSQL
const { client } = require('../database');

class Sale {
  // Obtener todas las ventas no archivadas
  static async findAll() {
    try {
      const query = `
        SELECT * FROM ventas 
        WHERE archivada = FALSE 
        ORDER BY fecha_creacion DESC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      throw error;
    }
  }

  // Obtener venta por ID
  static async findById(id) {
    try {
      const result = await client.query('SELECT * FROM ventas WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo venta por ID:', error);
      throw error;
    }
  }

  // Crear nueva venta
  static async create(saleData) {
    try {
      const {
        cliente,
        producto,
        cantidad,
        metodo_pago,
        monto_cripto,
        total,
        fecha,
        usuario_id
      } = saleData;

      const query = `
        INSERT INTO ventas (
          cliente, producto, cantidad, metodo_pago, 
          monto_cripto, total, fecha, usuario_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        cliente, producto, cantidad, metodo_pago,
        monto_cripto, total, fecha, usuario_id
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando venta:', error);
      throw error;
    }
  }

  // Archivar venta
  static async archive(id) {
    try {
      const query = `
        UPDATE ventas 
        SET archivada = TRUE, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error archivando venta:', error);
      throw error;
    }
  }

  // Eliminar venta
  static async delete(id) {
    try {
      const result = await client.query('DELETE FROM ventas WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error eliminando venta:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ventas
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_ventas,
          SUM(total) as total_ingresos,
          AVG(total) as promedio_venta,
          COUNT(DISTINCT cliente) as clientes_unicos
        FROM ventas 
        WHERE archivada = FALSE
      `;

      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

module.exports = Sale;