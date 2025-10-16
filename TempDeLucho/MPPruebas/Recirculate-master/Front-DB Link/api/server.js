// --- IMPORTS Y CONFIGURACIÓN INICIAL ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const uploadRouter = require('./upload');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
const PORT = process.env.PORT || 3001;

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recirculate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- DEFINICIÓN DE SCHEMAS Y MODELOS ---
const gastoSchema = new mongoose.Schema({
  proveedor: { type: String, required: true },
  concepto: { type: String, required: true },
  total: { type: Number, required: true },
  metodoPago: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
}, { timestamps: true });
const Gasto = mongoose.model('Gasto', gastoSchema);

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  categoria: String,
  talle: String,
  color: String,
  marca: String,
  estado: String, // "Usado - Muy bueno"
  precio: { type: Number, required: true },
  moneda: { type: String, default: "ARS" },
  imagenes: [String],
  proveedor: {
    usuarioId: mongoose.Schema.Types.ObjectId,
    nombre: String
  },
  stock: { type: Number, default: 1 },
  activo: { type: Boolean, default: true },
}, { timestamps: true });
const Producto = mongoose.model('Producto', productoSchema);

const ventaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  producto: { type: String, required: true }, // nombre del producto
  cantidad: { type: Number, required: true },
  metodoPago: { type: String, required: true },
  montoCripto: Number,
  total: { type: Number, required: true },
  archivada: { type: Boolean, default: false },
}, { timestamps: true });
const Venta = mongoose.model('Venta', ventaSchema);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRouter);

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Cliente conectado a Socket.IO');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado de Socket.IO');
  });
});

// Archivar venta y restaurar stock (no borrar)
app.delete('/api/ventas/:id', async (req, res) => {
  console.log('Intentando archivar venta con id:', req.params.id);
  const venta = await Venta.findById(req.params.id);
  if (!venta) {
    console.log('Venta no encontrada');
    return res.status(404).json({ error: 'Venta no encontrada' });
  }
  if (venta.archivada) {
    return res.status(400).json({ error: 'La venta ya está archivada' });
  }
  // Buscar producto por nombre
  const prod = await Producto.findOne({ nombre: venta.producto });
  if (prod) {
    prod.stock += venta.cantidad;
    await prod.save();
    console.log('Stock actualizado:', prod.stock);
  } else {
    console.log('Producto NO encontrado para reponer stock:', venta.producto);
  }
  // Marcar como archivada en vez de borrar
  venta.archivada = true;
  await venta.save();
  console.log('Venta archivada correctamente:', venta._id);
  io.emit('venta-borrada', { ventaId: req.params.id });
  res.status(204).end();
});
// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { categoria: { $regex: search, $options: 'i' } }
      ]
    };
  }
  const productos = await Producto.find(query);
  res.json(productos);
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(producto);
});

// Crear producto
app.post('/api/productos', async (req, res) => {
  const nuevo = new Producto(req.body);
  await nuevo.save();
  res.status(201).json(nuevo);
});

// Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
  const actualizado = await Producto.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (actualizado && actualizado.stock <= 0) {
    await Producto.findByIdAndDelete(actualizado._id);
    res.json({ message: 'Producto eliminado por stock agotado' });
  } else {
    res.json(actualizado);
  }
});

// Borrar producto
app.delete('/api/productos/:id', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Obtener todas las ventas (solo no archivadas)
app.get('/api/ventas', async (req, res) => {
  const ventas = await Venta.find({ archivada: false });
  res.json(ventas);
});

// Crear venta y actualizar stock

app.post('/api/ventas', async (req, res) => {
  try {
    console.log('Intentando registrar venta:', req.body);
  const { cliente, producto, cantidad, metodoPago, montoCripto, fecha } = req.body;

    // Encontrar el producto por nombre exacto
    const prod = await Producto.findOne({ nombre: producto });
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
  const nuevaVenta = new Venta({ cliente, producto: prod.nombre, cantidad, metodoPago, montoCripto, total, fecha });
    await nuevaVenta.save();
    console.log('Venta guardada en MongoDB:', nuevaVenta);

    // Actualizar stock
    prod.stock -= cantidad;
    if (prod.stock <= 0) {
      prod.stock = 0;
      prod.estado = 'Sin stock';
      await prod.save();
      console.log('Producto marcado como Sin stock:', prod.nombre);
    } else {
      await prod.save();
      console.log('Stock actualizado para producto:', prod.nombre, 'Nuevo stock:', prod.stock);
    }

    // Emitir evento de nueva venta a todos los clientes conectados
    io.emit('nueva-venta', nuevaVenta);

    res.status(201).json(nuevaVenta);
  } catch (err) {
    console.error('Error al registrar venta:', err);
    res.status(500).json({ error: 'Error al registrar venta', details: err.message });
  }
});

// Obtener todos los gastos
app.get('/api/gastos', async (req, res) => {
  const gastos = await Gasto.find();
  res.json(gastos);
});


// Registrar un nuevo gasto
app.post('/api/gastos', async (req, res) => {
  try {
    const nuevoGasto = new Gasto(req.body);
    await nuevoGasto.save();
    // Emitir evento en tiempo real si usas socket.io
    io.emit('nuevo-gasto', nuevoGasto);
    res.status(201).json(nuevoGasto);
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar gasto', details: err.message });
  }
});

// --- MERCADOPAGO ---
const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

app.post('/api/pagos/preferencia', async (req, res) => {
  try {
    console.log('Request to /api/pagos/preferencia received.');
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed: Items are missing or empty.');
      return res.status(400).json({ error: 'Items are required and must be an array with at least one item.' });
    }

    const preferenceData = {
      items: items,
      back_urls: {
        success: "https://example.com/success",
        failure: "https://example.com/failure",
        pending: "https://example.com/pending"
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    res.json({ sandbox_init_point: result.sandbox_init_point });

  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Failed to create preference' });
  }
});

app.post('/api/pagos/notificaciones', (req, res) => {
  console.log('--- Notificación de Mercado Pago recibida ---');
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  // In a real application, you would use the 'id' from the notification
  // to get the full payment details from Mercado Pago and then update
  // your database (e.g., mark an order as paid).

  // Respond to Mercado Pago to acknowledge receipt of the notification
  res.sendStatus(200);
});


server.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
