// productos-ejemplo.js - Datos de ejemplo para testing

// Productos disponibles en el home
const productosEjemplo = [
  {
    id: 'prod_buzo_morley',
    nombre: 'Buzo morley',
    precio: 25500,
    imagen: '../assets/images/Buzo morley.png',
    imagenHover: '../assets/images/buzo morley 2.png',
    categoria: 'Buzos',
    descuento: 23
  },
  {
    id: 'prod_pantalon_corderoy',
    nombre: 'Pantalón Corderoy',
    precio: 33200,
    imagen: '../assets/images/Pantalon corderoy.png',
    imagenHover: '../assets/images/Pantalon corderoy 2.png',
    categoria: 'Pantalones',
    descuento: 15
  },
  {
    id: 'prod_camisa_bleu',
    nombre: 'Camisa BLEU',
    precio: 46000,
    imagen: '../assets/images/Camisa lineas.png',
    imagenHover: '../assets/images/Camisa lineas 2.png',
    categoria: 'Camisas',
    descuento: 30
  }
];

// Función para agregar productos de ejemplo al carrito (para testing)
function agregarProductosEjemplo() {
  productosEjemplo.forEach(producto => {
    const productoCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      cantidad: 1
    };
    agregarAlCarrito(productoCarrito);
  });
  console.log('✓ Productos de ejemplo agregados al carrito');
}

// Función para limpiar el carrito (para testing)
function limpiarCarrito() {
  localStorage.removeItem('recirculate_carrito');
  actualizarContadorCarrito();
  console.log('✓ Carrito limpiado');
  location.reload();
}

// Hacer funciones disponibles en consola
if (typeof window !== 'undefined') {
  window.agregarProductosEjemplo = agregarProductosEjemplo;
  window.limpiarCarrito = limpiarCarrito;
  window.verCarrito = () => {
    console.table(JSON.parse(localStorage.getItem('recirculate_carrito') || '[]'));
  };
}

console.log('💡 Funciones de testing disponibles:');
console.log('  - agregarProductosEjemplo() - Agrega 3 productos de prueba');
console.log('  - limpiarCarrito() - Vacía el carrito completamente');
console.log('  - verCarrito() - Muestra el contenido actual del carrito');
