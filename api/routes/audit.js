<<<<<<< HEAD
// routes/audit.js - Rutas para auditoría de datos
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
=======
/**
 * api/routes/audit.js
 * Rutas de auditoría para análisis completo de productos
 * Requiere autenticación de administrador
 */

const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const client = require('../database');
>>>>>>> rama-axel

// GET /api/audit/productos - Auditoría completa de productos
router.get('/productos', verifyToken, verifyAdmin, async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    console.log('🔍 Iniciando auditoría de productos...');

    // Consulta principal para obtener todos los productos
    const productosQuery = `
      SELECT 
        id, nombre, descripcion, precio, stock, categoria, 
        imagen_url, imagen_principal, imagen_secundaria,
        talle, color, marca, estado, created_at, updated_at
      FROM productos 
      ORDER BY created_at DESC
    `;
    
    const productosResult = await client.query(productosQuery);
    const productos = productosResult.rows;

    // Estadísticas generales
    const estadisticas = {
      total_productos: productos.length,
      productos_activos: productos.filter(p => p.stock > 0).length,
      productos_sin_stock: productos.filter(p => p.stock === 0).length,
      precio_promedio: productos.length > 0 ? 
        productos.reduce((sum, p) => sum + parseFloat(p.precio || 0), 0) / productos.length : 0,
      precio_minimo: productos.length > 0 ? 
        Math.min(...productos.map(p => parseFloat(p.precio || 0))) : 0,
      precio_maximo: productos.length > 0 ? 
        Math.max(...productos.map(p => parseFloat(p.precio || 0))) : 0,
      stock_total: productos.reduce((sum, p) => sum + parseInt(p.stock || 0), 0)
    };

    // Análisis de cobertura de imágenes
    const cobertura_imagenes = {
      con_imagen_principal: productos.filter(p => p.imagen_principal && p.imagen_principal.trim() !== '').length,
      con_imagen_secundaria: productos.filter(p => p.imagen_secundaria && p.imagen_secundaria.trim() !== '').length,
      con_imagen_url: productos.filter(p => p.imagen_url && p.imagen_url.trim() !== '').length,
      sin_imagenes: productos.filter(p => 
        (!p.imagen_principal || p.imagen_principal.trim() === '') &&
        (!p.imagen_secundaria || p.imagen_secundaria.trim() === '') &&
        (!p.imagen_url || p.imagen_url.trim() === '')
      ).length
    };

    // Análisis por categorías
    const categorias = {};
    productos.forEach(producto => {
      const cat = producto.categoria || 'Sin categoría';
      if (!categorias[cat]) {
        categorias[cat] = { cantidad: 0, precios: [], stock_total: 0 };
      }
      categorias[cat].cantidad++;
      categorias[cat].precios.push(parseFloat(producto.precio || 0));
      categorias[cat].stock_total += parseInt(producto.stock || 0);
    });

    const productos_por_categoria = Object.keys(categorias).map(cat => ({
      categoria: cat,
      cantidad: categorias[cat].cantidad,
      precio_promedio: categorias[cat].precios.length > 0 ? 
        categorias[cat].precios.reduce((a, b) => a + b) / categorias[cat].precios.length : 0,
      stock_total: categorias[cat].stock_total
    }));

    // Detección de problemas
    const problemas_detectados = [];
    productos.forEach(producto => {
      // Precio inválido o muy bajo
      if (!producto.precio || parseFloat(producto.precio) <= 0) {
        problemas_detectados.push({
          id: producto.id,
          nombre: producto.nombre,
          problema: `Precio inválido: ${producto.precio}`
        });
      }

      // Stock negativo
      if (producto.stock < 0) {
        problemas_detectados.push({
          id: producto.id,
          nombre: producto.nombre,
          problema: `Stock negativo: ${producto.stock}`
        });
      }

      // Nombre muy corto o vacío
      if (!producto.nombre || producto.nombre.trim().length < 3) {
        problemas_detectados.push({
          id: producto.id,
          nombre: producto.nombre || 'Sin nombre',
          problema: 'Nombre muy corto o vacío'
        });
      }

      // Sin imágenes
      if ((!producto.imagen_principal || producto.imagen_principal.trim() === '') &&
          (!producto.imagen_secundaria || producto.imagen_secundaria.trim() === '') &&
          (!producto.imagen_url || producto.imagen_url.trim() === '')) {
        problemas_detectados.push({
          id: producto.id,
          nombre: producto.nombre,
          problema: 'Producto sin imágenes'
        });
      }

      // Sin categoría
      if (!producto.categoria || producto.categoria.trim() === '') {
        problemas_detectados.push({
          id: producto.id,
          nombre: producto.nombre,
          problema: 'Sin categoría asignada'
        });
      }
    });

    const audit_report = {
      timestamp: new Date().toISOString(),
      resumen: {
        total_productos: estadisticas.total_productos,
        productos_activos: estadisticas.productos_activos,
        productos_sin_stock: estadisticas.productos_sin_stock,
        problemas_detectados: problemas_detectados.length,
        cobertura_imagenes
      },
      estadisticas_generales: estadisticas,
      productos_por_categoria,
      problemas_detectados: problemas_detectados.slice(0, 50), // Límite para performance
      cobertura_imagenes,
      metadatos: {
        version_audit: '1.0',
        generado_por: req.user.nombre || req.user.email,
        total_problemas: problemas_detectados.length
      }
    };

    console.log(`✅ Auditoría completada: ${productos.length} productos analizados, ${problemas_detectados.length} problemas detectados`);

    res.json({
      success: true,
      message: 'Auditoría completada exitosamente',
      audit_report
    });

  } catch (error) {
    console.error('❌ Error en auditoría:', error);
    res.status(500).json({
      error: 'Error interno del servidor durante la auditoría',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
>>>>>>> rama-axel
    });
  }
});

