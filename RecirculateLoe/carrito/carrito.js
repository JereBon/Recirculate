// carrito.js - Lógica del carrito de compras

// Clase para manejar el carrito
class CarritoManager {
constructor() {
    this.carrito = this.cargarCarrito();
    this.init();
}

  // Cargar carrito desde localStorage
cargarCarrito() {
    const carritoGuardado = localStorage.getItem('recirculate_carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

  // Guardar carrito en localStorage
guardarCarrito() {
    localStorage.setItem('recirculate_carrito', JSON.stringify(this.carrito));
}

  // Inicializar la página del carrito
init() {
    this.renderizarCarrito();
    this.actualizarContador();
    this.configurarEventos();
}

  // Renderizar todos los items del carrito
renderizarCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const itemsList = document.getElementById('items-list');

    if (this.carrito.length === 0) {
    carritoVacio.style.display = 'block';
    carritoContenido.style.display = 'none';
    } else {
    carritoVacio.style.display = 'none';
    carritoContenido.style.display = 'grid';
    
    itemsList.innerHTML = '';
    this.carrito.forEach((item, index) => {
        itemsList.innerHTML += this.crearItemHTML(item, index);
    });

    this.actualizarResumen();
    }
}

  // Crear HTML para un item del carrito
crearItemHTML(item, index) {
    return `
    <div class="cart-item" data-index="${index}">
        <div class="cart-item-image">
        <img src="${item.imagen}" alt="${item.nombre}">
        </div>
        <div class="cart-item-info">
          <h3>${item.nombre}</h3>
          <p class="item-categoria">${item.categoria || 'Ropa usada'}</p>
          <p class="cart-item-precio">$${this.formatearPrecio(item.precio)}</p>
        </div>
        <div class="cart-item-actions">
          <button class="btn-remove" data-index="${index}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
          <div class="quantity-control">
            <button class="quantity-btn btn-decrease" data-index="${index}">-</button>
            <input type="number" class="quantity-input" value="${item.cantidad}" min="1" readonly>
            <button class="quantity-btn btn-increase" data-index="${index}">+</button>
          </div>
        </div>
      </div>
    `;
  }

  // Configurar eventos
  configurarEventos() {
    // Eventos de eliminar
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove')) {
        const index = parseInt(e.target.closest('.btn-remove').dataset.index);
        this.eliminarItem(index);
      }
    });

    // Eventos de cantidad
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-increase')) {
        const index = parseInt(e.target.closest('.btn-increase').dataset.index);
        this.aumentarCantidad(index);
      }
      if (e.target.closest('.btn-decrease')) {
        const index = parseInt(e.target.closest('.btn-decrease').dataset.index);
        this.disminuirCantidad(index);
      }
    });

    // Evento de finalizar compra
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
      btnFinalizar.addEventListener('click', () => this.finalizarCompra());
    }

    // Eventos del sidebar
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.querySelector('.overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.add('open');
        document.body.classList.add('sidebar-active');
    });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-active');
      });
    }

    // Funcionalidad del menú desplegable (categorías)
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

    // Funcionalidad del buscador: delegar al buscador unificado en assets/pages.js
    // Si la API global está presente (window.openSearchSidebar / window.performSidebarSearch)
    // la usamos; en caso contrario, conservamos el comportamiento antiguo como fallback.
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');

    if (window && typeof window.openSearchSidebar === 'function' && typeof window.performSidebarSearch === 'function') {
      // Usar el sidebar unificado
      if (searchBtn) {
        searchBtn.addEventListener('click', (e) => { e.stopPropagation(); window.openSearchSidebar(); });
      }
      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            window.performSidebarSearch(searchInput.value.trim());
          }
        });
      }
      // Evitar que clics globales cierren el nuevo sidebar aquí — pages.js ya gestiona eso
    } else {
      // Fallback: comportamiento antiguo (toggler inline)
      if (searchBtn && searchContainer && searchInput) {
        searchBtn.addEventListener('click', function() {
          searchContainer.classList.toggle('active');
          if (searchContainer.classList.contains('active')) {
            searchInput.focus();
          }
        });

        // Cerrar búsqueda al hacer clic fuera
        document.addEventListener('click', function(e) {
          if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove('active');
          }
        });
      }
    }
  }

  // Eliminar item del carrito
  eliminarItem(index) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.carrito.splice(index, 1);
      this.guardarCarrito();
      this.renderizarCarrito();
      this.actualizarContador();
    }
  }

  // Aumentar cantidad
  aumentarCantidad(index) {
    this.carrito[index].cantidad++;
    this.guardarCarrito();
    this.renderizarCarrito();
    this.actualizarContador();
  }

  // Disminuir cantidad
  disminuirCantidad(index) {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
      this.guardarCarrito();
      this.renderizarCarrito();
      this.actualizarContador();
    }
  }

  // Actualizar resumen de compra
  actualizarResumen() {
    const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const subtotal = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Calcular envío
    const envioGratis = subtotal >= 120000;
    const costoEnvio = envioGratis ? 0 : 5000;

    // Calcular descuento (ejemplo: 10% si paga por transferencia)
    const descuento = 0; // Por ahora sin descuento

    const total = subtotal + costoEnvio - descuento;

    // Actualizar HTML
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('resumen-items').textContent = totalItems;
    document.getElementById('resumen-subtotal').textContent = `$${this.formatearPrecio(subtotal)}`;
    
    const resumenEnvio = document.getElementById('resumen-envio');
    if (envioGratis) {
      resumenEnvio.textContent = 'GRATIS';
      resumenEnvio.className = 'envio-gratis';
    } else {
      resumenEnvio.textContent = `$${this.formatearPrecio(costoEnvio)}`;
      resumenEnvio.className = '';
    }

    document.getElementById('resumen-total').textContent = `$${this.formatearPrecio(total)}`;
  }

  // Actualizar contador del carrito en el header
  actualizarContador() {
    const contador = document.getElementById('cart-counter');
    const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (contador) {
      contador.textContent = totalItems;
    }
  }

  // Formatear precio
  formatearPrecio(precio) {
    return precio.toLocaleString('es-AR', { minimumFractionDigits: 0 });
  }

  // Finalizar compra con MercadoPago
  async finalizarCompra() {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const btnFinalizar = document.getElementById('btn-finalizar');
    btnFinalizar.disabled = true;
    btnFinalizar.textContent = 'Procesando...';

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Debes iniciar sesión para continuar con la compra.');
        window.location.href = '../auth/login.html';
        return;
      }

      const items = this.carrito.map(item => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio,
        currency_id: 'ARS'
      }));

      const response = await fetch('/api/pagos/preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirigir al checkout de MercadoPago
        window.location.href = data.sandbox_init_point;
      } else {
        // Mostrar error de stock u otro error del backend
        alert(`Error: ${data.error || 'No se pudo procesar el pago.'}`);
        btnFinalizar.disabled = false;
        btnFinalizar.textContent = 'Finalizar Compra';
      }
    } catch (error) {
      console.error('Error al finalizar la compra:', error);
      alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
      btnFinalizar.disabled = false;
      btnFinalizar.textContent = 'Finalizar Compra';
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new CarritoManager();
});
