// models/Expense.js - Modelo de Gasto para PostgreSQL
const { client } = require('../database');

class Expense {
  // Obtener todos los gastos
  static async findAll() {
    try {
      const query = 'SELECT * FROM gastos ORDER BY fecha_creacion DESC';
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      throw error;
    }
  }

  // Obtener gasto por ID
  static async findById(id) {
    try {
      const result = await client.query('SELECT * FROM gastos WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo gasto por ID:', error);
      throw error;
    }
  }

  // Crear nuevo gasto
  static async create(expenseData) {
    try {
      const {
        descripcion,
        categoria,
        monto,
        fecha,
        metodo_pago,
        usuario_id
      } = expenseData;

      const query = `
        INSERT INTO gastos (
          descripcion, categoria, monto, fecha, metodo_pago, usuario_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [descripcion, categoria, monto, fecha, metodo_pago, usuario_id];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando gasto:', error);
      throw error;
    }
  }

  // Actualizar gasto
  static async update(id, expenseData) {
    try {
      const {
        descripcion,
        categoria,
        monto,
        fecha,
        metodo_pago
      } = expenseData;

      const query = `
        UPDATE gastos 
        SET descripcion = $2, categoria = $3, monto = $4, 
            fecha = $5, metodo_pago = $6
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, descripcion, categoria, monto, fecha, metodo_pago];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      throw error;
    }
  }

  // Eliminar gasto
  static async delete(id) {
    try {
      const result = await client.query('DELETE FROM gastos WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  }

  // Obtener estadísticas de gastos
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_gastos,
          SUM(monto) as total_gastos_monto,
          AVG(monto) as promedio_gasto,
          COUNT(DISTINCT categoria) as categorias_diferentes
        FROM gastos
      `;

      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas de gastos:', error);
      throw error;
    }
  }

  // Obtener gastos por categoría
  static async getByCategory() {
    try {
      const query = `
        SELECT categoria, COUNT(*) as cantidad, SUM(monto) as total
        FROM gastos 
        GROUP BY categoria 
        ORDER BY total DESC
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo gastos por categoría:', error);
      throw error;
    }
  }
}

module.exports = Expense;