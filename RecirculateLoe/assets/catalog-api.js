// catalog-api.js - Conexión del catálogo con la API de productos
console.log('🔌 Catalog API Manager cargado');

// Configuración de la API
const API_CONFIG = {
  baseUrl: window.location.origin + '/api',
  endpoints: {
    productos: '/productos/publicos',
    categorias: '/productos/categorias',
    detalle: '/productos/publicos'
  }
};

// Cache simple para productos
let productCache = new Map();
let categoriesCache = null;

/**
 * Función principal para cargar productos desde la API
 */
async function cargarProductosDesdeAPI(categoria = null, options = {}) {
  try {
    console.log(`🔍 Cargando productos desde API - Categoría: ${categoria || 'todas'}`);
    
    // Construir URL con parámetros
    const params = new URLSearchParams();
    
    if (categoria && categoria !== 'todos') {
      params.append('categoria', categoria);
    }
    
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.search) params.append('search', options.search);
    
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}?${params}`;
    
    console.log('📡 Fetching:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido del servidor');
    }
    
    console.log(`✅ ${data.productos.length} productos cargados desde API`);
    
    // Guardar en cache
    const cacheKey = `${categoria || 'all'}_${JSON.stringify(options)}`;
    productCache.set(cacheKey, data.productos);
    
    return data.productos;
    
  } catch (error) {
    console.error('❌ Error cargando productos desde API:', error);
    
    // Fallback: intentar cargar desde cache o mostrar mensaje de error
    const cacheKey = `${categoria || 'all'}_${JSON.stringify(options)}`;
    if (productCache.has(cacheKey)) {
      console.log('📦 Usando productos desde cache');
      return productCache.get(cacheKey);
    }
    
    // Si no hay cache, mostrar productos estáticos como fallback
    console.log('⚠️ Usando productos estáticos como fallback');
    return obtenerProductosEstaticos(categoria);
  }
}

/**
 * Función para obtener detalles de un producto específico
 */
async function obtenerDetalleProducto(productId) {
  try {
    console.log(`🔍 Obteniendo detalle del producto ID: ${productId}`);
    
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.detalle}/${productId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Producto no encontrado');
    }
    
    console.log(`✅ Detalle del producto obtenido:`, data.producto.nombre);
    return data.producto;
    
  } catch (error) {
    console.error('❌ Error obteniendo detalle del producto:', error);
    throw error;
  }
}

/**
 * Función para renderizar productos en el DOM
 */
function renderizarProductos(productos, containerId = 'products-container') {
  console.log(`🖼️ Renderizando ${productos.length} productos`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container ${containerId} no encontrado`);
    return;
  }
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  if (productos.length === 0) {
    container.innerHTML = `
      <div class="no-products-message">
        <i class="fas fa-search"></i>
        <h3>No se encontraron productos</h3>
        <p>Intenta cambiar los filtros o buscar algo diferente.</p>
      </div>
    `;
    return;
  }
  
  // Renderizar cada producto
  productos.forEach(producto => {
    const productCard = crearTarjetaProducto(producto);
    container.appendChild(productCard);
  });
  
  // Reinicializar eventos de carrito si existe la función
  if (typeof inicializarEventosCarrito === 'function') {
    inicializarEventosCarrito();
  }
  
  console.log(`✅ ${productos.length} productos renderizados exitosamente`);
}

/**
 * Crear tarjeta HTML para un producto
 */
function crearTarjetaProducto(producto) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product-id', producto.id);
  
  // Manejar imágenes
  const imagenPrincipal = producto.imagen_principal || '../../assets/images/placeholder-product.png';
  const imagenSecundaria = producto.imagen_secundaria || imagenPrincipal;
  
  // Etiquetas especiales
  let badges = '';
  if (producto.stockBajo) {
    badges += '<div class="stock-badge">¡Últimas unidades!</div>';
  }
  
  card.innerHTML = `
    ${badges}
    <div class="product-images">
      <img src="${imagenPrincipal}" alt="${producto.nombre}" class="main-image">
      ${producto.tieneImagenSecundaria ? `<img src="${imagenSecundaria}" alt="${producto.nombre}" class="hover-image">` : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${producto.nombre}</h3>
      ${producto.marca ? `<p class="product-brand">${producto.marca}</p>` : ''}
      ${producto.talle ? `<p class="product-size">Talle: ${producto.talle}</p>` : ''}
      <p class="product-price">${producto.precioFormateado}</p>
      <button class="add-to-cart-btn" onclick="agregarAlCarritoDesdeAPI('${producto.id}', '${producto.nombre}', ${producto.precio}, '${imagenPrincipal}')">
        <i class="fas fa-shopping-cart"></i> Añadir al carrito
      </button>
    </div>
  `;
  
  // Hacer la tarjeta clickeable para ver detalles
  card.addEventListener('click', (e) => {
    // No redirigir si se hizo click en el botón de carrito
    if (e.target.closest('.add-to-cart-btn')) {
      return;
    }
    
    // Redirigir a página de detalle (opcional)
    console.log(`🔗 Navegando a detalle del producto ID: ${producto.id}`);
    // window.location.href = `../detalle/producto.html?id=${producto.id}`;
  });
  
  return card;
}

