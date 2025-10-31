// Script para agregar productos de hombre hardcodeados a la base de datos
const API_URL = "https://recirculate-api.onrender.com/api/productos";

// Productos de hombre típicos para una tienda de ropa usada
const productosHombre = [
  {
    nombre: "Remera Nike Dri-Fit",
    descripcion: "Remera deportiva de hombre, tela que absorbe la humedad",
    categoria: "Remeras", 
    genero: "Hombre",
    talle: "L",
    color: "Negro",
    marca: "Nike",
    estado: "Poco uso",
    precio: 15000,
    stock: 5,
    proveedor: "Deportes Central",
    imagen_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    destacado: true
  },
  {
    nombre: "Jeans Levi's 501",
    descripcion: "Jeans clásicos de hombre, corte regular",
    categoria: "Pantalones",
    genero: "Hombre", 
    talle: "32",
    color: "Azul",
    marca: "Levi's",
    estado: "Buen estado",
    precio: 25000,
    stock: 3,
    proveedor: "Vintage Store",
    imagen_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    destacado: false
  },
  {
    nombre: "Campera Adidas Track",
    descripcion: "Campera deportiva de hombre con cierre",
    categoria: "Camperas",
    genero: "Hombre",
    talle: "M", 
    color: "Azul marino",
    marca: "Adidas",
    estado: "Nueva",
    precio: 35000,
    stock: 2,
    proveedor: "Outlet Deportivo",
    imagen_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    destacado: true
  },
  {
    nombre: "Zapatillas Converse All Star",
    descripcion: "Zapatillas urbanas clásicas de lona",
    categoria: "Zapatillas",
    genero: "Hombre",
    talle: "42",
    color: "Blanco",
    marca: "Converse", 
    estado: "Usada",
    precio: 20000,
    stock: 1,
    proveedor: "Second Hand",
    imagen_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    destacado: false
  },
  {
    nombre: "Buzo Puma Hoodie",
    descripcion: "Buzo con capucha para hombre, algodón",
    categoria: "Buzos",
    genero: "Hombre",
    talle: "XL",
    color: "Gris",
    marca: "Puma",
    estado: "Poco uso", 
    precio: 18000,
    stock: 4,
    proveedor: "Ropa Urbana",
    imagen_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
    destacado: false
  },
  {
    nombre: "Camisa Tommy Hilfiger",
    descripcion: "Camisa de vestir de hombre, algodón premium",
    categoria: "Camisas",
    genero: "Hombre", 
    talle: "M",
    color: "Celeste",
    marca: "Tommy Hilfiger",
    estado: "Buen estado",
    precio: 22000,
    stock: 2,
    proveedor: "Elegante Store",
    imagen_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    destacado: true
  },
  {
    nombre: "Short Nike Running",
    descripcion: "Short deportivo de hombre para correr",
    categoria: "Shorts",
    genero: "Hombre",
    talle: "L",
    color: "Negro",
    marca: "Nike",
    estado: "Nueva",
    precio: 12000,
    stock: 6,
    proveedor: "Deportes Central", 
    imagen_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    destacado: false
  },
  {
    nombre: "Chaqueta de Cuero",
    descripcion: "Chaqueta de cuero sintético para hombre",
    categoria: "Chaquetas",
    genero: "Hombre",
    talle: "L", 
    color: "Negro",
    marca: "No Brand",
    estado: "Muy usada",
    precio: 30000,
    stock: 1,
    proveedor: "Vintage Collection",
    imagen_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    destacado: true
  }
];

// Función para registrar un producto
async function registrarProducto(producto) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No hay token de autenticación');
      return false;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(producto)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Producto "${producto.nombre}" registrado correctamente:`, result);
      return true;
    } else {
      const error = await response.json();
      console.error(`❌ Error registrando "${producto.nombre}":`, error);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error de conexión registrando "${producto.nombre}":`, err);
    return false;
  }
}

// Función para registrar todos los productos
async function registrarTodosLosProductos() {
  console.log('🚀 Iniciando registro de productos de hombre...');
  let exitosos = 0;
  let fallidos = 0;

  for (const producto of productosHombre) {
    const exito = await registrarProducto(producto);
    if (exito) {
      exitosos++;
    } else {
      fallidos++;
    }
    // Esperar un poco entre cada registro
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 RESUMEN:`);
  console.log(`✅ Productos registrados exitosamente: ${exitosos}`);
  console.log(`❌ Productos que fallaron: ${fallidos}`);
  console.log(`📦 Total de productos: ${productosHombre.length}`);
}

// Exportar para uso en consola
window.registrarProductosHombre = registrarTodosLosProductos;
window.productosHombre = productosHombre;

console.log('📋 Script de productos cargado. Para ejecutar:');
console.log('👉 Ejecuta: registrarProductosHombre()');