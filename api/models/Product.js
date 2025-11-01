// models/Product.js - Modelo de Producto para PostgreSQL
const { client } = require('../database');

class Product {
  // Obtener todos los productos con filtros opcionales
  static async findAll(searchQuery = null) {
    try {
      let query = 'SELECT * FROM productos ORDER BY fecha_creacion DESC';
      let params = [];

      if (searchQuery) {
        query = `
          SELECT * FROM productos 
          WHERE nombre ILIKE $1 OR categoria ILIKE $1 OR descripcion ILIKE $1
          ORDER BY fecha_creacion DESC
        `;
        params = [`%${searchQuery}%`];
      }

      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  }

  // Obtener producto por ID
  static async findById(id) {
    try {
      const result = await client.query('SELECT * FROM productos WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      throw error;
    }
  }

  // Obtener producto por nombre
  static async findByName(nombre) {
    try {
      const result = await client.query('SELECT * FROM productos WHERE nombre = $1', [nombre]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo producto por nombre:', error);
      throw error;
    }
  }

  // Crear nuevo producto
  static async create(productData) {
    try {
      const {
        nombre,
        descripcion,
        categoria,
        talle,
        color,
        marca,
        precio,
        stock = 0,
        estado = 'Disponible',
        imagen_url,
        usuario_id,
        proveedor
      } = productData;

      const query = `
        INSERT INTO productos (
          nombre, descripcion, categoria, talle, color, marca, 
          precio, stock, estado, imagen_url, usuario_id, proveedor
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        nombre, descripcion, categoria, talle, color, marca,
        precio, stock, estado, imagen_url, usuario_id, proveedor
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  // Actualizar producto
  static async update(id, productData) {
    try {
      const {
        nombre,
        descripcion,
        categoria,
        talle,
        color,
        marca,
        precio,
        stock,
        estado,
        imagen_url,
        proveedor
      } = productData;

      const query = `
        UPDATE productos 
        SET nombre = $2, descripcion = $3, categoria = $4, talle = $5, 
            color = $6, marca = $7, precio = $8, stock = $9, estado = $10, 
            imagen_url = $11, proveedor = $12, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id, nombre, descripcion, categoria, talle, color, marca,
        precio, stock, estado, imagen_url, proveedor
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  // Actualizar solo el stock de un producto
  static async updateStock(id, newStock) {
    try {
      const estado = newStock <= 0 ? 'Sin stock' : 'Disponible';
      
      const query = `
        UPDATE productos 
        SET stock = $2, estado = $3, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, [id, newStock, estado]);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  }

  // Eliminar producto
  static async delete(id) {
    try {
      const result = await client.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }
}

module.exports = Product;