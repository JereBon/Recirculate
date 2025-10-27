document.addEventListener("DOMContentLoaded", function() {
  // --- Cargar contador del carrito al inicio ---
  actualizarContadorCarrito();

  // --- Scroll suave al hacer click en el logo ---
  const logo = document.querySelector('.header-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Si ya estamos en el home, hace scroll suave. Si no, navega.
      if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.location.href = '/home/home.html';
      }
    });
  }

  // --- Lógica para el efecto de cambio de palabras ---
  const words = document.querySelectorAll('.word');
  if (words.length > 0) {
    let currentIndex = 0;
    function changeWord() {
      const currentWord = words[currentIndex];
      const nextIndex = (currentIndex + 1) % words.length;
      const nextWord = words[nextIndex];

      currentWord.classList.remove('active');
      setTimeout(() => {
        nextWord.classList.add('active');
        currentIndex = nextIndex;
      }, 800);
    }
    setInterval(changeWord, 5000);
  }

  // --- Lógica para el panel lateral (Sidebar) ---
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const sidebar = document.getElementById('sidebar-menu');
  const body = document.body;
  const overlay = document.querySelector('.overlay');

  function openSidebar() {
    sidebar.classList.add('open');
    body.classList.add('sidebar-active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    body.classList.remove('sidebar-active');
  }

  if (menuBtn) menuBtn.addEventListener('click', (event) => { event.stopPropagation(); openSidebar(); });
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  window.addEventListener('click', (event) => {
    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
      closeSidebar();
    }
  });

  // --- Lógica para el Buscador Integrado ---
  const searchContainer = document.getElementById('search-container');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const isExpanded = searchContainer.classList.contains('active');
      if (isExpanded && searchInput.value !== '') {
        performSearch(searchInput.value.trim());
      } else {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
          searchInput.focus();
        }
      }
    });
  }

  // Buscar al presionar Enter
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        performSearch(searchInput.value.trim());
      }
    });
  }

  // Función para realizar la búsqueda
  function performSearch(query) {
    const searchTerm = query.toLowerCase();
    
    // Mapeo de términos de búsqueda a páginas
    const searchMap = {
      'remera': '../pages/remeras/remeras.html',
      'remeras': '../pages/remeras/remeras.html',
      'pantalon': '../pages/pantalones/pantalones.html',
      'pantalones': '../pages/pantalones/pantalones.html',
      'buzo': '../pages/buzos/buzos.html',
      'buzos': '../pages/buzos/buzos.html',
      'camisa': '../pages/camisas/camisas.html',
      'camisas': '../pages/camisas/camisas.html',
      'campera': '../pages/camperas/camperas.html',
      'camperas': '../pages/camperas/camperas.html',
      'jacket': '../pages/camperas/camperas.html',
      'hoodie': '../pages/buzos/buzos.html',
      'sudadera': '../pages/buzos/buzos.html',
      'polo': '../pages/camisas/camisas.html',
      'shirt': '../pages/remeras/remeras.html',
      'jean': '../pages/pantalones/pantalones.html',
      'jeans': '../pages/pantalones/pantalones.html',
      'jogger': '../pages/pantalones/pantalones.html'
    };

    // Buscar coincidencia exacta
    if (searchMap[searchTerm]) {
      window.location.href = searchMap[searchTerm];
      return;
    }

    // Buscar coincidencias parciales
    for (const [key, url] of Object.entries(searchMap)) {
      if (key.includes(searchTerm) || searchTerm.includes(key)) {
        window.location.href = url;
        return;
      }
    }

    // Si no encuentra nada, mostrar mensaje
    alert(`No se encontraron resultados para "${query}". Intenta buscar: remeras, pantalones, buzos, camisas o camperas.`);
  }
  
  // --- Lógica para el Contador del Carrito ---
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Obtener información del producto desde el DOM
      const productCard = button.closest('.product-card');
      const nombre = productCard.querySelector('h3').textContent;
      const precioTexto = productCard.querySelector('.precio').textContent;
      const precio = parseFloat(precioTexto.replace(/[^\d]/g, ''));
      const imagen = productCard.querySelector('.main-image').src;
      
      // Crear objeto producto
      const producto = {
        id: `prod_${Date.now()}_${index}`, // ID único basado en timestamp
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        categoria: 'Ropa usada' // Puedes agregar más metadata después
      };
      
      // Agregar al carrito usando la función de utils.js
      agregarAlCarrito(producto);
    });
  });

  // ============================================
// FUNCIONES DEL CARRITO (copiadas de utils.js para compatibilidad)
// ============================================

function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
  
  const productoExistente = carrito.find(item => item.id === producto.id);
  
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }
  
  localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarNotificacion('✓ Producto agregado al carrito');
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  const contador = document.getElementById('cart-counter');
  if (contador) {
    contador.textContent = totalItems;
  }
}

