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

<<<<<<< HEAD
=======
<<<<<<< HEAD
// Endpoint para agregar columna imagen_espalda_url
router.get('/add-imagen-espalda-column', async (req, res) => {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    console.log('🔧 Agregando columna imagen_espalda_url...');
    
    // Verificar si la columna existe
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'productos' AND column_name = 'imagen_espalda_url'
    `);
    
    if (columnExists.rows.length === 0) {
      // La columna no existe, crearla
      await client.query(`
        ALTER TABLE productos 
        ADD COLUMN imagen_espalda_url TEXT
      `);
      
      // Agregar comentario
      await client.query(`
        COMMENT ON COLUMN productos.imagen_espalda_url 
        IS 'URL de la imagen de espalda del producto (Cloudinary)'
      `);
      
      console.log('✅ Columna imagen_espalda_url agregada exitosamente');
    } else {
      console.log('✅ Columna imagen_espalda_url ya existe');
    }
    
    // Verificar estructura actual de la tabla
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'productos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura actualizada de la tabla productos:');
    tableStructure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    res.json({
      success: true,
      message: 'Migración de imagen_espalda_url completada',
      columnExists: columnExists.rows.length > 0,
      tableStructure: tableStructure.rows
    });
    
  } catch (error) {
    console.error('❌ Error en migración imagen_espalda_url:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

=======
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
// Endpoint para verificar productos y sus proveedores
router.get('/check-productos', async (req, res) => {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const productos = await client.query(`
<<<<<<< HEAD
      SELECT id, nombre, proveedor, fecha_creacion 
=======
<<<<<<< HEAD
      SELECT id, nombre, proveedor, imagen_url, imagen_espalda_url, fecha_creacion 
=======
      SELECT id, nombre, proveedor, fecha_creacion 
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
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