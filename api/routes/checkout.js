// routes/checkout.js - Rutas para el proceso de checkout
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// POST /api/checkout/validate - Validar stock y carrito antes del pago
router.post('/validate', verifyToken, async (req, res) => {
  try {
    console.log('🛒 POST /api/checkout/validate - Validando carrito');
    
    const { items } = req.body;
    const userId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El carrito está vacío o no es válido'
      });
    }

    const validationResults = [];
    let totalAmount = 0;
    let hasErrors = false;

    // Validar cada item del carrito
    for (const item of items) {
      const { id, cantidad, precio } = item;
      
      // Obtener producto de la base de datos
      const producto = await Product.findById(id);
      
      if (!producto) {
        validationResults.push({
          id: id,
          valid: false,
          error: 'Producto no encontrado'
        });
        hasErrors = true;
        continue;
      }

      // Verificar disponibilidad
      if (producto.estado !== 'Disponible') {
        validationResults.push({
          id: id,
          valid: false,
          error: 'Producto no disponible'
        });
        hasErrors = true;
        continue;
      }

      // Verificar stock
      if (producto.stock < cantidad) {
        validationResults.push({
          id: id,
          valid: false,
          error: `Stock insuficiente. Disponible: ${producto.stock}`
        });
        hasErrors = true;
        continue;
      }

      // Verificar precio (para evitar manipulación)
      if (Math.abs(producto.precio - precio) > 0.01) {
        validationResults.push({
          id: id,
          valid: false,
          error: 'El precio del producto ha cambiado'
        });
        hasErrors = true;
        continue;
      }

      // Item válido
      validationResults.push({
        id: id,
        valid: true,
        producto: {
          nombre: producto.nombre,
          precio: producto.precio,
          stock_actual: producto.stock
        }
      });

      totalAmount += producto.precio * cantidad;
    }

    if (hasErrors) {
      return res.status(400).json({
        success: false,
        error: 'Algunos productos en tu carrito no están disponibles',
        validation_results: validationResults,
        total_amount: totalAmount
      });
    }

    // Todo válido
    res.json({
      success: true,
      message: 'Carrito validado correctamente',
      validation_results: validationResults,
      total_amount: totalAmount,
      shipping_cost: totalAmount >= 120000 ? 0 : 5000
    });

  } catch (error) {
    console.error('❌ Error validando carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/checkout/process - Procesar compra completa
router.post('/process', verifyToken, async (req, res) => {
  try {
    console.log('💳 POST /api/checkout/process - Procesando compra');
    
    const { items, payment_info, customer_info } = req.body;
    const userId = req.userId;

    // Validar datos requeridos
    if (!items || !payment_info) {
      return res.status(400).json({
        success: false,
        error: 'Datos de compra incompletos'
      });
    }

    // Re-validar carrito antes de procesar
    const validation = await validateCartItems(items);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    // Procesar cada venta y actualizar stock
    const ventasCreadas = [];
    
    for (const item of items) {
      const { id, cantidad, nombre } = item;
      const producto = await Product.findById(id);

      // Crear registro de venta
      const venta = await Sale.create({
        cliente: customer_info?.nombre || 'Cliente Web',
        producto: producto.nombre,
        cantidad: cantidad,
        metodo_pago: 'MercadoPago',
        total: producto.precio * cantidad,
        fecha: new Date(),
        usuario_id: userId
      });

      ventasCreadas.push(venta);

      // Actualizar stock
      const nuevoStock = producto.stock - cantidad;
      await Product.updateStock(id, nuevoStock);
      
      console.log(`📦 Stock actualizado para ${producto.nombre}: ${producto.stock} → ${nuevoStock}`);
    }

    console.log(`✅ Compra procesada exitosamente: ${ventasCreadas.length} productos`);

    res.json({
      success: true,
      message: 'Compra procesada exitosamente',
      ventas: ventasCreadas,
      total_items: ventasCreadas.length
    });

  } catch (error) {
    console.error('❌ Error procesando compra:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando la compra'
    });
  }
});

// Función helper para validar items del carrito
async function validateCartItems(items) {
  try {
    const validationResults = [];
    let hasErrors = false;
    let totalAmount = 0;

    for (const item of items) {
      const producto = await Product.findById(item.id);
      
      if (!producto || producto.stock < item.cantidad || producto.estado !== 'Disponible') {
        validationResults.push({
          id: item.id,
          valid: false,
          error: !producto ? 'Producto no encontrado' : 
                 producto.stock < item.cantidad ? 'Stock insuficiente' : 'Producto no disponible'
        });
        hasErrors = true;
      } else {
        validationResults.push({
          id: item.id,
          valid: true
        });
        totalAmount += producto.precio * item.cantidad;
      }
    }

    return {
      success: !hasErrors,
      validation_results: validationResults,
      total_amount: totalAmount
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error validando carrito'
    };
  }
}

module.exports = router;