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

    // --- Selector de talle ---
    const talleBtns = document.querySelectorAll('.talle-btn');
    let talleSeleccionado = null;

    talleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover selección de todos los talles
            talleBtns.forEach(b => b.classList.remove('seleccionado'));
            
            // Seleccionar talle clickeado
            this.classList.add('seleccionado');
            talleSeleccionado = this.dataset.talle;
        });
    });

    // --- Selector de cantidad ---
    const cantidadInput = document.getElementById('cantidad-input');
    const btnMenos = document.getElementById('btn-menos');
    const btnMas = document.getElementById('btn-mas');

    if (btnMenos && btnMas && cantidadInput) {
        btnMenos.addEventListener('click', () => {
            let cantidad = parseInt(cantidadInput.value);
            if (cantidad > 1) {
                cantidadInput.value = cantidad - 1;
            }
        });

        btnMas.addEventListener('click', () => {
            let cantidad = parseInt(cantidadInput.value);
            cantidadInput.value = cantidad + 1;
        });

        // Validar input manual
        cantidadInput.addEventListener('input', () => {
            let valor = parseInt(cantidadInput.value);
            if (isNaN(valor) || valor < 1) {
                cantidadInput.value = 1;
            }
        });
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

});
