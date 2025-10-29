// routes/products-public.js - Rutas públicas para productos del catálogo
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/productos/publicos - Obtener productos disponibles para el catálogo público
router.get('/publicos', async (req, res) => {
  try {
    console.log('🛒 GET /api/productos/publicos - Catálogo público');
    
    const { categoria, limit, offset, search } = req.query;
    
    // Base query para productos disponibles
    let query = `
      SELECT 
        id, nombre, descripcion, categoria, talle, color, marca, 
        precio, stock, estado, imagen_principal, imagen_secundaria,
        fecha_creacion
      FROM productos 
      WHERE stock > 0 AND estado = 'Disponible'
    `;
    
    let params = [];
    let paramIndex = 1;

    // Filtro por categoría
    if (categoria && categoria !== 'todos') {
      query += ` AND categoria ILIKE $${paramIndex}`;
      params.push(`%${categoria}%`);
      paramIndex++;
    }

    // Filtro por búsqueda
    if (search) {
      query += ` AND (nombre ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex} OR marca ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Ordenar por fecha de creación (más recientes primero)
    query += ` ORDER BY fecha_creacion DESC`;

    // Paginación
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      paramIndex++;
      
      if (offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(parseInt(offset));
      }
    }

    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);

    const { client } = require('../database');
    const result = await client.query(query, params);
    
    // Procesar resultados para el frontend
    const productos = result.rows.map(producto => ({
      ...producto,
      // Asegurar que siempre tengamos al menos una imagen (fallback)
      imagen_principal: producto.imagen_principal || '/assets/images/placeholder-product.png',
      // Calcular si tiene múltiples imágenes para el hover effect
      tieneImagenSecundaria: !!producto.imagen_secundaria,
      // Formatear precio
      precioFormateado: `$${Number(producto.precio).toLocaleString('es-AR')} ARS`
    }));

    console.log(`✅ ${productos.length} productos encontrados para catálogo público`);
    
    res.json({
      success: true,
      productos: productos,
      total: productos.length,
      filtros: { categoria, search },
      paginacion: { limit, offset }
    });

  } catch (error) {
    console.error('❌ Error obteniendo productos públicos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// GET /api/productos/publicos/:id - Obtener producto específico para página de detalle
router.get('/publicos/:id', async (req, res) => {
  try {
    console.log(`🛒 GET /api/productos/publicos/${req.params.id} - Detalle público`);
    
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, nombre, descripcion, categoria, talle, color, marca, 
        precio, stock, estado, imagen_principal, imagen_secundaria,
        proveedor, fecha_creacion
      FROM productos 
      WHERE id = $1 AND stock > 0 AND estado = 'Disponible'
    `;

    const { client } = require('../database');
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado o no disponible'
      });
    }

    const producto = result.rows[0];
    
    // Procesar producto para el frontend
    const productoDetalle = {
      ...producto,
      imagen_principal: producto.imagen_principal || '/assets/images/placeholder-product.png',
      tieneImagenSecundaria: !!producto.imagen_secundaria,
      precioFormateado: `$${Number(producto.precio).toLocaleString('es-AR')} ARS`,
      disponible: producto.stock > 0,
      stockBajo: producto.stock <= 3 && producto.stock > 0
    };

    console.log(`✅ Producto ${id} encontrado:`, producto.nombre);
    
    res.json({
      success: true,
      producto: productoDetalle
    });

  } catch (error) {
    console.error('❌ Error obteniendo producto público:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// GET /api/productos/categorias - Obtener categorías disponibles
router.get('/categorias', async (req, res) => {
  try {
    console.log('🏷️ GET /api/productos/categorias - Categorías disponibles');
    
    const query = `
      SELECT DISTINCT categoria, COUNT(*) as total
      FROM productos 
      WHERE stock > 0 AND estado = 'Disponible' AND categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY categoria
    `;

    const { client } = require('../database');
    const result = await client.query(query);
    
    const categorias = result.rows.map(row => ({
      nombre: row.categoria,
      total: parseInt(row.total),
      slug: row.categoria.toLowerCase().replace(/\s+/g, '-')
    }));

    console.log(`✅ ${categorias.length} categorías encontradas`);
    
    res.json({
      success: true,
      categorias: categorias
    });

  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

module.exports = router;