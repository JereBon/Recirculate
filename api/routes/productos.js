// routes/productos.js - Rutas para manejo de productos
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware para verificar autenticación (opcional para algunas rutas)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recirculate_secret_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const productos = await Product.findAll(search);
    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para obtener productos destacados
router.get('/destacados', async (req, res) => {
  try {
    const destacados = await Product.getDestacados();
    res.json(destacados);
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para obtener productos por género
router.get('/genero/:genero', async (req, res) => {
  try {
    const { genero } = req.params;
    
    // Validar género
    if (!['hombre', 'mujer', 'unisex'].includes(genero.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Género inválido. Debe ser: hombre, mujer o unisex' 
      });
    }

    const productos = await Product.getByGenero(genero.toLowerCase());
    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos por género:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Product.findById(id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para crear un producto (requiere autenticación)
router.post('/', verifyToken, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      usuario_id: req.user.id
    };

    // Validaciones obligatorias
    if (!productData.nombre) {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }

    if (!productData.genero) {
      return res.status(400).json({ message: 'El género es obligatorio (hombre/mujer/unisex)' });
    }

    if (!['hombre', 'mujer', 'unisex'].includes(productData.genero.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Género inválido. Debe ser: hombre, mujer o unisex' 
      });
    }

    if (!productData.precio || productData.precio <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    // Verificar si ya existe un producto con ese nombre
    const existingProduct = await Product.findByName(productData.nombre);
    if (existingProduct) {
      return res.status(400).json({ message: 'Ya existe un producto con ese nombre' });
    }

    const nuevoProducto = await Product.create(productData);
    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para actualizar un producto (requiere autenticación)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Validaciones
    if (productData.genero && !['hombre', 'mujer', 'unisex'].includes(productData.genero.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Género inválido. Debe ser: hombre, mujer o unisex' 
      });
    }

    if (productData.precio && productData.precio <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    const productoActualizado = await Product.update(id, productData);
    
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para actualizar solo el stock
router.patch('/:id/stock', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'El stock debe ser un número mayor o igual a 0' });
    }

    const productoActualizado = await Product.updateStock(id, stock);
    
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Stock actualizado exitosamente',
      producto: productoActualizado
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para eliminar un producto (requiere autenticación)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Product.delete(id);
    
    if (!productoEliminado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto eliminado exitosamente',
      producto: productoEliminado
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;