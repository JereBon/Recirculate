/**
 * api/routes/audit.js
 * Rutas de auditoría para análisis completo de productos
 * Requiere autenticación de administrador
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const client = require('../database');

// Middleware para verificar que es administrador
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  }
  next();
};

// GET /api/audit/productos - Auditoría completa de productos
router.get('/productos', authenticateToken, requireAdmin, async (req, res) => {
  try {
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
    });
  }
});

// GET /api/audit/productos/export - Exportar datos para análisis externo
router.get('/productos/export', authenticateToken, requireAdmin, async (req, res) => {
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
      });
    }

  } catch (error) {
    console.error('❌ Error exportando productos:', error);
    res.status(500).json({
      error: 'Error exportando datos de productos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;