// routes/audit.js - Rutas para auditoría de datos
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET /api/audit/productos - Auditoría completa de productos
router.get('/productos', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('🔍 Iniciando auditoría de productos');
    
    const { client } = require('../database');
    
    // 1. Estadísticas básicas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(*) FILTER (WHERE estado = 'Disponible') as disponibles,
        COUNT(*) FILTER (WHERE estado = 'Sin stock') as sin_stock,
        COUNT(*) FILTER (WHERE stock = 0) as stock_cero,
        COUNT(*) FILTER (WHERE stock > 0) as con_stock,
        COUNT(*) FILTER (WHERE imagen_principal IS NOT NULL) as con_imagen_principal,
        COUNT(*) FILTER (WHERE imagen_secundaria IS NOT NULL) as con_imagen_secundaria,
        AVG(precio) as precio_promedio,
        MIN(precio) as precio_minimo,
        MAX(precio) as precio_maximo,
        SUM(stock) as stock_total
      FROM productos
    `;
    
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    // 2. Productos por categoría
    const categoriesQuery = `
      SELECT 
        categoria, 
        COUNT(*) as cantidad,
        AVG(precio) as precio_promedio,
        SUM(stock) as stock_total
      FROM productos 
      WHERE categoria IS NOT NULL
      GROUP BY categoria 
      ORDER BY cantidad DESC
    `;
    
    const categoriesResult = await client.query(categoriesQuery);

    // 3. Productos con problemas
    const problemsQuery = `
      SELECT 
        id, nombre, categoria, precio, stock, estado, 
        imagen_principal, imagen_secundaria,
        CASE 
          WHEN stock = 0 AND estado = 'Disponible' THEN 'Stock 0 pero estado Disponible'
          WHEN stock > 0 AND estado = 'Sin stock' THEN 'Con stock pero estado Sin stock'
          WHEN precio <= 0 THEN 'Precio inválido'
          WHEN nombre IS NULL OR LENGTH(TRIM(nombre)) = 0 THEN 'Nombre vacío'
          WHEN imagen_principal IS NULL THEN 'Sin imagen principal'
        END as problema
      FROM productos 
      WHERE 
        (stock = 0 AND estado = 'Disponible') OR
        (stock > 0 AND estado = 'Sin stock') OR
        precio <= 0 OR
        nombre IS NULL OR LENGTH(TRIM(nombre)) = 0 OR
        imagen_principal IS NULL
      ORDER BY id
    `;
    
    const problemsResult = await client.query(problemsQuery);

    // 4. Productos más vendidos (si hay ventas)
    const topSellersQuery = `
      SELECT 
        p.id, p.nombre, p.categoria, p.precio, p.stock,
        COALESCE(SUM(v.cantidad), 0) as total_vendido,
        COUNT(v.id) as numero_ventas
      FROM productos p
      LEFT JOIN ventas v ON p.nombre = v.producto
      GROUP BY p.id, p.nombre, p.categoria, p.precio, p.stock
      HAVING SUM(v.cantidad) > 0
      ORDER BY total_vendido DESC
      LIMIT 10
    `;
    
    const topSellersResult = await client.query(topSellersQuery);

    // 5. Productos recientes
    const recentQuery = `
      SELECT 
        id, nombre, categoria, precio, stock, estado,
        fecha_creacion, fecha_actualizacion
      FROM productos 
      ORDER BY fecha_creacion DESC 
      LIMIT 20
    `;
    
    const recentResult = await client.query(recentQuery);

    // 6. Análisis de precios por categoría
    const priceAnalysisQuery = `
      SELECT 
        categoria,
        COUNT(*) as productos,
        MIN(precio) as precio_min,
        MAX(precio) as precio_max,
        AVG(precio) as precio_promedio,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precio) as precio_mediana
      FROM productos 
      WHERE categoria IS NOT NULL AND precio > 0
      GROUP BY categoria
      ORDER BY precio_promedio DESC
    `;
    
    const priceAnalysisResult = await client.query(priceAnalysisQuery);

    // Formatear estadísticas
    const formattedStats = {
      ...stats,
      total_productos: parseInt(stats.total_productos),
      disponibles: parseInt(stats.disponibles),
      sin_stock: parseInt(stats.sin_stock),
      stock_cero: parseInt(stats.stock_cero),
      con_stock: parseInt(stats.con_stock),
      con_imagen_principal: parseInt(stats.con_imagen_principal),
      con_imagen_secundaria: parseInt(stats.con_imagen_secundaria),
      precio_promedio: parseFloat(stats.precio_promedio || 0),
      precio_minimo: parseFloat(stats.precio_minimo || 0),
      precio_maximo: parseFloat(stats.precio_maximo || 0),
      stock_total: parseInt(stats.stock_total || 0)
    };

    const auditReport = {
      timestamp: new Date().toISOString(),
      resumen: {
        total_productos: formattedStats.total_productos,
        productos_activos: formattedStats.disponibles,
        productos_sin_stock: formattedStats.sin_stock,
        problemas_detectados: problemsResult.rows.length,
        cobertura_imagenes: {
          con_imagen_principal: `${((formattedStats.con_imagen_principal / formattedStats.total_productos) * 100).toFixed(1)}%`,
          con_imagen_secundaria: `${((formattedStats.con_imagen_secundaria / formattedStats.total_productos) * 100).toFixed(1)}%`
        }
      },
      estadisticas_generales: formattedStats,
      productos_por_categoria: categoriesResult.rows,
      problemas_detectados: problemsResult.rows,
      productos_mas_vendidos: topSellersResult.rows,
      productos_recientes: recentResult.rows,
      analisis_precios: priceAnalysisResult.rows
    };

    console.log(`✅ Auditoría completada: ${formattedStats.total_productos} productos analizados`);
    
    res.json({
      success: true,
      audit_report: auditReport
    });

  } catch (error) {
    console.error('❌ Error en auditoría de productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/audit/productos/export - Exportar datos para Ember o herramientas externas
router.get('/productos/export', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const { client } = require('../database');
    
    // Exportar todos los productos con información completa
    const exportQuery = `
      SELECT 
        id, nombre, descripcion, categoria, talle, color, marca,
        precio, stock, estado, imagen_principal, imagen_secundaria,
        proveedor, usuario_id, fecha_creacion, fecha_actualizacion
      FROM productos 
      ORDER BY id
    `;
    
    const result = await client.query(exportQuery);
    
    if (format === 'csv') {
      // Generar CSV
      const headers = Object.keys(result.rows[0] || {});
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=productos_export.csv');
      res.send(csvContent);
    } else {
      // JSON por defecto
      res.json({
        success: true,
        export_info: {
          total_records: result.rows.length,
          generated_at: new Date().toISOString(),
          format: 'json'
        },
        productos: result.rows
      });
    }

  } catch (error) {
    console.error('❌ Error exportando productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error exportando datos'
    });
  }
});

module.exports = router;