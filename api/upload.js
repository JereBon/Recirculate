// upload.js - Endpoint para subir imágenes a Cloudinary
// Maneja subida de archivos de imagen usando Multer y Cloudinary.
<<<<<<< HEAD
// Soporta subida única y múltiple (hasta 2 imágenes por producto)
=======
>>>>>>> rama-axel

// Importa dependencias: Express para router, Cloudinary configurado, Multer para manejo de archivos
const express = require('express');
const router = express.Router();
const cloudinary = require('./cloudinary');
const multer = require('multer');

// Configura Multer para almacenar archivos en memoria (no en disco)
<<<<<<< HEAD
// Límite de 5MB por archivo, máximo 2 archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2 // Máximo 2 archivos
  },
  fileFilter: (req, file, cb) => {
    // Solo acepta imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Función helper para subir imagen a Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'recirculate/productos') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Ruta POST /api/upload/single: sube imagen única a Cloudinary
router.post('/single', upload.single('imagen'), async (req, res) => {
  try {
    // Valida que se haya enviado un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta POST /api/upload/multiple: sube hasta 2 imágenes para productos
router.post('/multiple', upload.fields([
  { name: 'imagen_principal', maxCount: 1 },
  { name: 'imagen_secundaria', maxCount: 1 }
]), async (req, res) => {
  try {
    const result = {};

    // Subir imagen principal si existe
    if (req.files.imagen_principal) {
      result.imagen_principal = await uploadToCloudinary(
        req.files.imagen_principal[0].buffer
      );
    }

    // Subir imagen secundaria si existe
    if (req.files.imagen_secundaria) {
      result.imagen_secundaria = await uploadToCloudinary(
        req.files.imagen_secundaria[0].buffer
      );
    }

    // Validar que al menos una imagen fue subida
    if (!result.imagen_principal && !result.imagen_secundaria) {
      return res.status(400).json({ error: 'No se enviaron archivos válidos' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta POST /api/upload: Mantener compatibilidad con código existente
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    // Valida que se haya enviado un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ error: error.message });
  }
=======
const upload = multer({ storage: multer.memoryStorage() });

// Ruta POST /api/upload: sube imagen a Cloudinary, espera campo 'imagen'
router.post('/', upload.single('imagen'), (req, res) => {
  // Valida que se haya enviado un archivo
  if (!req.file) return res.status(400).json({ error: 'No se envió archivo' });

  // Crea stream de subida a Cloudinary para imágenes
  const uploadStream = cloudinary.uploader.upload_stream(
    { resource_type: 'image' },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      // Retorna URL segura de la imagen subida
      res.json({ url: result.secure_url });
    }
  );

  // Envía buffer del archivo al stream
  uploadStream.end(req.file.buffer);
>>>>>>> rama-axel
});

// Exporta router para usar en server.js
module.exports = router;
