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
        imagen_espalda_url,
        usuario_id,
        proveedor,
        genero = 'unisex',
        descuento = 0
      } = productData;

      // Primero crear el producto
      const query = `
        INSERT INTO productos (
          nombre, descripcion, categoria, talle, color, marca, 
          precio, stock, estado, imagen_url, imagen_espalda_url, usuario_id, proveedor, genero, descuento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
            // Log para debug: mostrar toda la fila enviada
            console.log('DEBUG fila enviada:', {
              nombre, descripcion, categoria, talle, color, marca,
              precio, stock, estado, imagen_url, imagen_espalda_url, usuario_id, proveedor, genero, descuento
            });

            // Primero crear el producto
            const insertQuery = `
              INSERT INTO productos (
                nombre, descripcion, categoria, talle, color, marca, 
                precio, stock, estado, imagen_url, imagen_espalda_url, usuario_id, proveedor, genero, descuento
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              RETURNING *
            `;

            const values = [
              nombre, descripcion, categoria, talle, color, marca,
              precio, stock, estado, imagen_url, imagen_espalda_url, usuario_id, proveedor, genero, descuento
            ];
            const result = await client.query(insertQuery, values);
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
        imagen_espalda_url,
        proveedor,
        genero,
        descuento
      } = productData;

      const query = `
        UPDATE productos 
        SET nombre = $2, descripcion = $3, categoria = $4, talle = $5, 
            color = $6, marca = $7, precio = $8, stock = $9, estado = $10, 
            imagen_url = $11, imagen_espalda_url = $12, proveedor = $13, genero = $14, descuento = $15, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id, nombre, descripcion, categoria, talle, color, marca,
        precio, stock, estado, imagen_url, imagen_espalda_url, proveedor, genero, descuento
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

  // Obtener productos destacados (últimos 5)
  static async getDestacados() {
    try {
      const query = `
        SELECT * FROM productos 
        WHERE es_destacado = true 
        ORDER BY fecha_creacion DESC 
        LIMIT 5
      `;
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      throw error;
    }
  }

  // Obtener productos por género
  static async getByGenero(genero) {
    try {
      const query = `
        SELECT * FROM productos 
        WHERE genero = $1 OR genero = 'unisex'
        ORDER BY fecha_creacion DESC
      `;
      const result = await client.query(query, [genero]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos por género:', error);
      throw error;
    }
  }

  // Sistema de rotación de destacados (últimos 5 productos)
  static async updateDestacados() {
    try {
      // Primero, quitar la marca de destacado de todos los productos
      await client.query('UPDATE productos SET es_destacado = false');

      // Marcar los últimos 5 productos como destacados
      const query = `
        UPDATE productos 
        SET es_destacado = true 
        WHERE id IN (
          SELECT id FROM productos 
          ORDER BY fecha_creacion DESC 
          LIMIT 5
        )
      `;
      await client.query(query);

      console.log('✅ Sistema de destacados actualizado - últimos 5 productos marcados');
    } catch (error) {
      console.error('Error actualizando destacados:', error);
      throw error;
    }
  }
}

module.exports = Product;