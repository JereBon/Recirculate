document.addEventListener("DOMContentLoaded", function() {
    // --- Lógica del Logo (CORREGIDA) ---
    const logo = document.querySelector('.header-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.stopPropagation();

            const isHomePage = window.location.pathname.includes('home.html') || window.location.pathname.endsWith('/');

            if (isHomePage) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.location.href = '../home/home.html';
            }
        });
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

    // --- Lógica del menú lateral anidado (Categorías) ---
    const categoryHeaders = document.querySelectorAll('.sidebar-category-header');

    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parentCategory = header.closest('.sidebar-category');
            
            document.querySelectorAll('.sidebar-category').forEach(cat => {
                if (cat !== parentCategory) {
                    cat.classList.remove('active');
                }
            });
            
            parentCategory.classList.toggle('active');
        });
    });


    // --- Lógica para el Buscador Integrado ---
    const searchContainer = document.getElementById('search-container');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    function performSearch(query) {
        const searchTerm = query.toLowerCase();
        const searchMap = {
            'remera': '../remeras/remeras.html', 'remeras': '../remeras/remeras.html',
            'pantalon': '../pantalones/pantalones.html', 'pantalones': '../pantalones/pantalones.html',
            'buzo': '../buzos/buzos.html', 'buzos': '../buzos/buzos.html',
            'camisa': '../camisas/camisas.html', 'camisas': '../camisas/camisas.html',
            'campera': '../camperas/camperas.html', 'camperas': '../camperas/camperas.html',
            'jacket': '../camperas/camperas.html', 'hoodie': '../buzos/buzos.html',
            'sudadera': '../buzos/buzos.html', 'polo': '../camisas/camisas.html',
            'shirt': '../remeras/remeras.html', 'jean': '../pantalones/pantalones.html',
            'jeans': '../pantalones/pantalones.html', 'jogger': '../pantalones/pantalones.html',
            'home': '../home/home.html', 'inicio': '../home/home.html'
        };

        if (searchMap[searchTerm]) {
            window.location.href = searchMap[searchTerm];
            return;
        }
        for (const [key, url] of Object.entries(searchMap)) {
            if (key.includes(searchTerm) || searchTerm.includes(key)) {
                window.location.href = url;
                return;
            }
        }
        alert(`No se encontraron resultados para "${query}". Intenta buscar: remeras, pantalones, buzos, camisas o camperas.`);
    }

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

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                performSearch(searchInput.value.trim());
            }
        });
    }

    // --- Lógica de Ordenamiento (CORREGIDA) ---
    const ordenarSelect = document.getElementById('ordenar');
    const productGrid = document.querySelector('.product-grid');

    if (ordenarSelect && productGrid) {
        
        // **CORRECCIÓN CLAVE:** Función para asignar data-atributos al cargar la página
        function assignProductData() {
            productGrid.querySelectorAll('.product-card').forEach(card => {
                const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
                const descuentoTag = card.querySelector('.discount-tag')?.textContent || '0%';
                
                // Extracción de valores numéricos:
                // Precio: Elimina todo lo que no sea dígito, coma o punto, luego lo convierte a número.
                const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
                card.dataset.precio = precio;
                
                // Descuento: Extrae solo el número del porcentaje.
                const descuento = parseFloat(descuentoTag.replace(/[^0-9.]/g, '')) || 0;
                card.dataset.descuento = descuento;
            });
        }

        // Ejecutar asignación de datos al cargar:
        assignProductData();


        ordenarSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });

        function sortProducts(criteria) {
            const products = Array.from(productGrid.querySelectorAll('.product-card'));
            
            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.precio);
                const priceB = parseFloat(b.dataset.precio);
                const discountA = parseFloat(a.dataset.descuento);
                const discountB = parseFloat(b.dataset.descuento);

                switch (criteria) {
                    case 'precio-asc':
                        return priceA - priceB;
                    case 'precio-desc':
                        return priceB - priceA;
                    case 'descuento-asc':
                        return discountA - discountB;
                    case 'descuento-desc':
                        return discountB - discountA;
                    default:
                        return 0;
                }
            });

            // Reinsertar productos en el orden ordenado
            products.forEach(card => {
                productGrid.appendChild(card);
            });
        }
    }
    
    // --- Lógica para la animación al hacer scroll ---
    // (Mantenida)
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

// ============================================
// FUNCIONES DEL CARRITO (Mantener el bloque tal cual lo enviaste)
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