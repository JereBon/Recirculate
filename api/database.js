// database.js - Configuración y conexión a PostgreSQL
const { Client } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/recirculate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Cliente de PostgreSQL
const client = new Client(config);

// Conexión a la base de datos
const connectDB = async () => {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear todas las tablas si no existen
    await createUsersTable();
    await createProductsTable();
    await createSalesTable();
    await createExpensesTable();
    
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
    await createProductsTable();
    await createSalesTable();
    await createExpensesTable();
    
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

// Crear tabla de productos
const createProductsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      categoria VARCHAR(100),
      talle VARCHAR(50),
      color VARCHAR(50),
      marca VARCHAR(100),
      precio DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      estado VARCHAR(50) DEFAULT 'Disponible',
      imagen_url TEXT,
      usuario_id INTEGER REFERENCES usuarios(id),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await client.query(createTableQuery);
    console.log('✅ Tabla productos verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla productos:', error);
  }
};

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