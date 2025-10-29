// create-admins.js - Script para crear los 6 administradores
const { Client } = require('pg');
const bcrypt = require('bcryptjs'); // Usar la misma librería que User.js
require('dotenv').config();

// Configuración de la base de datos (usar la misma configuración que database.js)
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/recirculate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const client = new Client(config);

// Lista de administradores a crear
const admins = [
  {
    nombre: 'Axel Mejias', 
    password: 'Axel12300',
    email: 'axel@recirculate.com',
    rol: 'admin'
  },
  {
    nombre: 'Nicolas Hassan',
    password: 'Nico789', 
    email: 'nicolas@recirculate.com',
    rol: 'admin'
  },
  {
    nombre: 'Loe Nuñez',
    password: 'LoeZeraNasheUwU',
    email: '', 
    rol: 'admin'
  },
  {
    nombre: 'Lucho Mas',
    password: 'RebuildHim',
    email: 'lucho@recirculate.com',
    rol: 'admin'
  },
  {
    nombre: 'Gere Bomtorno', 
    password: 'Gere468',
    email: 'gere@recirculate.com',
    rol: 'admin'
  },
  {
    nombre: 'Pipo Vernier',
    password: 'SixSeven',
    email: 'pipo@recirculate.com',
    rol: 'admin'
  }
];

async function createAdmins() {
  console.log('🚀 Creando administradores...');
  
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    for (const admin of admins) {
      try {
        // Verificar si el usuario ya existe y eliminarlo para recrearlo con hash correcto
        const existingUser = await client.query(
          'SELECT id FROM usuarios WHERE email = $1',
          [admin.email]
        );

        if (existingUser.rows.length > 0) {
          console.log(`🔄 Usuario ${admin.email} ya existe, eliminando para recrear con hash correcto...`);
          await client.query('DELETE FROM usuarios WHERE email = $1', [admin.email]);
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(admin.password, saltRounds);

        // Insertar usuario
        const result = await client.query(
          `INSERT INTO usuarios (nombre, email, password, rol) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, nombre, email, rol`,
          [admin.nombre, admin.email, hashedPassword, admin.rol]
        );

        console.log(`✅ Admin creado: ${result.rows[0].nombre} (${result.rows[0].email}) - ID: ${result.rows[0].id}`);
        
      } catch (error) {
        console.error(`❌ Error creando ${admin.nombre}:`, error.message);
      }
    }

    // Mostrar todos los usuarios admin
    console.log('\n📋 Lista de administradores en la base de datos:');
    const allAdmins = await client.query(
      "SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE rol = 'admin' ORDER BY id"
    );
    
    allAdmins.rows.forEach(admin => {
      console.log(`ID: ${admin.id} | ${admin.nombre} | ${admin.email} | Creado: ${admin.fecha_creacion}`);
    });

    console.log('\n🎉 ¡Proceso completado!');
    console.log('💡 Cada admin puede ahora loguearse con su EMAIL y contraseña desde cualquier PC');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar el script
createAdmins();