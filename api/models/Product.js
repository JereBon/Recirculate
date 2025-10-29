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
        genero,
        talle,
        color,
        marca,
        precio,
        stock = 0,
        estado = 'Disponible',
        destacado = true, // Por defecto los nuevos productos son destacados
        imagen_url,
        usuario_id,
        proveedor
      } = productData;

      // Género opcional - sin validación por ahora

      const query = `
        INSERT INTO productos (
          nombre, descripcion, categoria, genero, talle, color, marca, 
          precio, stock, estado, destacado, imagen_url, usuario_id, proveedor
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        nombre, descripcion, categoria, genero, talle, color, marca,
        precio, stock, estado, destacado, imagen_url, usuario_id, proveedor
      ];

      const result = await client.query(query, values);
      const nuevoProducto = result.rows[0];

      // Si el nuevo producto es destacado, gestionar la rotación
      if (destacado) {
        await this.gestionarDestacados();
      }

      return nuevoProducto;
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
        genero,
        talle,
        color,
        marca,
        precio,
        stock,
        estado,
        destacado,
        imagen_url,
        proveedor
      } = productData;

      // Validar que el género sea válido si se proporciona
      if (genero) {
        const generosValidos = ['Hombre', 'Mujer', 'Unisex'];
        if (!generosValidos.includes(genero)) {
          throw new Error('El género debe ser: Hombre, Mujer o Unisex');
        }
      }

      const query = `
        UPDATE productos 
        SET nombre = $2, descripcion = $3, categoria = $4, genero = $5, talle = $6, 
            color = $7, marca = $8, precio = $9, stock = $10, estado = $11, 
            destacado = $12, imagen_url = $13, proveedor = $14, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id, nombre, descripcion, categoria, genero, talle, color, marca,
        precio, stock, estado, destacado, imagen_url, proveedor
      ];

      const result = await client.query(query, values);
      
      // Si se cambió a destacado, gestionar la rotación
      if (destacado) {
        await this.gestionarDestacados();
      }

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

  // Obtener productos por género
  static async findByGenero(genero) {
    try {
      const generosValidos = ['Hombre', 'Mujer', 'Unisex'];
      if (!generosValidos.includes(genero)) {
        throw new Error('Género no válido');
      }

      const query = 'SELECT * FROM productos WHERE genero = $1 AND stock > 0 ORDER BY fecha_creacion DESC';
      const result = await client.query(query, [genero]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos por género:', error);
      throw error;
    }
  }

  // Obtener productos destacados (máximo 8)
  static async findFeatured(limit = 8) {
    try {
      const query = 'SELECT * FROM productos WHERE destacado = true AND stock > 0 ORDER BY fecha_creacion DESC LIMIT $1';
      const result = await client.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      throw error;
    }
  }

  // Gestionar rotación de productos destacados (máximo 8)
  static async gestionarDestacados(maxDestacados = 8) {
    try {
      // Contar productos destacados actuales
      const countQuery = 'SELECT COUNT(*) FROM productos WHERE destacado = true';
      const countResult = await client.query(countQuery);
      const totalDestacados = parseInt(countResult.rows[0].count);

      // Si hay más de 8 destacados, quitar el destacado a los más antiguos
      if (totalDestacados > maxDestacados) {
        const exceso = totalDestacados - maxDestacados;
        const updateQuery = `
          UPDATE productos 
          SET destacado = false 
          WHERE id IN (
            SELECT id FROM productos 
            WHERE destacado = true 
            ORDER BY fecha_creacion ASC 
            LIMIT $1
          )
        `;
        await client.query(updateQuery, [exceso]);
        console.log(`🔄 Rotación de destacados: ${exceso} productos antiguos removidos de destacados`);
      }
    } catch (error) {
      console.error('Error gestionando destacados:', error);
      throw error;
    }
  }

  // Marcar/desmarcar producto como destacado manualmente
  static async toggleDestacado(id, destacado) {
    try {
      const query = `
        UPDATE productos 
        SET destacado = $2, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, [id, destacado]);
      
      // Si se marcó como destacado, gestionar la rotación
      if (destacado) {
        await this.gestionarDestacados();
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error cambiando estado destacado:', error);
      throw error;
    }
  }
}

module.exports = Product;