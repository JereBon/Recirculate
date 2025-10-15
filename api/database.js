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
    
    // Crear tabla usuarios si no existe
    await createUsersTable();
    
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
    
    // Crear tablas
    await createUsersTable();
    
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