<<<<<<< HEAD
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
=======
// GET /api/audit/productos/export - Exportar datos para análisis externo
router.get('/productos/export', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const format = req.query.format || 'json';
    
    const productosResult = await client.query(`
      SELECT 
        id, nombre, descripcion, precio, stock, categoria, 
        imagen_url, imagen_principal, imagen_secundaria,
        talle, color, marca, estado, created_at, updated_at
      FROM productos 
      ORDER BY id ASC
    `);
    
    const productos = productosResult.rows;

    if (format === 'csv') {
      // Generar CSV
      const headers = ['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'Talle', 'Color', 'Marca', 'Estado', 'Imagen Principal', 'Imagen Secundaria', 'Fecha Creación'];
      const csvRows = [headers.join(',')];
      
      productos.forEach(producto => {
        const row = [
          producto.id,
          `"${(producto.nombre || '').replace(/"/g, '""')}"`,
          `"${(producto.descripcion || '').replace(/"/g, '""')}"`,
          producto.precio || 0,
          producto.stock || 0,
          `"${(producto.categoria || '').replace(/"/g, '""')}"`,
          `"${(producto.talle || '').replace(/"/g, '""')}"`,
          `"${(producto.color || '').replace(/"/g, '""')}"`,
          `"${(producto.marca || '').replace(/"/g, '""')}"`,
          `"${(producto.estado || '').replace(/"/g, '""')}"`,
          `"${(producto.imagen_principal || '').replace(/"/g, '""')}"`,
          `"${(producto.imagen_secundaria || '').replace(/"/g, '""')}"`,
          producto.created_at ? new Date(producto.created_at).toISOString().split('T')[0] : ''
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="productos_export.csv"');
      res.send('\uFEFF' + csvContent); // BOM para Excel UTF-8
      
    } else {
      // Formato JSON por defecto
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="productos_export.json"');
      res.json({
        exported_at: new Date().toISOString(),
        total_records: productos.length,
        export_format: 'json',
        productos
>>>>>>> rama-axel
      });
    }

  } catch (error) {
    console.error('❌ Error exportando productos:', error);
    res.status(500).json({
<<<<<<< HEAD
      success: false,
      error: 'Error exportando datos'
=======
      error: 'Error exportando datos de productos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
>>>>>>> rama-axel
    });
  }
});

module.exports = router;