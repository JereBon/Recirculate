document.addEventListener("DOMContentLoaded", function() {
  // --- Cargar contador del carrito al inicio ---
  actualizarContadorCarrito();

  // --- Scroll suave al hacer click en el logo (cuando estás en el home) ---
  const logo = document.querySelector('.header-logo');
  
  if (logo) {
    let isScrolling = false; // Flag para controlar la animación
    let animationId = null; // ID de la animación para cancelarla
    
    // Detectar cuando el usuario scrollea manualmente para cancelar la animación
    const cancelScrollOnUserAction = () => {
      if (isScrolling) {
        isScrolling = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    };
    
    // Escuchar eventos de scroll manual (rueda del mouse, touch, etc)
    window.addEventListener('wheel', cancelScrollOnUserAction, { passive: true });
    window.addEventListener('touchstart', cancelScrollOnUserAction, { passive: true });
    
    logo.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Si ya hay una animación en curso, no iniciar otra
      if (isScrolling) return;
      
      isScrolling = true;
      const startTime = performance.now();
      const startScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const duration = 1000; // Duración en milisegundos (1 segundo)
      
      // Animación suave de scroll hacia arriba con easing
      const scrollToTop = (currentTime) => {
        if (!isScrolling) return; // Si fue cancelada, detener
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // De 0 a 1
        
        // Easing function (ease-out cubic) para desaceleración suave
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        // Calcular nueva posición
        const newScroll = startScroll * (1 - easeOutCubic);
        document.documentElement.scrollTop = newScroll;
        document.body.scrollTop = newScroll;
        
        // Continuar hasta llegar al tope
        if (progress < 1) {
          animationId = requestAnimationFrame(scrollToTop);
        } else {
          // Terminar exactamente en 0
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          isScrolling = false;
          animationId = null;
        }
      };
      
      animationId = requestAnimationFrame(scrollToTop);
      return false;
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

  // --- Buscador: delegar al comportamiento central definido en assets/pages.js ---
  // Eliminamos la implementación duplicada para usar la única fuente de la verdad.
  // Asegurarnos de que el overlay use la función global de cierre si está disponible.
  if (overlay) overlay.addEventListener('click', () => { closeSidebar(); if (window.closeSearchSidebar) window.closeSearchSidebar(); });
  
  // --- Lógica para el Contador del Carrito ---
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Evitar que se active el click del card
      
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

  // --- Lógica para hacer clickeables los product-cards del HOME ---
  const productCards = document.querySelectorAll('.product-card[data-product-name]');
  
  productCards.forEach(card => {
    // Hacer el card clickeable excepto el botón
    card.addEventListener('click', (e) => {
      // Si el click fue en el botón de añadir al carrito, no redirigir
      if (e.target.classList.contains('add-to-cart-btn') || 
          e.target.closest('.add-to-cart-btn')) {
        return;
      }
      
      const productName = card.getAttribute('data-product-name');
      const productSlug = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
      
      let productPath = '';
      const lowerName = productName.toLowerCase();
      
      // Detectar categoría por nombre de producto
      if (lowerName.includes('campera')) {
        productPath = `../productos/hombre/camperas/${productSlug}.html`;
      } else if (lowerName.includes('top')) {
        productPath = `../productos/mujer/remeras-tops/${productSlug}.html`;
      } else if (lowerName.includes('pollera')) {
        productPath = `../productos/mujer/polleras-shorts/${productSlug}.html`;
      } else if (lowerName.includes('vestido')) {
        productPath = `../productos/mujer/vestidos-monos/${productSlug}.html`;
      } else if (lowerName.includes('remera')) {
        productPath = `../productos/hombre/remeras/${productSlug}.html`;
      } else if (lowerName.includes('camisa')) {
        productPath = `../productos/hombre/camisas/${productSlug}.html`;
      }
      
      if (productPath) {
        window.location.href = productPath;
      }
    });
    
    // Añadir cursor pointer para indicar que es clickeable
    card.style.cursor = 'pointer';
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
  // La lógica de expansión/contracción de las categorías se maneja desde
  // `assets/pages.js` para evitar duplicación y posibles conflictos entre
  // manejadores. No registramos listeners adicionales aquí.

  // --- CARGAR PRODUCTOS DESTACADOS: INGRESOS Y DESCUENTOS ---
  cargarProductosDestacados();

});

// ============================================
// CARGAR PRODUCTOS EN HOME (INGRESOS Y DESCUENTOS)
// ============================================

async function cargarProductosDestacados() {
  const API_URL = 'https://recirculate-api.onrender.com/api/productos';
  
  try {
    // Hacer petición a la API
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al cargar productos');
    
    const productos = await response.json();
    console.log('📦 Productos cargados para home:', productos.length);

    // ===== SECCIÓN INGRESOS: Últimos 20 productos =====
    const productosIngresos = productos
      .sort((a, b) => {
        if (a.fecha_creacion && b.fecha_creacion) {
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        }
        return (b.id || 0) - (a.id || 0);
      })
      .slice(0, 20);

    const ingresosSection = document.querySelector('.ingresos-section');
    const ingresosContainer = ingresosSection.nextElementSibling; // La primera .featured-products-section
    
    if (ingresosContainer && ingresosContainer.classList.contains('featured-products-section')) {
      ingresosContainer.innerHTML = ''; // Limpiar
      
      if (productosIngresos.length > 0) {
        productosIngresos.forEach(producto => {
          const card = crearTarjetaProductoHome(producto);
          ingresosContainer.appendChild(card);
        });
      } else {
        ingresosContainer.innerHTML = '<p style="text-align: center; color: #666;">No hay ingresos recientes</p>';
      }
    }

    // ===== SECCIÓN DESCUENTOS: Productos con descuento > 0 (máximo 8) =====
    const productosDescuentos = productos
      .filter(p => {
        const descuento = parseFloat(p.descuento);
        return !isNaN(descuento) && descuento > 0;
      })
      .slice(0, 8);

    const discountSection = document.querySelector('.discount-section');
    const discountContainer = discountSection.nextElementSibling; // La segunda .featured-products-section
    
    if (discountContainer && discountContainer.classList.contains('featured-products-section')) {
      discountContainer.innerHTML = ''; // Limpiar
      
      if (productosDescuentos.length > 0) {
        productosDescuentos.forEach(producto => {
          const card = crearTarjetaProductoHome(producto);
          discountContainer.appendChild(card);
        });
      } else {
        discountContainer.innerHTML = '<p style="text-align: center; color: #666;">No hay productos con descuento</p>';
      }
    }

    console.log('✅ Productos destacados cargados en home');

  } catch (error) {
    console.error('❌ Error al cargar productos destacados:', error);
  }
}

// Función para crear tarjeta de producto en el home
function crearTarjetaProductoHome(producto) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Generar slug para URL del producto
  const slug = (producto.nombre || 'producto')
    .replace(/B&N/gi, 'BN')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Determinar ruta del producto según género y categoría
  let productPath = '';
  const genero = (producto.genero || '').toLowerCase();
  const categoria = (producto.categoria || '').toLowerCase();

  if (genero === 'hombre') {
    if (categoria === 'remeras') productPath = `../productos/hombre/remeras/${slug}.html`;
    else if (categoria === 'buzos') productPath = `../productos/hombre/buzos/${slug}.html`;
    else if (categoria === 'pantalones') productPath = `../productos/hombre/pantalones/${slug}.html`;
    else if (categoria === 'camperas') productPath = `../productos/hombre/camperas/${slug}.html`;
    else if (categoria === 'camisas') productPath = `../productos/hombre/camisas/${slug}.html`;
    else productPath = `../productos/hombre/remeras/${slug}.html`;
  } else if (genero === 'mujer') {
    if (categoria === 'remeras/tops') productPath = `../productos/mujer/remeras-tops/${slug}.html`;
    else if (categoria === 'vestidos/monos') productPath = `../productos/mujer/vestidos-monos/${slug}.html`;
    else if (categoria === 'polleras/shorts/skorts') productPath = `../productos/mujer/polleras-shorts/${slug}.html`;
    else productPath = `../productos/mujer/remeras-tops/${slug}.html`;
  } else {
    productPath = `../productos/unisex/${slug}.html`;
  }

  // Usar imagen_frente_url o imagen_url como imagen principal
  const imagenPrincipal = producto.imagen_frente_url || producto.imagen_url || '../assets/images/placeholder.png';
  const imagenHover = producto.imagen_espalda_url || producto.imagen_hover || imagenPrincipal;

  // Determinar si es nuevo (últimos 30 días)
  const esNuevo = producto.fecha_creacion && 
    (new Date() - new Date(producto.fecha_creacion)) / (1000 * 60 * 60 * 24) <= 30;

  // Escapar caracteres especiales
  const escaparHTML = (texto) => {
    if (!texto) return '';
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  const nombreEscapado = escaparHTML(producto.nombre || 'Sin nombre');
  const descripcionEscapada = escaparHTML(producto.descripcion || '');
  
  // Calcular precio con descuento SOLO si tiene descuento > 0
  const descuentoNumerico = parseFloat(producto.descuento);
  const tieneDescuento = !isNaN(descuentoNumerico) && descuentoNumerico > 0;
  const precioOriginal = producto.precio || 0;
  
  let precioConDescuento = precioOriginal;
  if (tieneDescuento) {
    precioConDescuento = Math.round(precioOriginal * (1 - descuentoNumerico / 100));
  }
  
  card.innerHTML = `
    <div class="product-images">
      <img src="${imagenPrincipal}" alt="${nombreEscapado}" class="main-image" loading="lazy">
      <img src="${imagenHover}" alt="${nombreEscapado} - Vista trasera" class="hover-image" loading="lazy">
      ${esNuevo ? '<span class="new-tag">NEW</span>' : ''}
      ${tieneDescuento ? `<span class="discount-tag">${Math.round(descuentoNumerico)}% OFF</span>` : ''}
    </div>
    <div class="product-info">
      <h3>${nombreEscapado}</h3>
      <p class="descripcion">${descripcionEscapada}</p>
      <p class="precio">
        ${tieneDescuento ? `
          <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; margin-right: 8px;">
            $${precioOriginal.toLocaleString('es-AR')}
          </span>
          <span style="color: #27ae60; font-weight: bold;">
            $${precioConDescuento.toLocaleString('es-AR')} ARS
          </span>
        ` : `<span style="color: #666;">$${precioOriginal.toLocaleString('es-AR')} ARS</span>`}
      </p>
      <button class="add-to-cart-btn" onclick="event.stopPropagation();">
        <i class="fas fa-shopping-cart"></i> Agregar al Carrito
      </button>
    </div>
  `;

  // Event listener para agregar al carrito
  const addToCartBtn = card.querySelector('.add-to-cart-btn');
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productoCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      precio: tieneDescuento ? precioConDescuento : producto.precio,
      imagen: imagenPrincipal,
      categoria: producto.categoria
    };
    
    agregarAlCarrito(productoCarrito);
  });

  // Hacer clickeable toda la tarjeta
  card.addEventListener('click', () => {
    window.location.href = productPath;
  });

  card.style.cursor = 'pointer';

  // Agregar clase de animación después de un breve delay para que sea visible
  setTimeout(() => {
    card.classList.add('animate-visible');
  }, 50);

  return card;
}
  