function mostrarNotificacion(mensaje) {
  const notificacion = document.createElement('div');
  notificacion.innerHTML = `<i class="fas fa-check-circle"></i><span>${mensaje}</span>`;
  
  notificacion.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Poppins", sans-serif;
  `;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateX(400px)';
    notificacion.style.transition = 'all 0.3s ease-out';
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}
  // --- Lógica para la animación al hacer scroll ---
  function setupScrollAnimation() {
    const elementsToAnimate = document.querySelectorAll('.product-card, .carrusel-item, .benefit-item');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(el => {
      observer.observe(el);
    });
  }

  setupScrollAnimation();

  // --- CARGAR PRODUCTOS DINÁMICOS ---
  loadFeaturedProducts();
  loadLatestProducts();
  
  // Configurar evento de cierre del modal
  const modal = document.getElementById('gender-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeGenderModal();
      }
    });
  }
});

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = "https://recirculate-api.onrender.com/api";

// --- FUNCIÓN GLOBAL PARA AÑADIR AL CARRITO ---
function addToCart(id, nombre, precio) {
  const producto = {
    id: id,
    nombre: nombre,
    precio: precio,
    cantidad: 1
  };
  
  // Obtener carrito actual del localStorage
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar si el producto ya existe en el carrito
  const productoExistente = carrito.find(item => item.id === id);
  
  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push(producto);
  }
  
  // Guardar carrito actualizado
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Actualizar contador visual si existe
  updateCartCounter();
  
  // Mostrar mensaje de confirmación
  alert(`${nombre} añadido al carrito!`);
}

// --- FUNCIÓN PARA ACTUALIZAR CONTADOR DEL CARRITO ---
function updateCartCounter() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
  
  const counter = document.querySelector('.cart-counter');
  if (counter) {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

// --- FUNCIONES PARA CARGAR PRODUCTOS ---
async function loadFeaturedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/categoria/destacados`);
    if (!response.ok) throw new Error('Error al cargar productos destacados');
    
    const productos = await response.json();
    renderProducts(productos, 'featured-products-grid', true);
  } catch (error) {
    console.error('Error cargando productos destacados:', error);
    document.getElementById('featured-products-grid').innerHTML = 
      '<div class="error-message">Error al cargar productos destacados</div>';
  }
}

async function loadLatestProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/productos?limit=6`);
    if (!response.ok) throw new Error('Error al cargar últimos productos');
    
    let productos = await response.json();
    // Tomar solo los últimos 6 productos
    productos = productos.slice(0, 6);
    renderProducts(productos, 'latest-products-grid', false);
  } catch (error) {
    console.error('Error cargando últimos productos:', error);
    document.getElementById('latest-products-grid').innerHTML = 
      '<div class="error-message">Error al cargar productos</div>';
  }
}

function renderProducts(productos, containerId, isDestacados = false) {
  const container = document.getElementById(containerId);
  
  if (!productos || productos.length === 0) {
    container.innerHTML = '<div class="no-products-message">No hay productos disponibles</div>';
    return;
  }

  const productHTML = productos.map(producto => {
    const imageUrl = producto.imagen_url || '../assets/images/placeholder.png';
    const precio = producto.precio ? `$${producto.precio.toLocaleString()} ARS` : 'Consultar precio';
    const descuentoTag = isDestacados ? '<div class="destacado-tag">⭐ DESTACADO</div>' : '';
    const generoTag = `<div class="genero-tag genero-${producto.genero?.toLowerCase()}">${producto.genero || ''}</div>`;
    
    return `
      <div class="product-card" data-product-id="${producto.id}">
        ${descuentoTag}
        ${generoTag}
        <div class="product-images">
          <img src="${imageUrl}" alt="${producto.nombre}" class="main-image" 
               onerror="this.src='../assets/images/placeholder.png'">
        </div>
        <h3>${producto.nombre}</h3>
        <p class="precio">${precio}</p>
        <p class="product-details">
          ${producto.marca ? `<span class="marca">${producto.marca}</span>` : ''}
          ${producto.talle ? `<span class="talle">Talle: ${producto.talle}</span>` : ''}
          ${producto.color ? `<span class="color">Color: ${producto.color}</span>` : ''}
        </p>
        <p class="stock-info">Stock: ${producto.stock || 0}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${producto.id}, '${producto.nombre}', ${producto.precio || 0})">
          Añadir al carrito
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = productHTML;
}

// --- FUNCIONES PARA PRODUCTOS POR GÉNERO ---
async function loadGenderProducts(genero) {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/genero/${genero}`);
    if (!response.ok) throw new Error(`Error al cargar productos para ${genero}`);
    
    const productos = await response.json();
    showGenderModal(genero, productos);
  } catch (error) {
    console.error(`Error cargando productos para ${genero}:`, error);
    showGenderModal(genero, []);
  }
}

function showGenderModal(genero, productos) {
  const modal = document.getElementById('gender-modal');
  const title = document.getElementById('gender-modal-title');
  const grid = document.getElementById('gender-products-grid');
  
  title.textContent = `Productos para ${genero}`;
  
  if (!productos || productos.length === 0) {
    grid.innerHTML = '<div class="no-products-message">No hay productos disponibles para esta categoría</div>';
  } else {
    renderProducts(productos, 'gender-products-grid', false);
  }
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeGenderModal() {
  const modal = document.getElementById('gender-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}