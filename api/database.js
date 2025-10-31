// database.js - Configuración y conexión a PostgreSQL
const { Client } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/recirculate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};
<<<<<<< HEAD
=======
<<<<<<< HEAD
const fs = require('fs');
const path = require('path');
=======
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel

// Cliente de PostgreSQL
const client = new Client(config);

// Conexión a la base de datos
const connectDB = async () => {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear todas las tablas si no existen
    await createUsersTable();
    await createClientsTable();
    await createProductsTable();
    await createSalesTable();
    await createExpensesTable();
<<<<<<< HEAD
=======
<<<<<<< HEAD
    await createPasswordResetTable();
    
    // Crear usuarios administradores autorizados
    await setupAdminUsers();
=======
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    
  } catch (error) {
    if (error.code === '3D000') {
      // Base de datos no existe, intentar crearla
      console.log('🔧 Base de datos no existe, creándola...');
      await createDatabase();
    } else {
      console.error('❌ Error conectando a PostgreSQL:', error);
      process.exit(1);
    }
  }
};

// Crear base de datos si no existe
const createDatabase = async () => {
  const adminClient = new Client({
    connectionString: process.env.DATABASE_URL?.replace('/recirculate', '/postgres') || 'postgresql://postgres:Creeper2486@localhost:5432/postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await adminClient.connect();
    await adminClient.query('CREATE DATABASE recirculate');
    console.log('✅ Base de datos "recirculate" creada');
    await adminClient.end();
    
    // Crear nuevo cliente para la base de datos recirculate
    const newClient = new Client(config);
    await newClient.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Actualizar el cliente global
    module.exports.client = newClient;
    
    // Crear todas las tablas
    await createUsersTable();
    await createClientsTable();
    await createProductsTable();
    await createSalesTable();
    await createExpensesTable();
    await createMPPreferencesTable();
    await createMPPaymentsTable();
    
  } catch (createError) {
    console.error('❌ Error creando base de datos:', createError);
    process.exit(1);
  }
};

// Crear tabla de usuarios
const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
<<<<<<< HEAD
=======
<<<<<<< HEAD

    // Ejecutar fix_genero_constraint.sql automáticamente
    try {
      const sqlPath = path.join(__dirname, 'migrations', 'fix_genero_constraint.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);
        console.log('✅ Constraint de género corregido automáticamente');
      }
    } catch (err) {
      console.error('❌ Error ejecutando fix_genero_constraint.sql:', err.message);
    }
=======
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol VARCHAR(50) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla usuarios verificada/creada');
    
    // Crear usuario admin por defecto si no existe
    await createDefaultAdmin();
  } catch (error) {
    console.error('❌ Error creando tabla usuarios:', error);
  }
};

// Crear usuario admin por defecto
const createDefaultAdmin = async () => {
  const bcrypt = require('bcryptjs');
  
  try {
    // Verificar si ya existe un admin
    const adminExists = await client.query(
      'SELECT id FROM usuarios WHERE rol = $1 LIMIT 1',
      ['admin']
    );

    if (adminExists.rows.length === 0) {
      // Crear admin por defecto
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@recirculate.com', hashedPassword, 'admin']
      );
      
      console.log('✅ Usuario admin por defecto creado:');
      console.log('   Email: admin@recirculate.com');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error creando admin por defecto:', error);
  }
};

// Crear tabla de clientes
const createClientsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
      telefono VARCHAR(20),
      direccion TEXT,
      fecha_nacimiento DATE,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla clientes verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla clientes:', error);
  }
};

// Crear tabla de productos
const createProductsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      categoria VARCHAR(100),
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
      genero VARCHAR(20) DEFAULT 'Unisex' CHECK (genero IN ('Hombre', 'Mujer', 'Unisex')),
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
      talle VARCHAR(50),
      color VARCHAR(50),
      marca VARCHAR(100),
      precio DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      estado VARCHAR(50) DEFAULT 'Disponible',
<<<<<<< HEAD
      imagen_url TEXT,
=======
<<<<<<< HEAD
      imagen_url TEXT,
      imagen_espalda_url TEXT,
