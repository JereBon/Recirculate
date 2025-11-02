// upload.js - Endpoint para subir imágenes a Cloudinary
// Maneja subida de archivos de imagen usando Multer y Cloudinary.

// Importa dependencias: Express para router, Cloudinary configurado, Multer para manejo de archivos
const express = require('express');
const router = express.Router();
const cloudinary = require('./cloudinary');
const multer = require('multer');

// Configura Multer para almacenar archivos en memoria (no en disco)
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
});

// Exporta router para usar en server.js
module.exports = router;
