// producto-detalle.js - Funcionalidad para páginas de detalle de productos

document.addEventListener("DOMContentLoaded", function() {
    
    // --- Funciones del Carrito (reutilizadas) ---
    function agregarAlCarrito(producto) {
        let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
        const productoExistente = carrito.find(item => item.id === producto.id || item.nombre === producto.nombre);
        
        if (productoExistente) {
            productoExistente.cantidad += producto.cantidad;
        } else {
            carrito.push(producto);
        }
        
        localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
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
            position: fixed; top: 100px; right: 20px; background: #27ae60; color: white;
            padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000; display: flex; align-items: center; gap: 0.5rem; font-family: "Poppins", sans-serif;
            opacity: 1; transform: translateX(0); transition: all 0.3s ease-out;`;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.opacity = '0';
            notificacion.style.transform = 'translateX(400px)';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // Actualizar contador al cargar
    actualizarContadorCarrito();

    // --- Galería de imágenes ---
    const miniaturas = document.querySelectorAll('.miniatura');
    const imagenPrincipal = document.querySelector('.imagen-principal img');

    miniaturas.forEach(miniatura => {
        miniatura.addEventListener('click', function() {
            // Remover clase activa de todas las miniaturas
            miniaturas.forEach(m => m.classList.remove('activa'));
            
            // Agregar clase activa a la miniatura clickeada
            this.classList.add('activa');
            
            // Cambiar imagen principal
            const nuevaImagen = this.querySelector('img').src;
            imagenPrincipal.src = nuevaImagen;
        });
    });

    // --- Selector de talle con validación de disponibilidad ---
    const talleBtns = document.querySelectorAll('.talle-btn');
    let talleSeleccionado = null;
    let talleDisponible = null; // El talle real del producto
    let productoData = null; // Datos completos del producto

    // Escuchar evento de carga de datos del producto
    window.addEventListener('productoDataLoaded', (event) => {
        talleDisponible = event.detail.talleDisponible;
        productoData = event.detail.producto;
        console.log('📦 Datos del producto recibidos:', productoData);
    });

    // Obtener el talle disponible del producto desde un data attribute
    const talleActualElement = document.querySelector('[data-talle-disponible]');
    if (talleActualElement) {
        talleDisponible = talleActualElement.dataset.talleDisponible;
    }

    talleBtns.forEach(btn => {
        const talle = btn.dataset.talle;
        
        btn.addEventListener('click', function() {
            // Si no hay talle disponible definido, permitir selección libre
            if (!talleDisponible) {
                talleBtns.forEach(b => b.classList.remove('seleccionado'));
                this.classList.add('seleccionado');
                talleSeleccionado = this.dataset.talle;
                return;
            }
            
            // Verificar si el talle clickeado está disponible
            if (talle !== talleDisponible) {
                mostrarNotificacion('⚠️ Este talle no está disponible');
                return;
            }
            
            // Remover selección de todos los talles
            talleBtns.forEach(b => b.classList.remove('seleccionado'));
            
            // Seleccionar talle clickeado
            this.classList.add('seleccionado');
            talleSeleccionado = this.dataset.talle;
        });
        
        // Marcar talles no disponibles con estilo opaco
        if (talleDisponible && talle !== talleDisponible) {
            btn.classList.add('talle-no-disponible');
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        }
    });

    // --- Selector de cantidad con límite de stock ---
    const cantidadInput = document.getElementById('cantidad-input');
    const btnMenos = document.getElementById('btn-menos');
    const btnMas = document.getElementById('btn-mas');
    
    // Obtener stock disponible desde data attribute o del evento
    let stockDisponible = 999;
    
    const stockElement = document.querySelector('[data-stock-disponible]');
    if (stockElement) {
        stockDisponible = parseInt(stockElement.dataset.stockDisponible);
    }
    
    // Actualizar stock cuando se carguen los datos del producto
    window.addEventListener('productoDataLoaded', (event) => {
        stockDisponible = event.detail.stockDisponible || 999;
        actualizarEstadoBotones();
        console.log('📦 Stock disponible:', stockDisponible);
    });

    function actualizarEstadoBotones() {
        const cantidad = parseInt(cantidadInput.value);
        
        // Deshabilitar botón menos si cantidad es 1
        if (cantidad <= 1) {
            btnMenos.disabled = true;
            btnMenos.style.opacity = '0.3';
            btnMenos.style.cursor = 'not-allowed';
        } else {
            btnMenos.disabled = false;
            btnMenos.style.opacity = '1';
            btnMenos.style.cursor = 'pointer';
        }
        
        // Deshabilitar botón más si alcanzó el stock
        if (cantidad >= stockDisponible) {
            btnMas.disabled = true;
            btnMas.style.opacity = '0.3';
            btnMas.style.cursor = 'not-allowed';
            btnMas.style.backgroundColor = '#ccc';
        } else {
            btnMas.disabled = false;
            btnMas.style.opacity = '1';
            btnMas.style.cursor = 'pointer';
            btnMas.style.backgroundColor = '';
        }
    }

    if (btnMenos && btnMas && cantidadInput) {
        btnMenos.addEventListener('click', () => {
            let cantidad = parseInt(cantidadInput.value);
            if (cantidad > 1) {
                cantidadInput.value = cantidad - 1;
                actualizarEstadoBotones();
            }
        });

        btnMas.addEventListener('click', () => {
            let cantidad = parseInt(cantidadInput.value);
            if (cantidad < stockDisponible) {
                cantidadInput.value = cantidad + 1;
                actualizarEstadoBotones();
            } else {
                mostrarNotificacion(`⚠️ Stock máximo disponible: ${stockDisponible} unidades`);
            }
        });

        // Validar input manual
        cantidadInput.addEventListener('input', () => {
            let valor = parseInt(cantidadInput.value);
            if (isNaN(valor) || valor < 1) {
                cantidadInput.value = 1;
            } else if (valor > stockDisponible) {
                cantidadInput.value = stockDisponible;
                mostrarNotificacion(`⚠️ Stock máximo disponible: ${stockDisponible} unidades`);
            }
            actualizarEstadoBotones();
        });
        
        // Inicializar estado de botones
        actualizarEstadoBotones();
    }

    // --- Botón Agregar al Carrito ---
    const btnAgregarCarrito = document.querySelector('.btn-agregar-carrito');
    if (btnAgregarCarrito) {
        btnAgregarCarrito.addEventListener('click', () => {
            // Validar que se haya seleccionado un talle
            if (!talleSeleccionado) {
                mostrarNotificacion('⚠️ Por favor selecciona un talle');
                return;
            }

            // Obtener datos del producto
            const nombre = document.querySelector('.producto-info h1').textContent;
            const precioTexto = document.querySelector('.producto-precio').textContent;
            const precio = parseFloat(precioTexto.replace(/[^\d]/g, ''));
            const imagen = document.querySelector('.imagen-principal img').src;
            const cantidad = parseInt(cantidadInput.value);

            const producto = {
                id: `prod_${Date.now()}`,
                nombre: `${nombre} - Talle ${talleSeleccionado}`,
                precio: precio,
                imagen: imagen,
                cantidad: cantidad,
                talle: talleSeleccionado
            };

            agregarAlCarrito(producto);
            mostrarNotificacion(`✓ ${cantidad}x ${nombre} agregado al carrito`);
        });
    }

    // --- Botón Comprar Ahora ---
    const btnComprarAhora = document.querySelector('.btn-comprar-ahora');
    if (btnComprarAhora) {
        btnComprarAhora.addEventListener('click', () => {
            // Validar que se haya seleccionado un talle
            if (!talleSeleccionado) {
                mostrarNotificacion('⚠️ Por favor selecciona un talle');
                return;
            }

            // Obtener datos del producto
            const nombre = document.querySelector('.producto-info h1').textContent;
            const precioTexto = document.querySelector('.producto-precio').textContent;
            const precio = parseFloat(precioTexto.replace(/[^\d]/g, ''));
            const imagen = document.querySelector('.imagen-principal img').src;
            const cantidad = parseInt(cantidadInput.value);

            const producto = {
                id: `prod_${Date.now()}`,
                nombre: `${nombre} - Talle ${talleSeleccionado}`,
                precio: precio,
                imagen: imagen,
                cantidad: cantidad,
                talle: talleSeleccionado
            };

            agregarAlCarrito(producto);
            
            // Redirigir al carrito
            // Para productos/hombre/pantalones/producto.html -> ../../../carrito/carrito.html
            // Para productos/unisex/producto.html -> ../../carrito/carrito.html
            
            window.location.href = '../../../carrito/carrito.html';
        });
    }

    // --- Botones de compartir ---
    const compartirBtns = document.querySelectorAll('.compartir-btn');
    compartirBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            const nombre = document.querySelector('.producto-info h1').textContent;
            
            if (btn.classList.contains('facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            } else if (btn.classList.contains('twitter')) {
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${nombre}`, '_blank');
            } else if (btn.classList.contains('whatsapp')) {
                window.open(`https://wa.me/?text=${nombre} ${url}`, '_blank');
            }
        });
    });

    // --- Registrar visita al producto en el historial ---
    function registrarVisitaProducto() {
        // Verificar si el usuario está logueado
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        // Obtener datos del producto actual
        const nombreElement = document.querySelector('.producto-info h1');
        const precioElement = document.querySelector('.producto-precio');
        const imagenElement = document.querySelector('.imagen-principal img');
        
        if (!nombreElement || !precioElement || !imagenElement) return;

        const nombre = nombreElement.textContent.trim();
        const precioTexto = precioElement.textContent.trim();
        const precio = parseFloat(precioTexto.replace(/[^\d]/g, ''));
        const imagenUrl = imagenElement.src;
        
        // Determinar la categoría desde la URL o el breadcrumb
        let categoria = 'remeras'; // default
        const breadcrumbs = document.querySelectorAll('.breadcrumb-item a');
        if (breadcrumbs.length >= 3) {
            const categoriaElement = breadcrumbs[breadcrumbs.length - 1];
            const categoriaText = categoriaElement.textContent.toLowerCase().trim();
            categoria = categoriaText;
        }

        // Crear objeto del producto
        const producto = {
            id: `prod_${Date.now()}_${nombre.replace(/\s+/g, '_')}`,
            nombre: nombre,
            imagen_url: imagenUrl,
            precio: precio,
            categoria: categoria
        };

        // Esperar a que el userMenuManager esté disponible
        const intentarRegistrar = () => {
            if (window.userMenuManager) {
                window.userMenuManager.trackProductVisit(producto);
            } else {
                // Reintentar después de un breve delay
                setTimeout(intentarRegistrar, 100);
            }
        };
        
        intentarRegistrar();
    }

    // Registrar la visita cuando la página carga
    registrarVisitaProducto();

});