=======
      destacado BOOLEAN DEFAULT TRUE,
      imagen_url TEXT,
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
      proveedor VARCHAR(255),
      usuario_id INTEGER REFERENCES usuarios(id),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla productos verificada/creada');
    
    // Migración: Agregar columna proveedor si no existe
    await addProveedorColumn();
    
<<<<<<< HEAD
    // Migración: Agregar columnas para múltiples imágenes
    await addImageColumns();
=======
<<<<<<< HEAD
    // Migración: Agregar columna género si no existe
    await addGeneroColumn();
    
    // Migración: Agregar columna es_destacado si no existe
    await addDestacadoColumn();
    
    // Migración: Agregar columna descuento si no existe
    await addDescuentoColumn();

  // Migración: Agregar columna imagen_espalda_url si no existe
  await addImagenEspaldaColumn();
=======
    // Migración: Agregar columna genero si no existe
    await addGeneroColumn();
    
    // Migración: Agregar columna destacado si no existe
    await addDestacadoColumn();
    
    // Limpiar productos de prueba
    await clearTestProducts();
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
  } catch (error) {
    console.error('❌ Error creando tabla productos:', error);
  }
};

// Función para agregar columna proveedor a productos existentes
const addProveedorColumn = async () => {
  try {
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS proveedor VARCHAR(255)
    `);
    console.log('✅ Columna proveedor agregada/verificada');
  } catch (error) {
    // Si la columna ya existe, no es un error
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna proveedor:', error.message);
    }
  }
};

<<<<<<< HEAD
// Función para agregar columnas de imágenes múltiples
const addImageColumns = async () => {
  try {
    // Agregar imagen_principal (reemplaza imagen_url)
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_principal TEXT
    `);
    
    // Agregar imagen_secundaria (nueva)
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_secundaria TEXT
    `);
    
    // Migrar datos de imagen_url a imagen_principal si existe
    await client.query(`
      UPDATE productos 
      SET imagen_principal = imagen_url 
      WHERE imagen_url IS NOT NULL AND imagen_principal IS NULL
    `);
    
    console.log('✅ Columnas de imágenes múltiples agregadas/verificadas');
  } catch (error) {
    if (error.code !== '42701') {
      console.error('❌ Error agregando columnas de imágenes:', error.message);
=======
<<<<<<< HEAD
// Función para agregar columna género a productos existentes
const addGeneroColumn = async () => {
  try {
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS genero VARCHAR(20) DEFAULT 'unisex'
    `);
    console.log('✅ Columna género agregada/verificada');
  } catch (error) {
    // Si la columna ya existe, no es un error
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna género:', error.message);
=======
// Función para agregar columna genero a productos existentes
const addGeneroColumn = async () => {
  try {
    // Primero agregar la columna como opcional
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS genero VARCHAR(20) DEFAULT 'Unisex' CHECK (genero IN ('Hombre', 'Mujer', 'Unisex'))
    `);
    
    // Luego actualizar los registros existentes que tengan NULL
    await client.query(`
      UPDATE productos 
      SET genero = 'Unisex' 
      WHERE genero IS NULL
    `);
    
    console.log('✅ Columna genero agregada/verificada con valores por defecto');
  } catch (error) {
    // Si la columna ya existe, no es un error
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna genero:', error.message);
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
    }
  }
};

<<<<<<< HEAD
// Función para agregar columna es_destacado a productos
=======
// Función para agregar columna destacado a productos existentes
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
const addDestacadoColumn = async () => {
  try {
    await client.query(`
      ALTER TABLE productos 
<<<<<<< HEAD
      ADD COLUMN IF NOT EXISTS es_destacado BOOLEAN DEFAULT false
    `);
    console.log('✅ Columna es_destacado agregada/verificada');
  } catch (error) {
    // Si la columna ya existe, no es un error
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna es_destacado:', error.message);
=======
      ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Columna destacado agregada/verificada');
  } catch (error) {
    // Si la columna ya existe, no es un error
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna destacado:', error.message);
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
    }
  }
};

<<<<<<< HEAD
// Función para agregar columna descuento a productos
const addDescuentoColumn = async () => {
  try {
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS descuento INTEGER DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100)
    `);
    console.log('✅ Columna descuento agregada/verificada');
  } catch (error) {
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna descuento:', error.message);
>>>>>>> rama-axel
    }
  }
};

