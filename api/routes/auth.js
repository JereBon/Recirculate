// routes/auth.js - Rutas de autenticación
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asumo que User tiene métodos findByEmail, create, etc.
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library'); // NUEVA DEPENDENCIA

const router = express.Router();

// --- CONFIGURACIÓN DE GOOGLE ---
// REEMPLAZA ESTO con tu CLIENT_ID real de la consola de Google
const GOOGLE_CLIENT_ID = "438077826741-urpa2vhu8761v332srgmk82b6ngaajef.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
// -------------------------------


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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { nombre, email, password, rol, telefono, direccion, fechaNacimiento, adminToken } = req.body;

    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    if (rol === 'admin') {
      if (!adminToken || adminToken !== '676767') {
        return res.status(403).json({
          success: false,
          message: 'Solo con un token correcto se puede ser admin'
        });
      }
    }

    if (rol === 'cliente' && (!telefono || !direccion || !fechaNacimiento)) {
      return res.status(400).json({
        success: false,
        message: 'Los campos teléfono, dirección y fecha de nacimiento son obligatorios para clientes'
      });
    }

    const newUser = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'cliente',
      telefono,
      direccion,
      fechaNacimiento
    });

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secretkey_recirculate_2024',
      { expiresIn: '7d' }
    );

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

// ******************************************************
// NUEVA RUTA: POST /api/auth/google-signin
// ******************************************************
router.post('/google-signin', async (req, res) => {
    const { token } = req.body; // Recibe el ID Token de Google

    if (!token) {
        return res.status(400).json({ success: false, message: 'No se recibió el token de Google.' });
    }

    let payload;
    try {
        // 1. Verificar y obtener el payload del token de Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, 
        });
        payload = ticket.getPayload();
    } catch (error) {
        console.error("Error al verificar token de Google:", error);
        return res.status(401).json({ success: false, message: 'Token de Google inválido.' });
    }

    const { email, name: nombre } = payload;
    
    try {
        // 2. Buscar usuario en la base de datos
        let user = await User.findByEmail(email);

        // 3. Si el usuario no existe, crearlo como cliente
        if (!user) {
            console.log(`Creando nuevo usuario (Google): ${email}`);
            // NOTA: Asignamos 'cliente' y datos nulos para campos obligatorios del modelo si no vienen
            const newUser = await User.create({
                nombre,
                email,
                // No se necesita password, pero el modelo puede requerir un hash (usar un placeholder si es necesario)
                // Asumo que el modelo maneja la falta de password para usuarios de terceros
                rol: 'cliente',
                telefono: null,
                direccion: null,
                fechaNacimiento: null
            });
            user = newUser;
        }
        
        // 4. Generar el token JWT de la aplicación
        const projectToken = jwt.sign(
            { userId: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET || 'secretkey_recirculate_2024',
            { expiresIn: '7d' }
        );

        // 5. Enviar respuesta exitosa
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login con Google exitoso',
            data: {
                user: userWithoutPassword,
                token: projectToken
            }
        });

    } catch (dbError) {
        console.error("Error en la base de datos (Google Sign-In):", dbError);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});


// GET /api/auth/usuario/:id - Obtener información de usuario
router.get('/usuario/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
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
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

module.exports = router;