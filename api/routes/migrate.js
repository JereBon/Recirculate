// migrate.js - Endpoint para forzar migraciones de base de datos
const express = require('express');
const router = express.Router();
const { Client } = require('pg');

// Configuración de la base de datos
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/recirculate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Endpoint de prueba para verificar que la ruta funciona
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de migración funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para forzar la migración del campo proveedor
router.get('/add-proveedor-column', async (req, res) => {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    console.log('🔧 Forzando migración de columna proveedor...');
    
    // Verificar si la columna existe
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'productos' AND column_name = 'proveedor'
    `);
    
    if (columnExists.rows.length === 0) {
      // La columna no existe, crearla
      await client.query(`
        ALTER TABLE productos 
        ADD COLUMN proveedor VARCHAR(255)
      `);
      console.log('✅ Columna proveedor agregada exitosamente');
    } else {
      console.log('✅ Columna proveedor ya existe');
    }
    
    // Verificar estructura actual de la tabla
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'productos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura actual de la tabla productos:');
    tableStructure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    res.json({
      success: true,
      message: 'Migración completada',
      columnExists: columnExists.rows.length > 0,
      tableStructure: tableStructure.rows
    });
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

// Endpoint para verificar productos y sus proveedores
router.get('/check-productos', async (req, res) => {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const productos = await client.query(`
      SELECT id, nombre, proveedor, fecha_creacion 
      FROM productos 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    res.json({
      success: true,
      productos: productos.rows,
      count: productos.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error verificando productos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;