/**
 * Función para agregar producto al carrito desde la API
 */
function agregarAlCarritoDesdeAPI(productId, nombre, precio, imagen) {
  const producto = {
    id: productId,
    nombre: nombre,
    precio: precio,
    imagen: imagen,
    categoria: 'Producto API'
  };
  
  // Usar la función de carrito existente si está disponible
  if (typeof agregarAlCarrito === 'function') {
    agregarAlCarrito(producto);
  } else {
    // Implementación básica de carrito
    let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
    
    const productoExistente = carrito.find(item => item.id === productId);
    
    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
    
    // Actualizar contador
    const contador = document.getElementById('cart-counter');
    if (contador) {
      const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
      contador.textContent = totalItems;
    }
    
    // Mostrar notificación
    mostrarNotificacionCarrito(`${nombre} agregado al carrito`);
  }
}

/**
 * Mostrar notificación simple
 */
function mostrarNotificacionCarrito(mensaje) {
  const notificacion = document.createElement('div');
  notificacion.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
  notificacion.style.cssText = `
    position: fixed; top: 100px; right: 20px; background: #27ae60;
    color: white; padding: 1rem 1.5rem; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000;
    display: flex; align-items: center; gap: 0.5rem;
  `;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transition = 'opacity 0.3s';
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

/**
 * Función fallback con productos estáticos
 */
function obtenerProductosEstaticos(categoria) {
  console.log('📦 Cargando productos estáticos como fallback');
  
  // Productos de ejemplo para cuando la API no esté disponible
  const productosEstaticos = [
    {
      id: 'static_1',
      nombre: 'Remera Básica',
      precio: 25000,
      precioFormateado: '$25.000 ARS',
      categoria: 'remeras',
      imagen_principal: '../../assets/images/pages/remeras/Remera_negra_1.png',
      imagen_secundaria: '../../assets/images/pages/remeras/Remera_negra_2.png',
      tieneImagenSecundaria: true,
      descripcion: 'Remera básica de algodón',
      stock: 5
    },
    {
      id: 'static_2',
      nombre: 'Buzo Cómodo',
      precio: 45000,
      precioFormateado: '$45.000 ARS',
      categoria: 'buzos',
      imagen_principal: '../../assets/images/pages/buzos/Buzo Basico Blanco 1.png',
      imagen_secundaria: '../../assets/images/pages/buzos/Buzo Basico Blanco 2.png',
      tieneImagenSecundaria: true,
      descripcion: 'Buzo cómodo para el día a día',
      stock: 3
    }
  ];
  
  // Filtrar por categoría si se especifica
  if (categoria && categoria !== 'todos') {
    return productosEstaticos.filter(p => p.categoria.includes(categoria.toLowerCase()));
  }
  
  return productosEstaticos;
}

/**
 * Función de inicialización para páginas de catálogo
 */
async function inicializarCatalogo(categoria = null, containerId = 'products-container') {
  try {
    console.log('🚀 Inicializando catálogo con API');
    
    // Mostrar indicador de carga
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando productos...</p>
        </div>
      `;
    }
    
    // Cargar productos
    const productos = await cargarProductosDesdeAPI(categoria);
    
    // Renderizar productos
    renderizarProductos(productos, containerId);
    
  } catch (error) {
    console.error('❌ Error inicializando catálogo:', error);
  }
}

// Exportar funciones para uso global
window.catalogAPI = {
  cargarProductos: cargarProductosDesdeAPI,
  renderizarProductos: renderizarProductos,
  obtenerDetalle: obtenerDetalleProducto,
  inicializar: inicializarCatalogo,
  agregarAlCarrito: agregarAlCarritoDesdeAPI
};

console.log('✅ Catalog API Manager listo para usar');