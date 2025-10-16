// routes/setup.js - Ruta para setup inicial de administradores
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST /api/setup/admins - Crear administradores iniciales (solo una vez)
router.post('/admins', async (req, res) => {
  try {
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
        email: 'loe@recirculate.com', 
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

    const created = [];
    const errors = [];

    for (const adminData of admins) {
      try {
        // Verificar si ya existe
        const existing = await User.findByEmail(adminData.email);
        if (existing) {
          console.log(`Usuario ${adminData.email} ya existe, saltando...`);
          continue;
        }

        // Crear usuario usando el modelo User (que ya maneja bcryptjs correctamente)
        const newAdmin = await User.create(adminData);
        created.push({
          id: newAdmin.id,
          nombre: newAdmin.nombre,
          email: newAdmin.email,
          rol: newAdmin.rol
        });
        
      } catch (error) {
        errors.push({
          email: adminData.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `${created.length} administradores creados exitosamente`,
      created,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error creando administradores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;