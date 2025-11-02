/**
 * script para crear usuarios administradores autorizados
 * Ejecutar una sola vez para configurar los usuarios del panel de admin
 */

const bcrypt = require('bcryptjs');

// Lista de usuarios autorizados para el panel de administración
const adminUsers = [
    {
        nombre: 'Axel Mejias',
        email: 'axel@recirculate.com',
        password: 'Axel12300',
        rol: 'admin'
    },
    {
        nombre: 'Nicolas Hassan', 
        email: 'nicolas@recirculate.com',
        password: 'Nico789',
        rol: 'admin'
    },
    {
        nombre: 'Loe Nuñez',
        email: 'loe@recirculate.com', 
        password: 'LoeZeraNasheUwU',
        rol: 'admin'
    },
    {
        nombre: 'Lucho Mas',
        email: 'lucho@recirculate.com',
        password: 'RebuildHim', 
        rol: 'admin'
    },
    {
        nombre: 'Gere Bomtorno',
        email: 'gere@recirculate.com',
        password: 'Gere468',
        rol: 'admin'
    },
    {
        nombre: 'Pipo Vernier',
        email: 'pipo@recirculate.com',
        password: 'SixSeven',
        rol: 'admin'
    }
];

// Función para crear usuarios (se ejecuta automáticamente al requerir el archivo)
async function createAdminUsers(client) {
    console.log('🔧 Creando usuarios administradores autorizados...');
    
    try {
        for (const user of adminUsers) {
            // Verificar si el usuario ya existe
            const existingUser = await client.query(
                'SELECT id FROM usuarios WHERE email = $1',
                [user.email]
            );
            
            if (existingUser.rows.length > 0) {
                console.log(`✅ Usuario ${user.email} ya existe`);
                continue;
            }
            
            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            // Crear usuario
            await client.query(
                `INSERT INTO usuarios (nombre, email, password, rol, fecha_registro) 
                 VALUES ($1, $2, $3, $4, NOW())`,
                [user.nombre, user.email, hashedPassword, user.rol]
            );
            
            console.log(`✅ Usuario creado: ${user.nombre} (${user.email})`);
        }
        
        console.log('🎉 Todos los usuarios administradores han sido configurados');
        
    } catch (error) {
        console.error('❌ Error creando usuarios administradores:', error);
        throw error;
    }
}

module.exports = { createAdminUsers, adminUsers };