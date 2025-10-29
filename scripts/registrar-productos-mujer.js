// Script para agregar productos de mujer hardcodeados a la base de datos
const API_URL = "https://recirculate-api.onrender.com/api/productos";

// Productos de mujer típicos para una tienda de ropa usada
const productosMujer = [
  {
    nombre: "Blusa Zara Floral",
    descripcion: "Blusa elegante de mujer con estampado floral",
    categoria: "Blusas", 
    genero: "Mujer",
    talle: "M",
    color: "Rosa",
    marca: "Zara",
    estado: "Poco uso",
    precio: 12000,
    stock: 4,
    proveedor: "Fashion Store",
    imagen_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    destacado: true
  },
  {
    nombre: "Jeans Skinny H&M",
    descripcion: "Jeans ajustados de mujer, tiro alto",
    categoria: "Pantalones",
    genero: "Mujer", 
    talle: "28",
    color: "Azul oscuro",
    marca: "H&M",
    estado: "Buen estado",
    precio: 18000,
    stock: 6,
    proveedor: "Outlet Fashion",
    imagen_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
    destacado: false
  },
  {
    nombre: "Vestido Forever 21",
    descripcion: "Vestido casual de mujer, perfecto para el día",
    categoria: "Vestidos",
    genero: "Mujer",
    talle: "S", 
    color: "Negro",
    marca: "Forever 21",
    estado: "Nueva",
    precio: 25000,
    stock: 3,
    proveedor: "Dress Collection",
    imagen_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
    destacado: true
  },
  {
    nombre: "Zapatillas Nike Air Max",
    descripcion: "Zapatillas deportivas de mujer, cómodas y estilosas",
    categoria: "Zapatillas",
    genero: "Mujer",
    talle: "37",
    color: "Blanco y rosa",
    marca: "Nike", 
    estado: "Poco uso",
    precio: 28000,
    stock: 2,
    proveedor: "Sports Woman",
    imagen_url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400",
    destacado: false
  },
  {
    nombre: "Cardigan Pullover",
    descripcion: "Cardigan de punto para mujer, ideal para el invierno",
    categoria: "Cardigans",
    genero: "Mujer",
    talle: "L",
    color: "Beige",
    marca: "Pull&Bear",
    estado: "Buen estado", 
    precio: 15000,
    stock: 5,
    proveedor: "Cozy Clothes",
    imagen_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
    destacado: false
  },
  {
    nombre: "Falda Plisada Mango",
    descripcion: "Falda midi plisada para mujer, elegante y versátil",
    categoria: "Faldas",
    genero: "Mujer", 
    talle: "M",
    color: "Verde",
    marca: "Mango",
    estado: "Nueva",
    precio: 20000,
    stock: 3,
    proveedor: "Elegant Style",
    imagen_url: "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?w=400",
    destacado: true
  },
  {
    nombre: "Top Crop Adidas",
    descripcion: "Top deportivo de mujer para fitness y yoga",
    categoria: "Tops",
    genero: "Mujer",
    talle: "S",
    color: "Negro",
    marca: "Adidas",
    estado: "Poco uso",
    precio: 9000,
    stock: 8,
    proveedor: "Fitness Store", 
    imagen_url: "https://images.unsplash.com/photo-1506629905607-d405872836a5?w=400",
    destacado: false
  },
  {
    nombre: "Chaqueta de Mezclilla",
    descripcion: "Chaqueta denim clásica para mujer",
    categoria: "Chaquetas",
    genero: "Mujer",
    talle: "M", 
    color: "Azul claro",
    marca: "Levi's",
    estado: "Usada",
    precio: 22000,
    stock: 2,
    proveedor: "Denim Collection",
    imagen_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
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
  console.log('🚀 Iniciando registro de productos de mujer...');
  let exitosos = 0;
  let fallidos = 0;

  for (const producto of productosMujer) {
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
  console.log(`📦 Total de productos: ${productosMujer.length}`);
}

// Exportar para uso en consola
window.registrarProductosMujer = registrarTodosLosProductos;
window.productosMujer = productosMujer;

console.log('📋 Script de productos de mujer cargado. Para ejecutar:');
console.log('👉 Ejecuta: registrarProductosMujer()');