// models/User.js - Modelo de usuario para PostgreSQL
const { client } = require('../database');
const bcrypt = require('bcryptjs');

class User {
  
  // Crear nuevo usuario
  static async create(userData) {
    const { nombre, email, password, rol = 'cliente', telefono, direccion, fechaNacimiento } = userData;
    
    try {
      // Iniciar transacción
      await client.query('BEGIN');
      
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userQuery = `
        INSERT INTO usuarios (nombre, email, password, rol, fecha_creacion, fecha_actualizacion)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, nombre, email, rol, fecha_creacion
      `;
      
      const userValues = [nombre, email, hashedPassword, rol];
      const userResult = await client.query(userQuery, userValues);
      const newUser = userResult.rows[0];
      
      // Si es cliente, crear registro en tabla clientes
      if (rol === 'cliente' && telefono && direccion && fechaNacimiento) {
        const clientQuery = `
          INSERT INTO clientes (usuario_id, telefono, direccion, fecha_nacimiento, fecha_creacion, fecha_actualizacion)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const clientValues = [newUser.id, telefono, direccion, fechaNacimiento];
        await client.query(clientQuery, clientValues);
      }
      
      // Confirmar transacción
      await client.query('COMMIT');
      
      return newUser;
    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM usuarios WHERE email = $1';
      const result = await client.query(query, [email]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const query = 'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = $1';
      const result = await client.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verificar contraseña
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Obtener todos los usuarios (solo admin)
  static async getAll() {
    try {
      const query = 'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC';
      const result = await client.query(query);
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    const { nombre, email, rol } = userData;
    
    try {
      const query = `
        UPDATE usuarios 
        SET nombre = COALESCE($1, nombre),
            email = COALESCE($2, email),
            rol = COALESCE($3, rol),
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, nombre, email, rol, fecha_actualizacion
      `;
      
      const values = [nombre, email, rol, id];
      const result = await client.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar si email ya existe
  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM usuarios WHERE email = $1';
      let values = [email];
      
      if (excludeId) {
        query += ' AND id != $2';
        values.push(excludeId);
      }
      
      const result = await client.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener cliente completo con información adicional
  static async getClientWithDetails(userId) {
    try {
      const query = `
        SELECT 
          u.id, u.nombre, u.email, u.rol, u.fecha_creacion,
          c.telefono, c.direccion, c.fecha_nacimiento
        FROM usuarios u
        LEFT JOIN clientes c ON u.id = c.usuario_id
        WHERE u.id = $1 AND u.rol = 'cliente'
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;