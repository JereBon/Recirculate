document.addEventListener("DOMContentLoaded", function() {
  // --- Cargar contador del carrito al inicio ---
  actualizarContadorCarrito();

  // --- LÓGICA PARA EL CHATBOT FLOTANTE ---
  const chatbotContainer = document.querySelector('.chatbot-container');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');

  // Ocultar chatbot en la página de login (si este archivo se usara allí)
  // const isLoginPage = window.location.pathname.includes('login.html');
  // if (isLoginPage && chatbotContainer) {
  //   chatbotContainer.style.display = 'none';
  // } else if (chatbotContainer) {
    
  if (chatbotContainer) { // Asegura que el contenedor exista antes de añadir listeners
      // Mostrar/Ocultar ventana del chat al hacer clic en el globito
      if (chatbotToggle && chatbotWindow) {
          chatbotToggle.addEventListener('click', () => {
              chatbotWindow.classList.toggle('active');
          });
      }
      
      // Cerrar ventana del chat al hacer clic en la 'X'
      if (chatbotClose && chatbotWindow) {
          chatbotClose.addEventListener('click', () => {
              chatbotWindow.classList.remove('active');
          });
      }

      window.addEventListener('click', (event) => {
         if (chatbotWindow && chatbotWindow.classList.contains('active') && 
             !chatbotContainer.contains(event.target)) {
           chatbotWindow.classList.remove('active');
         }
       });
  }
  // --- FIN LÓGICA CHATBOT ---

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
});

// --- Lógica para el menú lateral anidado (Categorías) ---
  const categoryHeaders = document.querySelectorAll('.sidebar-category-header');

  categoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentCategory = header.closest('.sidebar-category');
      
      // Cerrar todos los demás submenús
      document.querySelectorAll('.sidebar-category').forEach(cat => {
        if (cat !== parentCategory) {
          cat.classList.remove('active');
        }
      });
      
      // Abrir o cerrar el submenú actual
      parentCategory.classList.toggle('active');
    });
  });

  