<<<<<<< HEAD
=======
// Función para agregar columna imagen_espalda_url a productos
const addImagenEspaldaColumn = async () => {
  try {
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_espalda_url TEXT
    `);
    console.log('✅ Columna imagen_espalda_url agregada/verificada');
  } catch (error) {
    if (error.code !== '42701') {
      console.error('❌ Error agregando columna imagen_espalda_url:', error.message);
    }
=======
// Función para limpiar productos de prueba
const clearTestProducts = async () => {
  try {
    const result = await client.query('DELETE FROM productos');
    console.log(`🧹 ${result.rowCount} productos de prueba eliminados`);
  } catch (error) {
    console.error('❌ Error eliminando productos de prueba:', error.message);
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
  }
};

>>>>>>> rama-axel
// Crear tabla de ventas
const createSalesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ventas (
      id SERIAL PRIMARY KEY,
      cliente VARCHAR(255) NOT NULL,
      producto VARCHAR(255) NOT NULL,
      cantidad INTEGER NOT NULL,
      metodo_pago VARCHAR(100),
      monto_cripto DECIMAL(20,8),
      total DECIMAL(10,2) NOT NULL,
      fecha DATE DEFAULT CURRENT_DATE,
      archivada BOOLEAN DEFAULT FALSE,
      usuario_id INTEGER REFERENCES usuarios(id),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla ventas verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla ventas:', error);
  }
};

// Crear tabla de gastos
const createExpensesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS gastos (
      id SERIAL PRIMARY KEY,
      descripcion VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      monto DECIMAL(10,2) NOT NULL,
      fecha DATE DEFAULT CURRENT_DATE,
      metodo_pago VARCHAR(100),
      usuario_id INTEGER REFERENCES usuarios(id),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla gastos verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla gastos:', error);
  }
};

// Crear tabla de preferencias de MercadoPago
const createMPPreferencesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS mp_preferencias (
      id SERIAL PRIMARY KEY,
      preference_id VARCHAR(255) UNIQUE NOT NULL,
      items JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      sandbox_init_point TEXT,
      usuario_id INTEGER REFERENCES usuarios(id),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla mp_preferencias verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla mp_preferencias:', error);
  }
};

// Crear tabla de pagos de MercadoPago
const createMPPaymentsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS mp_pagos (
      id SERIAL PRIMARY KEY,
      payment_id VARCHAR(255) UNIQUE NOT NULL,
      preference_id VARCHAR(255) REFERENCES mp_preferencias(preference_id),
      status VARCHAR(50) NOT NULL,
      status_detail VARCHAR(255),
      payment_type VARCHAR(100),
      payment_method VARCHAR(100),
      amount DECIMAL(10,2),
      currency VARCHAR(10),
      payer_email VARCHAR(255),
      external_reference VARCHAR(255),
      notification_data JSONB,
      fecha_pago TIMESTAMP,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla mp_pagos verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla mp_pagos:', error);
  }
};

<<<<<<< HEAD
=======
<<<<<<< HEAD
// Crear tabla para códigos de recuperación de contraseña
const createPasswordResetTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      codigo VARCHAR(6) NOT NULL,
      expira_en TIMESTAMP NOT NULL,
      usado BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Crear índices por separado para PostgreSQL
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_codes(email)',
    'CREATE INDEX IF NOT EXISTS idx_password_reset_codigo ON password_reset_codes(codigo)'
  ];

  try {
    await client.query(createTableQuery);
    
    for (const indexQuery of createIndexes) {
      await client.query(indexQuery);
    }
    
    console.log('✅ Tabla password_reset_codes verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla password_reset_codes:', error);
  }
};

// Configurar usuarios administradores autorizados
const setupAdminUsers = async () => {
  try {
    const { createAdminUsers } = require('./setup-admins');
    await createAdminUsers(client);
  } catch (error) {
    console.error('❌ Error configurando usuarios admin:', error);
  }
};

=======
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
// Cerrar conexión
const disconnectDB = async () => {
  try {
    await client.end();
    console.log('✅ Desconectado de PostgreSQL');
  } catch (error) {
    console.error('❌ Error desconectando PostgreSQL:', error);
  }
};

module.exports = {
  client,
  connectDB,
  disconnectDB
};