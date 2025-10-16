// routes/auth.js - Rutas de autenticación
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validaciones
const registerValidation = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra y un número'),
  body('rol')
    .optional()
    .isIn(['admin', 'cliente'])
    .withMessage('El rol debe ser admin o cliente')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// POST /api/auth/registro - Registrar nuevo usuario
router.post('/registro', registerValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { nombre, email, password, rol } = req.body;

    // Verificar si el email ya existe
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Solo admin puede crear otros admins
    if (rol === 'admin' && (!req.user || req.user.rol !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Solo un administrador puede crear cuentas de administrador'
      });
    }

    // Crear usuario
    const newUser = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'cliente'
    });

    // Generar token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, rol: newUser.rol },
      process.env.JWT_SECRET || 'secretkey_recirculate_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secretkey_recirculate_2024',
      { expiresIn: '7d' }
    );

    // Remover password del objeto usuario
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/usuario/:id - Obtener información de usuario
router.get('/usuario/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo admin puede ver cualquier usuario, otros solo pueden ver su propio perfil
    if (req.user.rol !== 'admin' && req.user.id != id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta información'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/perfil - Obtener perfil del usuario actual
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/usuarios - Obtener todos los usuarios (solo admin)
router.get('/usuarios', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/logout - Cerrar sesión (cliente)
router.post('/logout', (req, res) => {
  // En JWT no necesitamos hacer nada en el servidor
  // El cliente simplemente elimina el token
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

module.exports = router;