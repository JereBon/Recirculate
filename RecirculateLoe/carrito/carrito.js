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

    // Funcionalidad del buscador
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');

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

  // Finalizar compra con validación mejorada
  async finalizarCompra() {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const btnFinalizar = document.getElementById('btn-finalizar');
    const textoOriginal = btnFinalizar.innerHTML;
    
    try {
      // Verificar autenticación
      const token = localStorage.getItem('recirculate_token');
      if (!token) {
        this.mostrarModalLogin();
        return;
      }

      // Paso 1: Validar carrito
      btnFinalizar.disabled = true;
      btnFinalizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando productos...';

      const validationResponse = await fetch('/api/checkout/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: this.carrito.map(item => ({
            id: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            nombre: item.nombre
          }))
        })
      });

      const validationData = await validationResponse.json();

      if (!validationData.success) {
        this.mostrarErroresValidacion(validationData);
        btnFinalizar.disabled = false;
        btnFinalizar.innerHTML = textoOriginal;
        return;
      }

      // Paso 2: Crear preferencia de MercadoPago
      btnFinalizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando pago...';

      const items = this.carrito.map(item => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio,
        currency_id: 'ARS',
        picture_url: item.imagen
      }));

      const paymentResponse = await fetch('/api/pagos/preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          items,
          external_reference: `cart_${Date.now()}_${this.carrito.length}items`
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok) {
        // Guardar info de la compra para después del pago
        localStorage.setItem('pending_purchase', JSON.stringify({
          items: this.carrito,
          preference_id: paymentData.preference_id,
          timestamp: Date.now()
        }));

        // Redirigir al checkout de MercadoPago
        window.location.href = paymentData.sandbox_init_point;
      } else {
        throw new Error(paymentData.error || 'Error creando preferencia de pago');
      }

    } catch (error) {
      console.error('❌ Error al finalizar la compra:', error);
      this.mostrarError(error.message || 'Hubo un problema al procesar tu compra. Inténtalo de nuevo.');
      btnFinalizar.disabled = false;
      btnFinalizar.innerHTML = textoOriginal;
    }
  }

  // Mostrar modal de login
  mostrarModalLogin() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-lock"></i> Iniciar Sesión Requerido</h3>
        </div>
        <div class="modal-body">
          <p>Para continuar con tu compra necesitas iniciar sesión o crear una cuenta.</p>
          <div class="modal-benefits">
            <div class="benefit-item">
              <i class="fas fa-shield-alt"></i>
              <span>Compra segura y protegida</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-history"></i>
              <span>Historial de compras</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-truck"></i>
              <span>Seguimiento de envíos</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" onclick="this.closest('.checkout-modal').remove()">
            Cancelar
          </button>
          <a href="../../auth/login.html" class="btn-primary">
            <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Mostrar errores de validación del carrito
  mostrarErroresValidacion(validationData) {
    const errores = validationData.validation_results
      .filter(item => !item.valid)
      .map(item => `• ${item.error}`)
      .join('\n');

    const modal = document.createElement('div');
    modal.className = 'checkout-modal error-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header error">
          <h3><i class="fas fa-exclamation-triangle"></i> Problemas con tu Carrito</h3>
        </div>
        <div class="modal-body">
          <p>Algunos productos en tu carrito tienen problemas:</p>
          <div class="error-list">
            ${errores.split('\n').map(error => `<div class="error-item">${error}</div>`).join('')}
          </div>
          <p><small>Te recomendamos actualizar tu carrito y volver a intentar.</small></p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" onclick="window.location.reload()">
            <i class="fas fa-sync"></i> Actualizar Carrito
          </button>
          <button class="btn-secondary" onclick="this.closest('.checkout-modal').remove()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Mostrar error genérico
  mostrarError(mensaje) {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal error-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header error">
          <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
        </div>
        <div class="modal-body">
          <p>${mensaje}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" onclick="this.closest('.checkout-modal').remove()">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new CarritoManager();
});
