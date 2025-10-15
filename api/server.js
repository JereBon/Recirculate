// --- IMPORTS Y CONFIGURACIÓN INICIAL ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const uploadRouter = require('./upload');
const http = require('http');
const { Server } = require('socket.io');

// Importar configuración de PostgreSQL y rutas de autenticación
const { connectDB } = require('./database');
const authRoutes = require('./routes/auth');
const { verifyToken, verifyAdmin } = require('./middleware/auth');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
const PORT = process.env.PORT || 3001;

// --- CONEXIÓN A POSTGRESQL ---
connectDB();

// --- SOLO POSTGRESQL - MongoDB ELIMINADO COMPLETAMENTE ---

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRouter);

// --- SERVIR ARCHIVOS ESTÁTICOS ---
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// --- RUTA PRINCIPAL ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'welcome.html'));
});

// --- RUTA PARA EL SISTEMA COMPLETO ---
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- RUTA PARA VERIFICAR BASE DE DATOS ---
app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'db-check.html'));
});

// --- RUTA DE PRUEBA DE API ---
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Recirculate API funcionando correctamente',
    version: '3.1',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// --- RUTA PARA VERIFICAR BASE DE DATOS ---
app.get('/api/db-check', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { client } = require('./database');
    
    // Verificar conexión
    const connectionTest = await client.query('SELECT NOW()');
    
    // Contar registros en cada tabla
    const userCount = await client.query('SELECT COUNT(*) FROM usuarios');
    const productCount = await client.query('SELECT COUNT(*) FROM productos');
    const saleCount = await client.query('SELECT COUNT(*) FROM ventas');
    const expenseCount = await client.query('SELECT COUNT(*) FROM gastos');
    
    // Obtener últimos productos
    const recentProducts = await client.query('SELECT * FROM productos ORDER BY fecha_creacion DESC LIMIT 5');
    
    res.json({
      status: 'Conexión exitosa',
      timestamp: connectionTest.rows[0].now,
      tables: {
        usuarios: parseInt(userCount.rows[0].count),
        productos: parseInt(productCount.rows[0].count),
        ventas: parseInt(saleCount.rows[0].count),
        gastos: parseInt(expenseCount.rows[0].count)
      },
      recent_products: recentProducts.rows
    });
  } catch (error) {
    console.error('Error verificando base de datos:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE AUTENTICACIÓN ---
app.use('/api/auth', authRoutes);

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Cliente conectado a Socket.IO');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado de Socket.IO');
  });
});

// Ruta obsoleta eliminada - ahora se usa PostgreSQL

// --- RUTAS DE PRODUCTOS CON POSTGRESQL ---
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Expense = require('./models/Expense');

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    console.log('🔍 GET /api/productos - Solicitando productos...');
    const { search } = req.query;
    console.log('🔍 Parámetro de búsqueda:', search);
    
    const productos = await Product.findAll(search);
    console.log(`🔍 Productos encontrados: ${productos.length}`);
    console.log('🔍 Productos:', JSON.stringify(productos, null, 2));
    
    res.json(productos);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear producto (solo admin)
app.post('/api/productos', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('📦 POST /api/productos - Creando producto...');
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('📦 Usuario ID:', req.userId);
    
    const nuevo = await Product.create({
      ...req.body,
      usuario_id: req.userId
    });
    
    console.log('✅ Producto creado exitosamente:', JSON.stringify(nuevo, null, 2));
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar producto (solo admin)
app.put('/api/productos/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const actualizado = await Product.update(req.params.id, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Si el stock queda en 0 o menos, eliminar producto
    if (actualizado.stock <= 0) {
      await Product.delete(actualizado.id);
      res.json({ message: 'Producto eliminado por stock agotado' });
    } else {
      res.json(actualizado);
    }
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Borrar producto (solo admin)
app.delete('/api/productos/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const eliminado = await Product.delete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las ventas (solo no archivadas) - solo admin
app.get('/api/ventas', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ventas = await Sale.findAll();
    res.json(ventas);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear venta y actualizar stock (solo admin)
app.post('/api/ventas', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Intentando registrar venta:', req.body);
  const { cliente, producto, cantidad, metodoPago, montoCripto, fecha } = req.body;

    // Encontrar el producto por nombre exacto
    const prod = await Product.findByName(producto);
    if (!prod) {
      console.log('Producto no encontrado:', producto);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar stock suficiente
    if (cantidad > prod.stock) {
      console.log('Stock insuficiente para producto:', producto, 'Stock:', prod.stock, 'Cantidad solicitada:', cantidad);
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Calcular total basado en precio del producto
    const total = cantidad * prod.precio;

    // Crear la venta
    const nuevaVenta = await Sale.create({
      cliente,
      producto: prod.nombre,
      cantidad,
      metodo_pago: metodoPago,
      monto_cripto: montoCripto,
      total,
      fecha,
      usuario_id: req.userId
    });
    console.log('Venta guardada en PostgreSQL:', nuevaVenta);

    // Actualizar stock del producto
    const nuevoStock = prod.stock - cantidad;
    await Product.updateStock(prod.id, nuevoStock);
    
    if (nuevoStock <= 0) {
      console.log('Producto marcado como Sin stock:', prod.nombre);
    } else {
      console.log('Stock actualizado para producto:', prod.nombre, 'Nuevo stock:', nuevoStock);
    }

    // Emitir evento de nueva venta a todos los clientes conectados
    io.emit('nueva-venta', nuevaVenta);

    res.status(201).json(nuevaVenta);
  } catch (err) {
    console.error('Error al registrar venta:', err);
    res.status(500).json({ error: 'Error al registrar venta', details: err.message });
  }
});

// Obtener todos los gastos (solo admin)
app.get('/api/gastos', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const gastos = await Expense.findAll();
    res.json(gastos);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registrar un nuevo gasto (solo admin)
app.post('/api/gastos', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const nuevoGasto = await Expense.create({
      ...req.body,
      usuario_id: req.userId
    });
    // Emitir evento en tiempo real
    io.emit('nuevo-gasto', nuevoGasto);
    res.status(201).json(nuevoGasto);
  } catch (err) {
    console.error('Error al registrar gasto:', err);
    res.status(500).json({ error: 'Error al registrar gasto', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT} - v4.0 - PostgreSQL puro`);
  console.log(`🌐 Aplicación disponible en: https://recirculate-api.onrender.com`);
  console.log(`📱 Sistema completo en: https://recirculate-api.onrender.com/app`);
  console.log(`🔍 Verificar BD en: https://recirculate-api.onrender.com/debug`);
  console.log(`🚀 MongoDB completamente eliminado - Solo PostgreSQL`);
});
